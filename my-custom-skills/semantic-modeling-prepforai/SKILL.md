---
name: semantic-modeling-prepforai
description: >
  TMDL semantic model enhancement and Prep for AI configuration for Power BI
  Copilot and Fabric Data Agent optimization at Houston ISD. Use this skill
  whenever the user uploads or pastes .tmdl files for review, audit, enhancement,
  or any AI-readiness task. Trigger on mentions of: TMDL enhancement, semantic
  model metadata, Prep for AI, AI instructions, AI data schema, verified answers,
  Copilot optimization, synonym annotations, model descriptions, relationship
  naming, /// descriptions, SynonymCollection, or making a Power BI semantic
  model AI-ready. Also trigger on partial requests like "add synonyms to this
  table", "audit my descriptions", "fix relationships", "what does Copilot
  actually read", or "prep this model for AI". Trigger even when the user says
  "enhance this" with a TMDL file attached. This skill is HISD-specific and
  assumes Houston ISD educational data context.
---
 
# Semantic Model Enhancement & Prep for AI
 
Enhance TMDL files and configure Prep for AI artifacts to optimize Power BI
semantic models for consumption by Copilot and Fabric Data Agent (FDA).
 
## Context
 
- **Organization**: Houston ISD (274 campuses, educational data analytics)
- **Stack**: Power BI semantic models in Microsoft Fabric, Direct Lake on medallion architecture (Bronze → Silver → Gold)
- **Format**: TMDL only — all input/output in TMDL syntax. No BIM/JSON.
- **Workflow**: User exports TMDL from Tabular Editor → uploads to Claude → Claude enhances → user pastes back. Claude never touches the live model.
- **Primary consumers**: District leadership analyzing student assessments, discipline, enrollment, and campus performance
## Reference Files
 
Read these before generating output. They live in `references/` within this skill folder.
 
| File | When to Read |
|------|-------------|
| `naming-conventions.yml` | **Every enhancement task.** Contains enforced rules for tables, columns, measures, relationships, synonyms, and descriptions. |
| `ai-compatibility-matrix.md` | When the user asks what AI systems consume, or when deciding which metadata to invest in. Also consult when generating Prep for AI artifacts. |
 
## Planning Phase (Grill-Me)
 
For **new Prep for AI configurations, multi-table enhancement batches, or ambiguous scope**, invoke the `/grill-me` protocol before generating output: interview the user one question at a time, walking each branch of the design decision tree until shared understanding is reached. For each question, provide a recommended answer.
 
**Triggers planning:** first-time Prep for AI setup, AI Instructions authoring, multi-model or multi-table scope, unfamiliar domain tables, or when the user's intent maps to multiple Operating Modes.
 
**Skips planning:** single-table TMDL enhancement with a clear file upload, "synonyms only", "fix relationships", single-property corrections, or when the user provides explicit instructions that fully resolve scope.
 
If a question can be answered by inspecting the uploaded TMDL file, inspect instead of asking.
 
## Operating Modes
 
| User Says | Action |
|-----------|--------|
| "enhance this" / uploads `.tmdl` | Full TMDL enhancement — `///` descriptions, dual synonym annotations, relationship naming |
| "audit" or "review" | List all gaps/issues, then provide fully enhanced TMDL |
| "synonyms only" | Add/improve `Synonyms` + `SynonymCollection` annotations only |
| "fix relationships" | Apply `{From}_to_{To}_via_{Key}` naming, verify structural properties |
| "prep for AI" / "AI instructions" | Generate Prep for AI configuration (AI Instructions, AI Data Schema, Verified Answers) |
 
---
 
## Truncation Prevention
 
TMDL files can exceed context limits. These protocols prevent silent data loss.
 
### Pre-flight Check
 
A complete table TMDL file ends with a `partition` definition and its `source` block. If the file ends mid-column, mid-annotation, or is missing the partition block, **stop** and reply:
 
> *"ALERT: The file was truncated. I cannot see the bottom of the table. Please split the file and send in chunks."*
 
### Object Count Handshake (tables with > 12 columns + measures)
 
1. Parse the file. Output: *"I see `[X]` columns and `[Y]` measures."*
2. Ask: *"Does this match your file?"*
3. Wait for confirmation before generating enhanced output.
### Chunking Protocol
 
If a file is too large for one output:
- Do not guess or fabricate missing lineage tags.
- Instruct the user to split: **Chunk 1** = table definition + first half of columns; **Chunk 2** = remaining columns + partition. Maintain correct TMDL indentation for clean stitching.
---
 
## TMDL Enhancement Rules
 
### Output Rules
 
- Return **complete, copy-paste ready** TMDL in fenced `tmdl` code blocks, or as downloadable `.tmdl` files when requested
- **Preserve all technical identifiers**: `lineageTag`, `sourceLineageTag`, `sourceColumn`, GUIDs, and all non-AI annotations (`SummarizationSetBy`, `PBI_FormatHint`, `changedProperty`, `sortByColumn`, etc.)
- **No phantom annotations** — never add: `Copilot_QueryHints`, `Copilot_SampleQuestions`, `FDA_TechnicalContext`, `AI_Category`, `AI_CommonFilters`, `AI_TypicalMeasures`, `AI_RelationshipContext`, or any custom annotation not in the source file
- **Do not rename objects** without explicit user approval — flag issues and recommend business-readable names
### Descriptions (`///`)
 
