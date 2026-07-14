---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `.ai/CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

**Fork note:** this skill is vendored from `github.com/mattpocock/skills` (`skills/engineering/domain-modeling`) with one deliberate modification — upstream targets root-level `CONTEXT.md`/`docs/adr/`; this fork targets `.ai/CONTEXT.md`/`.ai/adr/` instead, to stay inside this Standard's single `.ai/` umbrella (see `project-memory-template`'s `.ai/LINEAGE.md`). Tracked in `manifests/origins.json` the same way `caveman`'s local modification is tracked. Everything else below is unchanged from upstream.

## File structure

Most repos have a single context:

```
/
├── .ai/
│   ├── CONTEXT.md
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `.ai/CONTEXT-MAP.md` exists, the repo has multiple contexts. The map points to where each one lives:

```
/
├── .ai/
│   ├── CONTEXT-MAP.md
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── adr/                      ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── adr/
```

Create files lazily — only when you have something to write. If no `.ai/CONTEXT.md` exists, create one when the first term is resolved. If no `.ai/adr/` exists, create it when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `.ai/CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Check for an existing owner before adding a term

Before adding a term to `.ai/CONTEXT.md`, check whether a runtime/consumer-facing glossary already owns it in this repo (mechanical signal: a `references/hisd-power-bi-context.md`-style file, or similar). If one exists, cross-reference it instead of re-deriving the definition — `.ai/CONTEXT.md` is a planning-time, engineering-facing glossary; a file like `hisd-power-bi-context.md` is runtime, Copilot/FDA-facing. They can name-collide on the same term without being the same system, so link rather than duplicate.

### Update `.ai/CONTEXT.md` inline

When a term is resolved, update `.ai/CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`.ai/CONTEXT.md` should be totally devoid of implementation details. Do not treat it as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
