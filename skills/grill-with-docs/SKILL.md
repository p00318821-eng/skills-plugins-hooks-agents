---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Use the `domain-modeling` skill to run this session: interview the user relentlessly about their plan, resolving one decision at a time, updating `.ai/CONTEXT.md` and `.ai/adr/` inline as terms and decisions crystallise. See [`../domain-modeling/SKILL.md`](../domain-modeling/SKILL.md).

**Fork note:** upstream's real `SKILL.md` (`github.com/mattpocock/skills`, `skills/engineering/grill-with-docs`) says "Run a `/grilling` session, using the `/domain-modeling` skill" — `/grilling` is a slash command from Matt Pocock's personal setup, not a skill in the vendored `skills/engineering` tree, so it isn't available here. This line delegates to `domain-modeling` directly instead.
