#!/usr/bin/env node
// On-demand helper for AUDIT mode (SKILL.md Mode 1, steps 1-3).
//
// Not a hook — there's no tool-use event that means "the user wants an audit,"
// AUDIT only runs when asked. This script exists so the skill doesn't re-derive
// mechanical file-presence/legacy/template-marker facts by hand each time; it
// shells out here, then does the judgment work (steps 4-7: quality scoring,
// location-modifier, grade) itself, since scoring prose quality isn't
// grep-able.
//
// Usage: node detect-structure.js <repo-root>
// Output: JSON facts on stdout. No side effects, no writes.

const fs = require("fs");
const path = require("path");

const root = process.argv[2] || process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const STANDARD_FILES = {
  "project/constraints.md": ".ai/project/constraints.md",
  "project/architecture.md": ".ai/project/architecture.md",
  "project/operations.md": ".ai/project/operations.md",
  "project/agents.md": ".ai/project/agents.md",
  "memory/decisions.md": ".ai/memory/decisions.md",
  "memory/pitfalls.md": ".ai/memory/pitfalls.md",
  "memory/current-state.md": ".ai/memory/current-state.md",
};

const LEGACY_MAP = {
  "PLAN.md": ".ai/memory/current-state.md",
  "PLAN-history.md": ".ai/memory/decisions.md",
  "OPERATIONS.md": ".ai/project/operations.md",
  "docs/ARCHITECTURE.md": ".ai/project/architecture.md",
  "ARCHITECTURE.md": ".ai/project/architecture.md",
  "AGENTS.md": ".ai/project/agents.md",
  "CONSTRAINTS.md": ".ai/project/constraints.md",
};

const TEMPLATE_MARKERS = {
  "SECURITY.md": ["BEGIN MICROSOFT SECURITY.MD", "Copyright (c) Microsoft"],
  "LICENSE": ["Copyright (c) Microsoft", "MIT License"],
  "CODE_OF_CONDUCT.md": ["Microsoft Open Source Code of Conduct", "Contributor Covenant"],
};

function firstLines(rel, n) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf-8").split(/\r?\n/).slice(0, n).join("\n");
}

const standard = {};
for (const [key, rel] of Object.entries(STANDARD_FILES)) {
  standard[key] = exists(rel);
}

const legacy = {};
for (const [oldPath, newPath] of Object.entries(LEGACY_MAP)) {
  if (exists(oldPath)) legacy[oldPath] = { migrateTo: newPath, alreadyMigrated: exists(newPath) };
}

const templateOwned = {};
for (const [file, markers] of Object.entries(TEMPLATE_MARKERS)) {
  const head = firstLines(file, 5);
  if (head === null) continue;
  const hit = markers.find((m) => head.includes(m));
  templateOwned[file] = { present: true, templateOwned: !!hit, matchedMarker: hit || null };
}

const repoType = {
  fabricApp: exists("rayfin.yml"),
  nodeTs: exists("package.json"),
  powerBi: fs.existsSync(root) && fs.readdirSync(root).some((f) => f.endsWith(".pbip") || f.endsWith(".tmdl")),
  python: exists("pyproject.toml") || exists("requirements.txt"),
};

const output = {
  root,
  aiDirExists: exists(".ai"),
  claudeMdExists: exists(".claude/CLAUDE.md"),
  readmeExists: exists("README.md"),
  standard,
  legacy,
  templateOwned,
  repoType,
};

process.stdout.write(JSON.stringify(output, null, 2));
