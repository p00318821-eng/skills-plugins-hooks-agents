# skills

My long-term personal skills library (repository renamed from `ben-skills`).

Each top-level directory is a single, self-contained skill (a `SKILL.md` at its
root, plus any reference files it needs). Skills are stored as plain folders —
this repo no longer uses Git submodules. Third-party skills are vendored here as
flat copies; attribution and licensing for each are listed below.

## Skills

| Skill | Folder | Purpose |
|---|---|---|
| caveman | [`caveman/`](caveman/) | Ultra-compressed communication mode that cuts token usage by dropping filler while preserving technical accuracy. |
| grill-me | [`grill-me/`](grill-me/) | Relentlessly interview a plan or design, one branch at a time, until reaching shared understanding. |
| grill-with-docs | [`grill-with-docs/`](grill-with-docs/) | Grilling session that challenges a plan against the existing domain model and updates docs (CONTEXT.md, ADRs) inline. |
| handoff | [`handoff/`](handoff/) | Compact the current conversation into a handoff document for another agent to pick up. |
| improve-codebase-architecture | [`improve-codebase-architecture/`](improve-codebase-architecture/) | Surface architectural friction and propose deepening refactors for testability and AI-navigability. |
| mbti-persona | [`mbti-persona/`](mbti-persona/) | Switch the agent's reasoning and communication style across all 16 MBTI types. |
| task-observer ("One Skill to Rule Them All") | [`one-skill-to-rule-them-all/`](one-skill-to-rule-them-all/) | Meta-skill that watches your work to draft new skills and improve existing ones. |
| pbi-visual-rendering | [`pbi-visual-rendering/`](pbi-visual-rendering/) | Power BI visual rendering engine for Deneb/Vega specs and HTML Content visual DAX measures. |
| semantic-modeling-prepforai | [`semantic-modeling-prepforai/`](semantic-modeling-prepforai/) | TMDL semantic model enhancement and Prep for AI configuration for Power BI Copilot / Fabric Data Agent. |

## Updating sourced skills

The externally-sourced skills are tracked in
[`skill-sources.json`](skill-sources.json) and refreshed with
[`update-sourced-skills.ipynb`](update-sourced-skills.ipynb). The notebook
shallow-clones each upstream repo, shows a per-skill change-list (with diffs)
when an update exists, and lets you apply or disregard each one. Applying
preserves local-only files (e.g. the vendored `LICENSE` copies) and never
deletes anything.

Skills under `excluded` in the manifest are never auto-updated:

- **caveman** — locally modified to suit my own use.
- **pbi-visual-rendering**, **semantic-modeling-prepforai** — my own skills.

## Attribution

This library bundles skills authored by others. Credit and licenses below; each
external skill folder retains its upstream license file.

### My own skills

- **pbi-visual-rendering** and **semantic-modeling-prepforai** — authored by
  Benjamin Hanna (Houston ISD).

### Matt Pocock — Skills for Real Engineers

Source: <https://github.com/mattpocock/skills> · License: MIT (a `LICENSE` copy
is included in each folder below)

- **caveman** (locally modified)
- **grill-me**
- **grill-with-docs**
- **handoff**
- **improve-codebase-architecture**

### ChangyuanYU — MBTI Persona Skill

Source: <https://github.com/ChangyuanYU/mbti-persona-skill> · License: MIT
(see [`mbti-persona/LICENSE`](mbti-persona/LICENSE))

- **mbti-persona**

### Eoghan Henn / rebelytics.com — One Skill to Rule Them All

Source: <https://github.com/rebelytics/one-skill-to-rule-them-all> ·
License: CC BY 4.0 (see [`one-skill-to-rule-them-all/LICENSE.txt`](one-skill-to-rule-them-all/LICENSE.txt))

- **task-observer**
