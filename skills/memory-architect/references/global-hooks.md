# Validation-gate hook (reference copy)

**Status: installed.** Live at `~/.claude/hooks/memory-architect-validation-gate.js`,
wired into `~/.claude/settings.json`'s `Stop` array alongside the pre-existing
`protect-branches.js` (`PreToolUse`) and the `semantic-modeling-prepforai` hooks
(`SessionStart`/`PostToolUse`) — none of those were touched. Re-verified end to end
against the installed copy (not just the repo source) with a scratch git repo: a
dirty `.ai/` plus a failing `check:docs` script correctly produced a `block`
decision.

CONSOLIDATE mode's step 6 ("Validation gate": run build/lint/check:docs, report
pass/fail) is a manual instruction in `../SKILL.md` today. `hooks/validation-gate.js`
turns it into an automatic `Stop` hook backstop: whenever `.ai/` files are dirty at
the end of a turn, it runs whichever of `build`/`lint`/`check:docs` exist in that
repo's `package.json` and blocks stopping until they pass.

**Global, unlike rayfin-companion's hooks.** rayfin-companion's hooks are
repo-scoped because they only make sense inside one Rayfin App project.
memory-architect operates across arbitrary repos — that's its whole premise — so
this hook is designed to live in `~/.claude/settings.json` / `~/.claude/hooks/`
once, and self-scope per-repo via `git status` rather than needing per-project
wiring. This file is a courtesy copy; the live source of truth is whatever's
actually in `~/.claude/settings.json` — if this drifts, trust the live config.

**Known limitation:** the gate only recognizes `npm` scripts (`build`, `lint`,
`check:docs`). A repo with a different validation toolchain (e.g. a Python
`pyproject.toml` with `ruff`/`pytest`) is silently skipped — extend the
`toRun`/script-detection logic in the hook if that gap matters for a given repo.

## `~/.claude/settings.json` (hooks section)

```jsonc
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "node \"$HOME/.claude/hooks/memory-architect-validation-gate.js\"" }
        ]
      }
    ]
  }
}
```

## `~/.claude/hooks/memory-architect-validation-gate.js`

Reads the `Stop` hook's stdin JSON (`cwd`, `stop_hook_active`). Guards against the
stop→block→stop infinite loop by allowing silently if `stop_hook_active` is
already `true`. Checks `git status --porcelain -- .ai .claude/CLAUDE.md` in `cwd`;
if clean, allows silently. If dirty, runs the available npm scripts and blocks
(`{"decision": "block", "reason": "..."}`) with the failing output if any fail.
Fails open on every unexpected condition (no git repo, no package.json, no
matching scripts, thrown errors). Full source:
[`../hooks/validation-gate.js`](../hooks/validation-gate.js).

Tested against a scratch repo during development: correctly allows silently with
no `.ai/` directory, allows silently with a clean `.ai/`, blocks with the failing
script's output when `.ai/` is dirty and a script fails, and does not double-block
when `stop_hook_active` is already true.
