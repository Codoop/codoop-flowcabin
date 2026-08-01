from __future__ import annotations

import importlib.util
import json
import os
import shutil
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (
    ROOT
    / "skills"
    / "game"
    / "scripts"
    / "flow_cabin_package.py"
)
CREATE_SCRIPT = (
    ROOT
    / "skills"
    / "game"
    / "scripts"
    / "create_game.py"
)
TEMPLATE = (
    ROOT
    / "skills"
    / "game"
    / "templates"
    / "vanilla-game"
)
SPEC = importlib.util.spec_from_file_location("flow_cabin_package", SCRIPT)
package = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(package)
CREATE_SPEC = importlib.util.spec_from_file_location("create_game", CREATE_SCRIPT)
creator = importlib.util.module_from_spec(CREATE_SPEC)
assert CREATE_SPEC.loader
CREATE_SPEC.loader.exec_module(creator)


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.game = self.root / "package"
        shutil.copytree(TEMPLATE, self.game)
        self.output = self.root / "dist" / "star-catcher-1.0.0.zip"

    def tearDown(self):
        self.temporary.cleanup()

    def manifest(self):
        return json.loads((self.game / "manifest.json").read_text())

    def write_manifest(self, data):
        (self.game / "manifest.json").write_text(
            json.dumps(data), encoding="utf-8"
        )

    def test_pack_writes_complete_hashes_and_root_archive(self):
        package.pack(self.game, self.output)
        package.validate(self.game)
        stored = self.manifest()["files"]
        self.assertEqual(
            set(stored),
            {"cover.svg", "game.js", "index.html", "styles.css"},
        )
        with zipfile.ZipFile(self.output) as archive:
            self.assertEqual(
                set(archive.namelist()),
                {"manifest.json", "cover.svg", "game.js", "index.html", "styles.css"},
            )
            self.assertNotIn("package/", archive.namelist())

    def test_tampered_file_fails_hash_validation(self):
        package.pack(self.game, self.output)
        (self.game / "game.js").write_text("console.log('changed')", encoding="utf-8")
        with self.assertRaisesRegex(package.PackageError, "changed: game.js"):
            package.validate(self.game)

    def test_remote_and_forbidden_runtime_features_fail(self):
        cases = {
            "index.html": '<iframe src="https://example.com"></iframe>',
            "styles.css": "body { background: url(//example.com/a.png); }",
            "game.js": "fetch('/score')",
        }
        for relative, content in cases.items():
            with self.subTest(relative=relative):
                shutil.rmtree(self.game)
                shutil.copytree(TEMPLATE, self.game)
                (self.game / relative).write_text(content, encoding="utf-8")
                with self.assertRaises(package.PackageError):
                    package.pack(self.game, self.output)

    def test_missing_and_escaping_local_resources_fail(self):
        cases = [
            '<script src="missing.js"></script>',
            '<link rel="stylesheet" href="../outside.css">',
        ]
        for content in cases:
            with self.subTest(content=content):
                shutil.rmtree(self.game)
                shutil.copytree(TEMPLATE, self.game)
                (self.game / "index.html").write_text(content, encoding="utf-8")
                with self.assertRaises(package.PackageError):
                    package.pack(self.game, self.output)

    def test_javascript_comments_are_not_mistaken_for_remote_urls(self):
        (self.game / "game.js").write_text(
            "// ordinary comment\nconst score = 1;", encoding="utf-8"
        )
        package.pack(self.game, self.output)
        package.validate(self.game)

    def test_manifest_path_traversal_fails(self):
        data = self.manifest()
        data["files"] = {"../outside.js": "0" * 64}
        self.write_manifest(data)
        with self.assertRaisesRegex(package.PackageError, "unsafe manifest file path"):
            package.validate(self.game)

    @unittest.skipIf(os.name == "nt", "symlink creation is not reliable on Windows")
    def test_symbolic_link_fails(self):
        (self.root / "outside.js").write_text("safe", encoding="utf-8")
        (self.game / "linked.js").symlink_to(self.root / "outside.js")
        with self.assertRaisesRegex(package.PackageError, "symbolic links"):
            package.pack(self.game, self.output)

    def test_wrong_entry_fails(self):
        data = self.manifest()
        data["entry"] = "game.html"
        self.write_manifest(data)
        with self.assertRaisesRegex(package.PackageError, "entry"):
            package.pack(self.game, self.output)

    def test_file_count_and_uncompressed_size_limits_fail(self):
        with mock.patch.object(package, "MAX_FILES", 3):
            with self.assertRaisesRegex(package.PackageError, "maximum"):
                package.pack(self.game, self.output)
        with mock.patch.object(package, "MAX_UNCOMPRESSED_BYTES", 1):
            with self.assertRaisesRegex(package.PackageError, "uncompressed"):
                package.pack(self.game, self.output)

    def test_compressed_size_limit_fails(self):
        with mock.patch.object(package, "MAX_ZIP_BYTES", 1):
            with self.assertRaisesRegex(package.PackageError, "ZIP"):
                package.pack(self.game, self.output)