Consult `naming-conventions.yml` → `description` section for full rules.
 
```
Max length: 200 characters (Copilot truncates beyond this)
Structure: [What it is] + [Business context or usage hint]
Syntax: /// directly above object declaration, no blank line between
```
 
**Applies to:** tables, columns (visible AND hidden), measures, hierarchies, hierarchy levels
**Does NOT apply to:** relationships, partitions, annotations
 
**Avoid filler phrases:** "This column contains", "Data for", "Field representing", "Stores the"
 
✅ `/// Count of students in filter context. Primary headcount metric for enrollment reporting.`
❌ `/// This column contains the enrollment count data.`
 
### Synonyms
 
Consult `naming-conventions.yml` → `synonyms` section for full rules.
 
Two annotations required on every **visible** object (tables, visible columns, measures). Both must contain identical terms.
 
| Annotation | Consumer | Format |
|---|---|---|
| `annotation Synonyms` | Copilot Q&A in Report | `term1\|term2\|term3` |
| `annotation SynonymCollection` | FDA + Copilot in Service | `["term1","term2","term3"]` |
 
**Quantity:** 3–7 per object (target 5)
 
**Priority order:**
1. Business terms users naturally say ("how many kids", "which school")
2. HISD/TEA acronyms (ISS, OSS, DAEP, SPED, ELL, STAAR)
3. Related concepts for query expansion
4. Legacy field names still referenced
**Do not add synonyms to:** hidden columns, relationships
 
**Measure description sweet spot:** ~30–60 words. Longer descriptions can impair AI processing.
 
### Relationships
 
Consult `naming-conventions.yml` → `relationship` section for full rules.
 
TMDL does **not** support `///` descriptions on relationship objects.
 
**Naming pattern:**
```
{FromTable}_to_{ToTable}_via_{KeyDescription}
```
Use business terms for KeyDescription, not technical column names.
 
✅ `Students_to_Campuses_via_HomeCampus`
❌ `Relationship1` / `fk_student_campus_id` / `0d78ca4c-dd11-1fe8`
 
**Structural properties the AI reads:** cardinality, `crossFilteringBehavior`, active/inactive, table/column names in `fromColumn`/`toColumn`.
 
**Complex relationship semantics** (e.g., "use home campus, not serving campus") belong in **AI Instructions via Prep for AI**, not on the relationship object.
 
---
 
## TMDL Output Patterns
 
### Before Enhancement
```tmdl
table Students
    lineageTag: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 
    column StudentName
        dataType: string
        lineageTag: c3d4e5f6-a7b8-9012-cdef-345678901234
        sourceColumn: StudentName
 
    measure 'Student Count' =
        COUNTROWS(Students)
        formatString: #,##0
        lineageTag: b8c9d0e1-f2a3-4567-bcde-890123456789
 
relationship Relationship1
    fromColumn: Students.HomeCampusID
    toColumn: Campuses.CampusID
```
 
### After Enhancement
```tmdl
/// Student demographics, enrollment status, and grade level. One row per active student.
table Students
    lineageTag: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 
    /// Full legal name (Last, First Middle). Primary display field for student identification.
    column StudentName
        dataType: string
        lineageTag: c3d4e5f6-a7b8-9012-cdef-345678901234
        sourceColumn: StudentName
 
        annotation Synonyms = name|student name|pupil name|full name|legal name
        annotation SynonymCollection = ["name","student name","pupil name","full name","legal name"]
 
    /// Count of students in current filter context. Primary headcount metric for enrollment reporting.
    measure 'Student Count' =
        COUNTROWS(Students)
        displayFolder: "Enrollment Metrics"
        formatString: #,##0
        lineageTag: b8c9d0e1-f2a3-4567-bcde-890123456789
 
        annotation Synonyms = enrollment|headcount|student total|number of students|pupil count
        annotation SynonymCollection = ["enrollment","headcount","student total","number of students","pupil count"]
 
    annotation Synonyms = Students|Student Demographics|Learners|Pupils|Kids
    annotation SynonymCollection = ["Students","Student Demographics","Learners","Pupils","Kids"]
 
relationship Students_to_Campuses_via_HomeCampus
    fromColumn: Students.HomeCampusID
    toColumn: Campuses.CampusID
    crossFilteringBehavior: oneDirection
```
 
---
 
## Prep for AI Configuration
 
Power BI's Prep for AI has three components. All three feed Copilot in Report and the FDA DAX generation tool. Consult `ai-compatibility-matrix.md` for full consumption details.
 
### AI Data Schema
 
Defines the subset of model objects the AI should prioritize. Configure in Power BI Desktop or Service via **Home → Prep data for AI → Simplify data schema**.
 
**Guidance to provide the user:**
- Select only tables, columns, and measures relevant to the agent's intended scope
- Include measure dependencies — if a measure references other measures or columns, include those too
- Match the same table selection when adding the semantic model to a Fabric Data Agent
- Exclude internal/technical columns (sort keys, surrogate IDs) that are already hidden
### AI Instructions
 
