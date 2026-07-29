#!/usr/bin/env python3
"""Create a Flow Cabin game project in a user's coding workspace."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VERSION_RE = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$"
)
DEFAULT_OUTPUT_DIR = "flow-cabin-games"


class ProjectError(ValueError):
    """The requested project destination is unsafe or invalid."""


def _is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def create_project(
    workspace: str | Path,
    game_id: str,
    title: str,
    version: str = "1.0.0",
    output_root: str | Path | None = None,
) -> Path:
    workspace_path = Path(workspace).expanduser().resolve()
    if not workspace_path.is_dir():
        raise ProjectError(f"workspace does not exist: {workspace_path}")
    if not ID_RE.fullmatch(game_id):
        raise ProjectError("game id must be lowercase kebab-case")
    if not title.strip():
        raise ProjectError("title must not be empty")
    if not VERSION_RE.fullmatch(version):
        raise ProjectError("version must use semantic versioning")

    if output_root is None:
        root = workspace_path / DEFAULT_OUTPUT_DIR
    else:
        requested = Path(output_root).expanduser()
        root = requested if requested.is_absolute() else workspace_path / requested
    root = root.resolve()
    target = root / game_id
    skill_root = Path(__file__).resolve().parents[1]
    if _is_within(target, skill_root):
        raise ProjectError("generated games must not be written inside the Skill directory")
    if target.exists():
        raise ProjectError(f"game already exists; edit it in place: {target}")

    template = skill_root / "templates" / "vanilla-game"
    root.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(dir=root, prefix=f".{game_id}-"))
    try:
        package = temporary / "package"
        shutil.copytree(template, package)
        (package / "assets").mkdir(exist_ok=True)
        (temporary / "dist").mkdir()
        manifest_path = package / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest.update(
            {
                "id": game_id,
                "title": title.strip(),
                "version": version,
                "entry": "index.html",
                "cover": "cover.svg",
                "files": {},
            }
        )
        manifest_path.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        temporary.replace(target)
    except Exception:
        shutil.rmtree(temporary, ignore_errors=True)
        raise
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workspace", help="Creator's active coding workspace")
    parser.add_argument("game_id")
    parser.add_argument("--title", required=True)
    parser.add_argument("--version", default="1.0.0")
    parser.add_argument(
        "--output-root",
        help="Override flow-cabin-games only when the creator requests it",
    )
    args = parser.parse_args(argv)
    try:
        result = create_project(
            args.workspace,
            args.game_id,
            args.title,
            args.version,
            args.output_root,
        )
    except (OSError, ProjectError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(f"created: {result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