class SkillStructureTests(unittest.TestCase):
    def test_plugin_release_metadata_is_consistent(self):
        codex = json.loads((ROOT / ".codex-plugin" / "plugin.json").read_text())
        claude = json.loads((ROOT / ".claude-plugin" / "plugin.json").read_text())
        claude_market = json.loads(
            (ROOT / ".claude-plugin" / "marketplace.json").read_text()
        )
        codex_market = json.loads(
            (ROOT / ".agents" / "plugins" / "marketplace.json").read_text()
        )
        name, version = codex["name"], codex["version"]
        self.assertEqual(name, "codoop-flowcabin")
        self.assertEqual(claude["name"], name)
        self.assertEqual(claude["version"], version)
        self.assertEqual(claude_market["name"], name)
        self.assertEqual(claude_market["plugins"][0]["name"], name)
        self.assertEqual(claude_market["plugins"][0]["version"], version)
        self.assertEqual(codex_market["name"], name)
        self.assertEqual(codex_market["plugins"][0]["name"], name)
        self.assertEqual(codex["interface"]["displayName"], "Codoop Flowcabin")
        self.assertEqual(
            codex_market["interface"]["displayName"], "Codoop Flowcabin"
        )
        self.assertTrue(
            all("$" not in prompt for prompt in codex["interface"]["defaultPrompt"])
        )
        self.assertFalse(
            (ROOT / "skills" / "game" / "agents" / "openai.yaml").exists()
        )
        self.assertIn(f"## [{version}]", (ROOT / "CHANGELOG.md").read_text())

    def test_expert_roles_are_linked_and_present(self):
        skill = (ROOT / "skills" / "game" / "SKILL.md").read_text()
        self.assertIn("references/expert-orchestration.md", skill)
        shared = ROOT / "skills" / "_shared"
        for name in (
            "game-designer.md",
            "technical-artist.md",
            "level-designer.md",
            "narrative-designer.md",
        ):
            self.assertTrue((shared / name).is_file(), name)
        self.assertFalse((shared / "SKILL.md").exists())

    def test_starter_matches_flow_cabin_stage(self):
        template = ROOT / "skills" / "game" / "templates" / "vanilla-game"
        html = (template / "index.html").read_text()
        css = (template / "styles.css").read_text()
        runtime = (ROOT / "skills" / "game" / "references" / "runtime-api.md").read_text()
        self.assertIn('width="420" height="560"', html)
        self.assertIn("workspaceAvailableHeight / 600", runtime)
        self.assertNotIn("min-width", css)
        self.assertNotIn("place-items: center", css)
        self.assertNotIn("aspect-ratio: 16 / 9", css)


class ProjectLayoutTests(unittest.TestCase):
    def test_initializer_creates_standard_project_and_packages_it(self):
        with tempfile.TemporaryDirectory() as temporary:
            workspace = Path(temporary)
            project = creator.create_project(
                workspace, "lantern-hop", "Lantern Hop"
            )
            self.assertEqual(
                project, (workspace / "flow-cabin-games" / "lantern-hop").resolve()
            )
            self.assertEqual(
                {path.name for path in project.iterdir()}, {"package", "dist"}
            )
            self.assertTrue((project / "package" / "assets").is_dir())
            manifest = json.loads(
                (project / "package" / "manifest.json").read_text()
            )
            self.assertEqual(manifest["id"], "lantern-hop")
            self.assertEqual(manifest["title"], "Lantern Hop")
            output = project / "dist" / "lantern-hop-1.0.0.zip"
            package.pack(project / "package", output)
            package.validate(project / "package")
            self.assertTrue(output.is_file())
            with self.assertRaisesRegex(creator.ProjectError, "already exists"):
                creator.create_project(workspace, "lantern-hop", "Lantern Hop")

    def test_initializer_refuses_skill_directory(self):
        with self.assertRaisesRegex(creator.ProjectError, "Skill directory"):
            creator.create_project(
                ROOT,
                "bad-output",
                "Bad Output",
                output_root=ROOT / "skills" / "game" / "generated",
            )


if __name__ == "__main__":
    unittest.main()