Free-text instructions that guide the DAX generation tool. Configure in **Prep data for AI → AI Instructions**.
 
**Critical constraint:** The FDA DAX generation tool ignores agent-level instructions for query generation. All DAX-influencing guidance must go in AI Instructions via Prep for AI.
 
**Template:**
```markdown
## Model Overview
[What the model covers, grain of fact tables, key relationships]
 
## Default Filters
- Always apply CurrentSchoolYearIndicator = TRUE for current-year queries
- Always apply YearToDateIndicator = 1 for fair year-over-year comparisons
- Apply both defaults unless the user explicitly specifies a different time scope
 
## Key Business Rules
[Critical logic — e.g., "Incident Count measures events, Occurrence Count measures student-incident interactions"]
 
## Term Definitions
[Domain-specific terms with exact meaning in this model]
- "Campus" = an individual HISD school (not a university campus)
- "Feeder pattern" = a cluster of schools feeding into a single high school
- "SY" = School Year (e.g., SY 2024-25)
 
## When Asked About
[Query routing patterns with DAX hints]
- **Enrollment by campus**: Use [Student Count] from Fact_CampusEnrollmentSummary filtered by Dim_CampusInformationList
- **District-wide enrollment**: Use [Student Count] from Fact_DistrictEnrollmentSummary
 
## Example Column Values
[Help the AI match user language to actual column values]
- SchoolCategoryLong: "Elementary School", "Middle School", "High School", "Combined"
- FederalRaceEthnicity: "Hispanic", "African American", "White", "Asian", "Two or More"
```
 
### Verified Answers
 
Pre-approved visual responses triggered by specific questions. Configure in **Prep data for AI → Verified answers**.
 
**How they work with FDA:** The agent doesn't return the Power BI visual itself. It uses the trigger phrases and the visual's properties (columns, measures, filters) to influence DAX query generation via semantic similarity matching.
 
**Guidance to provide the user:**
- Use complete, natural-language questions as triggers (not partial phrases)
- Cover the most common / highest-stakes questions first
- Include variations of phrasing for the same question
- Test trigger matching before deploying — the system returns verified answers when user questions are semantically similar to triggers
---
 
## HISD Domain Knowledge
 
Use these synonyms and terms when enhancing HISD models.
 
| Concept | Synonyms to Include |
|---------|---------------------|
| Campus | school, building, site, location |
| Student | pupil, scholar, learner, child |
| Enrollment | registered, headcount, student count |
| STAAR | state assessment, Texas assessment |
| MAP | NWEA, growth assessment |
| Discipline | behavior, incident, referral |
| ISS | in-school suspension |
| OSS | out-of-school suspension |
| DAEP | disciplinary alternative education program |
| Attendance | present, absent, ADA |
| SPED | special education, special ed |
| ELL | English language learner, ESL, emergent bilingual, EB |
| TEA | Texas Education Agency |
| TEKS | Texas Essential Knowledge and Skills, standards |
| TELPAS | Texas English Language Proficiency Assessment System |
| Feeder Pattern | cluster, feeder, school cluster |
| School Year (SY) | academic year, SY |
 
---
 
## Quality Gates
 
Complete all checks before returning enhanced output.
 
### Truncation
- [ ] Pre-flight check passed (file ends with partition + source block)
- [ ] Object Count Handshake completed if table has > 12 columns/measures
### Descriptions
- [ ] All tables have `///` descriptions ≤ 200 characters
- [ ] All columns (visible AND hidden) have `///` descriptions ≤ 200 characters
- [ ] All measures have `///` descriptions ≤ 200 characters
- [ ] No filler phrases used
### Synonyms
- [ ] All visible columns have both `Synonyms` and `SynonymCollection` (3–7 terms)
- [ ] All measures have both `Synonyms` and `SynonymCollection` (3–7 terms)
- [ ] All tables have both `Synonyms` and `SynonymCollection` (3–7 terms)
- [ ] No hidden columns have synonyms
- [ ] No excluded generic terms in any synonym list
- [ ] Both annotation formats contain identical terms
### Relationships
- [ ] All relationships follow `{FromTable}_to_{ToTable}_via_{KeyDescription}` pattern
- [ ] No GUID-named relationships remain
### Fidelity
- [ ] All `lineageTag` and GUID values preserved verbatim
- [ ] All non-AI annotations preserved (`SummarizationSetBy`, `PBI_FormatHint`, `changedProperty`, etc.)
- [ ] No phantom annotations added
- [ ] `sourceColumn` and `sourceLineageTag` unchanged (even when column display name is renamed)
### Output
- [ ] Valid TMDL syntax throughout
- [ ] Output is complete and copy-paste ready (or downloadable `.tmdl` file)
### Prep for AI (when applicable)
- [ ] AI Instructions follow the template structure
- [ ] Default filters (CurrentSchoolYearIndicator, YearToDateIndicator) documented
- [ ] Term definitions match actual column values
- [ ] Verified answer triggers use complete natural-language questions