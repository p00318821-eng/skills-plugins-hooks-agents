# Changelog

## Unreleased

### Added
- Distribution system: `scripts/sync_engine.py` engine with idempotent
  boundary-marker injection, `sync_orchestrator.ipynb` notebook, and
  `manifests/destinations.json` manifest for routing skills to AI tool
  environments.
- `CLAUDE.md` with file map, SOPs, and environment gotchas.
- `.env.example` and `requirements.txt` (python-dotenv).
- `.cache/` directory (gitignored) for intermediate prompt cache.

### Changed
- Migrated `skill-plugin-sources.json` to `manifests/origins.json` (format v2)
  with `type` and `format` fields. Old path is a one-line redirect stub.
- Fixed stale `local` paths in origins manifest to reflect the `skills/` move
  (e.g. `"grill-me"` → `"skills/grill-me"`).
- Updated `update-sourced-skills.ipynb` to read from `manifests/origins.json`.
- Expanded `.gitignore` to cover `.cache/`, `.env`, and `__pycache__/`.

---

## Previous

### Added
- `skill-plugin-sources.json` manifest and `update-sourced-skills.ipynb` notebook to
  check externally-sourced skills for upstream updates, show a per-skill
  change-list with diffs, and apply or disregard each one.
- Vendored MIT `LICENSE` into each Matt Pocock skill folder (`caveman`,
  `grill-me`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`).
- `docs/PROJECT-NOTES.md` capturing repository conventions, the update workflow,
  known updater limitations, and local-environment notes.
- This changelog.

### Changed
- Migrated from Git submodules to plain, self-contained per-skill folders
  (one `SKILL.md` per folder). Removed `.gitmodules` and the `mattpocock/`,
  `changyuanyu/`, and `my-custom-skills/` wrappers.
- Promoted `pbi-visual-rendering` and `semantic-modeling-prepforai` to top-level
  folders.
- Flattened `mbti-persona` out of its wrapper, keeping its upstream `LICENSE`.
- Rewrote `README.md` with a skills table, per-skill attribution, and update
  instructions; retitled the project `skills` to match the repository rename
  from `ben-skills`.

### Notes
- `caveman` is intentionally excluded from automated updates because it has been
  locally modified.
