# memory-consolidator agent (reference copy)

CONSOLIDATE mode's scan → classify → propose → archive loop (`../SKILL.md` Mode 3,
steps 1-5) is the most agent-shaped part of memory-architect: it does its own
multi-source file scanning (`~/.claude/projects/`, `~/.claude/plans/`, the repo's
`.ai/`), classifies content independently, and ends with its own verification step
— a bounded, semi-independent task with a clear success check, rather than a
single-shot generation.

`agents/memory-consolidator.md` ports that loop into a dispatchable sub-agent
definition (`Read, Grep, Glob, Bash, Edit` — no broader tool access than the task
needs). Install it globally at `~/.claude/agents/memory-consolidator.md` so it's
available in every repo, matching the hook's global scope (see
[global-hooks.md](global-hooks.md)) — memory-architect itself isn't tied to one project.

## What changes in the skill

`../SKILL.md`'s Mode 3 should shrink to: recognize the CONSOLIDATE trigger phrases,
then dispatch `memory-consolidator` via the Agent tool instead of running steps 1-5
inline. The skill keeps ownership of *deciding when* to consolidate; the agent owns
*doing* the scan/classify/propose work.

## Why this one and not AUDIT or SCAFFOLD

AUDIT and SCAFFOLD are single-pass: read some files, apply a fixed rubric or
template, output a result — no multi-round investigation, no independent judgment
calls beyond a lookup table. CONSOLIDATE is the only mode where the "right answer"
genuinely depends on reading and weighing content the model hasn't seen yet across
multiple ephemeral sources — that's the agent-shaped part, not the others.
