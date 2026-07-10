# Hard-rules enforcement hooks (reference copy)

The Hard Rules in `../SKILL.md` are enforced two ways: the skill applies them at
**generation time** (Claude follows them while writing code), and these two hooks
catch violations **after the fact** as a backstop — for edits made without the skill
loaded, or rules the model missed under pressure.

Unlike `semantic-modeling-prepforai`'s hooks (which are global — they fire in every
repo, for every skill, because HISD context applies everywhere), these are
**repo-scoped**: they only make sense inside an actual Rayfin App project, not in
this skills-and-plugins repo itself and not globally in `~/.claude/settings.json`.
Copy `hooks/check-rayfin-rules.cjs` and `hooks/guard-rayfin-secrets.cjs` into the
target Rayfin App project's `.claude/hooks/`, then add the wiring below to that
project's `.claude/settings.json`.

**Extension is `.cjs`, not `.js` — this matters.** Rayfin App projects are Vite/ESM
projects (`"type": "module"` in `package.json`). A hook script named `.js` in that
context is loaded as an ES module, and `require("fs")` throws
`ReferenceError: require is not defined in ES module scope` — caught by testing
against the real `fabric-app-campus-profile` and `fabric-app-student-profile`
repos, not a hypothetical. `.cjs` forces CommonJS regardless of the project's
`"type"` field, so don't rename these back to `.js`.

**Version prerequisite:** none beyond a `PreToolUse`/`PostToolUse`-capable Claude
Code build — no `if`-glob-scoping syntax is used here (the scripts self-filter on
file extension / tool name instead).

## Coverage

| Rule | Enforced by | Mechanism |
|---|---|---|
| 2 — `@uuid() id!: string` primary key | `check-rayfin-rules.cjs` | file-level heuristic (not per-class) |
| 3 — bare `?` vs `{ optional: true }` | `check-rayfin-rules.cjs` | line-adjacent decorator scan |
| 5 — no `@one()` → `USER` | `check-rayfin-rules.cjs` | regex |
| 7 — `totalCount` never populated | `check-rayfin-rules.cjs` | regex |
| 9 — `returnOrigin` must be bare origin | `check-rayfin-rules.cjs` | regex |
| 10 — never commit `rayfin/.env` / `rayfin/.temp/` | `guard-rayfin-secrets.cjs` | blocks `git add`/`commit -a` staging those paths; warns on blanket `-A`/`.` |
| 1, 4, 6, 8 | **not covered** — judgment-only | require type/relationship context a line scanner can't reliably infer; stay the skill's job |

## Installed instances

| Project | Installed | Notes |
|---|---|---|
| `fabric-apps/fabric-app-campus-profile` | yes | merged into its existing `.claude/settings.json` (already had a `PreToolUse` entry for `inject-jit-rules.mjs`) |
| `fabric-apps/fabric-app-student-profile/App_StudentProfile` | yes | `.claude/settings.json` created fresh (had none) |

## `.claude/settings.json` (hooks section)

```jsonc
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "node \".claude/hooks/check-rayfin-rules.cjs\"" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "node \".claude/hooks/guard-rayfin-secrets.cjs\"" }
        ]
      }
    ]
  }
}
```

## `check-rayfin-rules.cjs`

`PostToolUse`, self-filters to `*.ts` files. Re-reads the file from disk after the
edit lands and greps for rules 2/3/5/7/9. Emits findings via
`hookSpecificOutput.additionalContext` (a warning, not a block — static analysis
after the write already happened). Fails open. Full source:
[`../hooks/check-rayfin-rules.cjs`](../hooks/check-rayfin-rules.cjs).

## `guard-rayfin-secrets.cjs`

`PreToolUse` on `Bash`. Hard-denies (`permissionDecision: "deny"`) a command that
stages or commits `rayfin/.env` or `rayfin/.temp/` by name. Soft-warns
(`additionalContext`, does not block) on a blanket `git add -A`/`git add .`/
`git commit -a`, since the hook can't verify `.gitignore` coverage from the command
string alone. Fails open. Full source:
[`../hooks/guard-rayfin-secrets.cjs`](../hooks/guard-rayfin-secrets.cjs).
