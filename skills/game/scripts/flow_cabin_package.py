#!/usr/bin/env python3
"""Validate and package an offline Flow Cabin game using only the stdlib."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import stat
import sys
import tempfile
import zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

MAX_FILES = 1_000
MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024
MAX_ZIP_BYTES = 25 * 1024 * 1024
ALLOWED_SUFFIXES = {".html", ".css", ".js", ".json", ".svg", ".png", ".webp"}
COVER_SUFFIXES = {".svg", ".png", ".webp"}
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VERSION_RE = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$"
)
HASH_RE = re.compile(r"^[0-9a-f]{64}$")
REMOTE_LITERAL_RE = re.compile(r"""(?i)['"`]\s*(?:https?:|//|data:|blob:|ftp:)""")
CSS_IMPORT_RE = re.compile(r"(?i)@import\b")
CSS_URL_RE = re.compile(r"""(?is)url\(\s*(['"]?)(.*?)\1\s*\)""")
JS_BANNED = {
    "network request": re.compile(
        r"\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*(?:\(|\b)"
    ),
    "dynamic import": re.compile(r"\bimport\s*\("),
    "evaluation": re.compile(r"\b(?:eval|Function)\s*\("),
    "service worker": re.compile(r"\bserviceWorker\b"),
    "fullscreen": re.compile(r"\b(?:requestFullscreen|webkitRequestFullscreen)\b"),
    "Node/Electron API": re.compile(
        r"\b(?:require\s*\(|process\.|__dirname\b|__filename\b|electron\b|"
        r"node:|child_process\b|fs\.)"
    ),
    "nonexistent Flow Cabin API": re.compile(r"\bFlowCabinGameAPI\b"),
}


class PackageError(ValueError):
    """A package violates the Flow Cabin v1 contract."""


class OfflineHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.errors: list[str] = []
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag in {"iframe", "frame", "object", "embed"}:
            self.errors.append(f"<{tag}> is not allowed")
        if tag == "script" and not values.get("src"):
            self.errors.append("inline <script> is not allowed")
        if tag == "style":
            self.errors.append("inline <style> is not allowed")
        if "style" in values:
            self.errors.append("inline style attributes are not allowed")
        for name, value in attrs:
            if name.lower().startswith("on"):
                self.errors.append(f"inline event handler {name} is not allowed")
            if value and name.lower() in {
                "src",
                "href",
                "xlink:href",
                "action",
                "poster",
            }:
                try:
                    reference = _local_reference(value, name)
                except PackageError as exc:
                    self.errors.append(str(exc))
                else:
                    if reference is not None:
                        self.references.append(reference)


def _safe_relative(value: str, label: str) -> PurePosixPath:
    if "\\" in value:
        raise PackageError(f"{label} must use POSIX separators: {value}")
    path = PurePosixPath(value)
    if not value or path.is_absolute() or any(
        part in {"", ".", ".."} for part in path.parts
    ):
        raise PackageError(f"unsafe {label}: {value!r}")
    if any(part.startswith(".") for part in path.parts):
        raise PackageError(f"hidden {label} is not allowed: {value!r}")
    return path


def _local_reference(value: str, label: str) -> str | None:
    if "\\" in value:
        raise PackageError(f"{label} must use POSIX separators: {value}")
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        raise PackageError(f"non-local {label} is not allowed")
    decoded = unquote(parsed.path)
    if not decoded:
        return None
    return _safe_relative(decoded, label).as_posix()


def _load_manifest(root: Path) -> dict:
    path = root / "manifest.json"
    if not path.is_file():
        raise PackageError("manifest.json is required at the package root")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise PackageError(f"invalid manifest.json: {exc}") from exc
    if not isinstance(data, dict):
        raise PackageError("manifest.json must contain an object")
    for key in ("id", "title", "version", "entry", "cover"):
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise PackageError(f"manifest field {key!r} must be a non-empty string")
    if not ID_RE.fullmatch(data["id"]):
        raise PackageError("manifest id must be lowercase kebab-case")
    if not VERSION_RE.fullmatch(data["version"]):
        raise PackageError("manifest version must be semantic versioning")
    if data["entry"] != "index.html":
        raise PackageError("manifest entry must be 'index.html'")
    cover = _safe_relative(data["cover"], "cover path")
    if cover.suffix.lower() not in COVER_SUFFIXES:
        raise PackageError("manifest cover must be SVG, PNG, or WebP")
    return data


def _collect_files(root: Path) -> dict[str, Path]:
    if not root.is_dir():
        raise PackageError(f"package directory does not exist: {root}")
    files: dict[str, Path] = {}
    total = 0
    for current, dirs, names in os.walk(root, followlinks=False):
        current_path = Path(current)
        for name in [*dirs, *names]:
            item = current_path / name
            if item.is_symlink():
                raise PackageError(
                    f"symbolic links are not allowed: {item.relative_to(root)}"
                )
        for name in names:
            path = current_path / name
            if not stat.S_ISREG(path.stat().st_mode):
                raise PackageError(
                    f"only regular files are allowed: {path.relative_to(root)}"
                )
            relative = path.relative_to(root).as_posix()
            _safe_relative(relative, "package path")
            if Path(relative).suffix.lower() not in ALLOWED_SUFFIXES:
                raise PackageError(f"unsupported file type: {relative}")
            files[relative] = path
            total += path.stat().st_size
    if len(files) > MAX_FILES:
        raise PackageError(f"package has {len(files)} files; maximum is {MAX_FILES}")
    if total > MAX_UNCOMPRESSED_BYTES:
        raise PackageError(
            f"package is {total} bytes uncompressed; maximum is "
            f"{MAX_UNCOMPRESSED_BYTES}"
        )
    return dict(sorted(files.items()))


def _check_offline(relative: str, path: Path) -> list[str]:
    suffix = path.suffix.lower()
    if suffix not in {".html", ".css", ".js", ".svg"}:
        return []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeError as exc:
        raise PackageError(f"{relative} must be UTF-8") from exc
    if suffix in {".html", ".svg"}:
        parser = OfflineHTMLParser()
        parser.feed(text)
        if parser.errors:
            raise PackageError(f"{relative}: {parser.errors[0]}")
        return parser.references
    if suffix == ".css":
        if CSS_IMPORT_RE.search(text):
            raise PackageError(f"{relative}: @import is not allowed")
        return [
            reference
            for match in CSS_URL_RE.finditer(text)
            if (reference := _local_reference(match.group(2).strip(), "CSS URL"))
            is not None
        ]
    if suffix == ".js":
        if REMOTE_LITERAL_RE.search(text):
            raise PackageError(f"{relative}: remote/data URLs are not allowed")
        for label, pattern in JS_BANNED.items():
            if pattern.search(text):
                raise PackageError(f"{relative}: {label} is not allowed")
    return []


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inspect_package(
    package: str | Path,
) -> tuple[Path, dict, dict[str, Path], dict[str, str]]:
    root = Path(package).resolve()
    files = _collect_files(root)
    if "index.html" not in files:
        raise PackageError("index.html is required at the package root")
    manifest = _load_manifest(root)
    cover = PurePosixPath(manifest["cover"]).as_posix()
    if cover not in files:
        raise PackageError(f"manifest cover does not exist: {cover}")
    for relative, path in files.items():
        for reference in _check_offline(relative, path):
            target = (PurePosixPath(relative).parent / reference).as_posix()
            target = _safe_relative(target, f"reference in {relative}").as_posix()
            if target not in files:
                raise PackageError(f"{relative}: local resource does not exist: {target}")
    hashes = {
        relative: _sha256(path)
        for relative, path in files.items()
        if relative != "manifest.json"
    }
    return root, manifest, files, hashes


def validate(package: str | Path) -> None:
    _, manifest, _, hashes = inspect_package(package)
    stored = manifest.get("files")
    if not isinstance(stored, dict):
        raise PackageError("manifest files must be an object; run pack to generate it")
    for relative, digest in stored.items():
        if not isinstance(relative, str):
            raise PackageError("manifest file paths must be strings")
        _safe_relative(relative, "manifest file path")
        if not isinstance(digest, str) or not HASH_RE.fullmatch(digest):
            raise PackageError(f"invalid SHA-256 for {relative}")
    if stored != hashes:
        missing = sorted(hashes.keys() - stored.keys())
        extra = sorted(stored.keys() - hashes.keys())
        changed = sorted(
            key for key in hashes.keys() & stored.keys() if hashes[key] != stored[key]
        )
        details = []
        if missing:
            details.append(f"missing: {', '.join(missing)}")
        if extra:
            details.append(f"extra: {', '.join(extra)}")
        if changed:
            details.append(f"changed: {', '.join(changed)}")
        raise PackageError(
            "manifest file hashes do not match (" + "; ".join(details) + ")"
        )


def pack(package: str | Path, output: str | Path) -> Path:
    root, manifest, _, hashes = inspect_package(package)
    manifest["files"] = hashes
    manifest_path = root / "manifest.json"
    encoded = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
    with tempfile.NamedTemporaryFile(
        dir=root, prefix=".manifest-", delete=False
    ) as stream:
        temp_manifest = Path(stream.name)
        stream.write(encoded)
    temp_manifest.replace(manifest_path)
    validate(root)

    destination = Path(output).resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(
        dir=destination.parent, prefix=f".{destination.name}-", suffix=".tmp"
    )
    os.close(fd)
    temp_zip = Path(temp_name)
    try:
        _, _, files, _ = inspect_package(root)
        with zipfile.ZipFile(
            temp_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=9
        ) as archive:
            for relative, path in files.items():
                archive.write(path, relative)
        size = temp_zip.stat().st_size
        if size > MAX_ZIP_BYTES:
            raise PackageError(f"ZIP is {size} bytes; maximum is {MAX_ZIP_BYTES}")
        temp_zip.replace(destination)
    finally:
        if temp_zip.exists():
            temp_zip.unlink()
    return destination


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    validate_parser = subparsers.add_parser("validate")
    validate_parser.add_argument("package")
    pack_parser = subparsers.add_parser("pack")
    pack_parser.add_argument("package")
    pack_parser.add_argument("--output", required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "validate":
            validate(args.package)
            print(f"valid: {Path(args.package).resolve()}")
        else:
            result = pack(args.package, args.output)
            print(f"packed: {result}")
    except (OSError, PackageError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
