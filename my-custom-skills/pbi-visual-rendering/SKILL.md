---
name: pbi-visual-rendering
description: >
  Power BI visual rendering engine for Vega (Deneb custom visual) and HTML Content custom visual (WA200001930). Use this skill whenever the user asks to create, modify, debug, or iterate on Deneb/Vega specs, Vega-Lite specs, or DAX measures that return HTML for the HTML Content visual. Also trigger on mentions of: Deneb, Vega JSON, pbiCrossFilterApply, HTML Content visual, HTML tags/KPI card, Sankey, calendar grid, bullet chart, trend chart, badge/pill/tag visuals, or any Power BI visual rendering that targets these two custom visuals. Trigger even for partial requests like "add a tooltip to my Deneb spec" or "color the badges red when negative". If the user references an existing spec and wants changes, use BEFORE/AFTER patch methodology.
---
 
# Power BI Visual Rendering
 
Generate complete, production-ready visuals for Power BI Desktop targeting two custom visuals:
 
- **Deneb** — Vega (full spec) or Vega-Lite (only if explicitly requested)
- **HTML Content** — DAX measures returning HTML (AppSource WA200001930, Daniel Marsh-Patrick)
---
 
## 0 │ PLANNING PHASE (GRILL-ME)
 
Before building a **new** visual, invoke the `/grill-me` protocol: interview the user one question at a time, walking each branch of the design decision tree until shared understanding is reached. For each question, provide a recommended answer.
 
**Triggers planning:** new spec creation, engine selection (Deneb vs HTML Content), unfamiliar dataset, complex interaction requirements, or any request where requirements are ambiguous.
 
**Skips planning:** BEFORE/AFTER patches on an existing spec, single-property changes ("change this color", "add a tooltip"), bug fixes, or when the user supplies a complete spec and a clear modification request.
 
If a question can be answered by inspecting the user's uploaded spec or dataset fields, inspect instead of asking.
 
---
 
## 1 │ OUTPUT RULES (NON-NEGOTIABLE)
 
- **Always return FULL working output**
  - Vega: complete JSON spec (`$schema` included)
  - HTML Content: complete DAX measure (not a fragment)
- Never return partial code or pseudocode
- No placeholders unless explicitly requested
- No explanations unless explicitly requested
- No markdown wrapping unless user asks
---
 
## 2 │ PATCH METHODOLOGY (BEFORE / AFTER)
 
When the user supplies an existing spec and requests a modification:
 
1. **Show BEFORE block** — the exact code segment being changed, enough for the user to locate it unambiguously.
2. **Show AFTER block** — the replacement code with the change applied.
3. For **new insertions**, show the BEFORE of the adjacent anchor code so the user knows where to add, then the AFTER with the new code in place.
4. **Never change unrelated code or documentation** unless explicitly improving or removing.
5. **Once code is set, treat it as stable** — do not rewrite or reformat unless the user requests a change.
**When to provide a full replacement instead:** If a modification requires more than 3 BEFORE/AFTER pairs, provide the complete replacement spec and note what changed in a concise summary. The 3-pair threshold keeps patches readable; beyond that a full spec is easier to validate.
 
---
 
## 3 │ VEGA (DENEB) RULES
 
### Required Structure
 
Every Vega spec must include:
 
- `"$schema": "https://vega.github.io/schema/vega/v5.json"`
- `data` section (with `"name": "dataset"` as the Power BI source)
- `scales`
- `signals` (if any interaction exists)
- `marks`
### Sizing & Autosize
 
- **Fixed dimensions** — use explicit `width`/`height` with `padding` for single-view specs (Calendar pattern).
- **Responsive fit** — use `"autosize": {"type": "fit", "contains": "padding"}` for specs that should fill their container (Sankey/small-multiples pattern).
- Default padding: `{"top": 10, "bottom": 10, "left": 5, "right": 5}` unless the layout requires adjustment.
- **Container math:** `height + padding.top + padding.bottom` must equal the Power BI container height. Document this as a comment in the spec so resizes are a single calculation.
### Interaction Architecture
 
- **Signal-driven** — prefer signals for all user interaction (navigation, selection tracking, hover state).
- **Bounded navigation** — when navigating temporal data, derive `data_bounds` from dataset min/max and clamp navigation signals to those bounds.
### Cross-Filtering (Deneb ↔ Power BI)
 
```
/* Apply cross-filter on click/mouseup */
pbiCrossFilterApply(event, "datum['FieldName'] == _{FieldName}_")
 
/* Clear cross-filter */
pbiCrossFilterClear()
 
/* Selection state encoding — use __selected__ */
datum['__selected__'] == 'on'   → full opacity / highlight stroke
datum['__selected__'] == 'off'  → dimmed opacity
```
 
**Which cross-filter syntax to use:**
 
- **Single-field filter** → use `_{FieldName}_` placeholder syntax directly in the signal update expression. Simpler, no pre-computation needed.
- **Multi-field filter** → build a `filterString` via formula transform on the data, then reference `datum.filterString` in the signal. Necessary when the cross-filter must match on two or more fields simultaneously.
**Selection patterns (from reference specs):**
 
- **Direct cell selection** (Calendar pattern — single-field):
  ```json
  {
    "events": "@cell_rect:mouseup",
    "update": "datum.hasData ? pbiCrossFilterApply(event, \"datum['CalendarDate'] == _{CalendarDate}_\") : null"
  }
  ```
- **Toggle selection with ratio tracking** (Sankey pattern — multi-field):
  ```json
  {
    "events": "rect:click",
    "update": "datum.selectionRatio >= 0.95 ? pbiCrossFilterClear() : pbiCrossFilterApply(event, datum.filterString)"
  }
  ```
- **Selection tracker data source** — derive a filtered copy of `dataset` where `__selected__ == 'on'` and use `hasSelection` signal to drive opacity cascades.
### Opacity Cascade (standard pattern)
 
When cross-filtering is active, apply this precedence:
 
1. `!hasSelection` → full opacity (no filter active)
2. `selectionRatio >= 0.95` → full opacity + highlight stroke (fully selected)
3. `selectionRatio > 0` → partial opacity (partially selected)
4. fallback → dimmed (0.1–0.3)
### Hover Encoding
 
Apply hover blocks on interactive marks for visual feedback:
 
```json
"hover": {
  "fillOpacity": {"value": 0.8},
  "tooltip": {
    "signal": "{'Label': datum.category, 'Value': format(datum.value, ',')}"
  }
}
```
 
- Tooltip signal returns an object — Deneb renders it as a key-value tooltip automatically.
- Use `format()` for numbers (`,` for thousands, `.1%` for percentages).
- Hover should reduce `fillOpacity` slightly (0.7–0.85) to indicate interactivity.
### Mark Interactivity
 
- Set `"interactive": false` on label/annotation text marks to prevent them from capturing mouse events intended for underlying data marks. Without this, text overlapping a `rect` or `path` will intercept clicks and break cross-filtering.
### Transform Preferences
 
- Prefer **explicit transforms** over implicit behavior.
- Use `lookup` to join dataset fields onto generated grids.
- Use `stack` + `joinaggregate` for proportional layouts (Sankey nodes).
- Use `linkpath` with `orient: "horizontal"` and `shape: "diagonal"` for flow connections.
- Use `sequence` + `formula` for generated grids (calendar days).
- Build `filterString` via formula for multi-field cross-filter expressions.
### Layout
 
- Use `layout` with `facet` for small multiples; set explicit `width`/`height` on group marks.
- Define inner signals (`width`, `height`, `linkFactor`) inside group marks when faceting.
### Field Naming & Gotchas
 
- Preserve field names from the dataset exactly (`CalendarDate`, `StudentCount`, `EntryDescription`, etc.).
- Use `"name": "dataset"` as the standard Power BI data source name.
- **CRITICAL — Periods (`.`) in field/measure names:** Deneb silently converts `.` to `_` in field names. This breaks `fold`, `indexof`, and any string-matching expression that references the original name. The visual renders blank with no error. **Never use periods in measure names that feed a Deneb visual.** Rename measures upstream if needed.
- **Angle brackets (`< >`) in field names** also break Deneb field resolution. They work fine inside signal expression strings (e.g., ternary labels like `datum.tier == 0 ? '<5%' : '...'`), but must not appear in the actual field/measure name.
### fontWeight Values
 
Vega accepts `"bold"`, `"normal"`, or numeric `100`–`900`. **`"semi-bold"` is not a valid Vega value** — use `600` instead. This causes rendering failures that can mask other bugs.
 
### Null / NaN Guards
 
After any `fold` transform, immediately add a coalesce formula to convert null values to 0:
```json
{"type": "formula", "as": "count", "expr": "isValid(datum.count) ? datum.count : 0"}
```
This prevents downstream `stack`/`aggregate`/`joinaggregate` from producing NaN, which causes invisible rendering failures.
 
For Vega-Lite specs, use a `calculate` transform:
```json
{"calculate": "isValid(datum['fieldName']) ? datum['fieldName'] : 0", "as": "fieldName"}
```
 
### External Overflow Labels (Stacked Bar Pattern)
 
When bar segments are too small to fit internal labels, render labels above/outside the bar. Key rules:
 
1. **Data source must match** — external label text marks must use `"from": {"data": "external_labels"}`, not the parent `stacked` dataset. The parent lacks `extRank`/`extCount` fields, causing all labels to render at the same Y position or NaN. This was a major multi-iteration bug.
2. **Dual-threshold sync** — the data-side filter (`segPx < 14`) and render-side hide condition (`scale('y',...) < 14`) must use the same pixel cutoff. Mismatch → segments hidden internally but not shown externally.
3. **Window sort order** — `extRank` must sort `tierOrder` **descending** so the highest severity gets rank 1. The Y offset formula `(extCount - extRank) * spacing` places labels in correct visual order matching segment positions.
4. **Tier-colored indicators** — use `symbol` circle marks (not connector lines) positioned left of the external label text, sharing the same Y offset and `tierColor` fill.
### Vega-Lite View Border
 
Faint rectangle lines at the bottom/right of Vega-Lite visuals are the default view border. Remove with:
```json
"config": { "view": {"stroke": "transparent"} }
```
 
### Rendering Constraints (Power BI Desktop)
 
Power BI Desktop uses an older Chromium shell. Avoid features with inconsistent support:
 
- **CSS:** no `backdrop-filter`, no `clamp()`, no `@container` queries, no `has()` selector.
- **SVG:** no SVG filter effects beyond basic `feGaussianBlur`. Avoid `feComposite`, `feMorphology`.
- Stick to well-supported Vega primitives — `rect`, `text`, `path`, `arc`, `line`, `area`, `symbol`.
- Test any edge-case rendering in Desktop, not just the Service (the Service runs a newer browser).
---
 
## 4 │ HTML CONTENT VISUAL RULES
 
### Target Visual
 
**HTML Content** custom visual (AppSource WA200001930) by Daniel Marsh-Patrick. Two editions exist:
 
- **HTML Content (uncertified)** — full DOM access, `<script>` tags allowed, can load external resources. Use when the user explicitly needs JavaScript or advanced DOM manipulation.
- **HTML Content (lite / certified)** — reduced tag set, no `<script>`, no external URLs. Complies with Power BI certification requirements. Assume this edition unless the user states otherwise.
DAX measures return complete HTML strings rendered inside the visual's container.
 
### CSS Rules
 
- `<style>` blocks with class-based CSS **and** inline styles are both valid.
- No external dependencies — no CDN links, no frameworks, no external fonts.
- No JavaScript unless explicitly requested (and only if using the uncertified edition).
- Layout must be responsive, visually balanced, and consistent-spaced inside the Power BI container.
- **Desktop rendering note:** same Chromium constraints as Deneb — avoid `backdrop-filter`, `clamp()`, `@container`, `has()`.
### CSS Specificity with table-layout: fixed
 
`table-layout: fixed` is the standard for HTML Content tables (prevents content-driven column blowout). Key gotchas:
 
1. **Width is read from the first row only.** If the first row has `colspan` headers, the browser ignores widths on subsequent rows' `<th>` elements. Individual column widths become uncontrollable.
2. **`<colgroup>` / `<col>` elements break the HTML Content visual** — the visual strips them, causing the entire table to render blank. Do not use.
3. **Workaround for colspan headers:** Add a hidden zero-height row as the first row in `<thead>`, with one `<th>` per column carrying explicit widths:
   ```html
   <tr style='height:0; line-height:0; visibility:hidden;'>
     <th style='width:8%; padding:0;'></th>
     <th style='width:6%; padding:0;'></th>
     <!-- one per column -->
   </tr>
   ```
4. **Specificity trap:** `.acc-tbl td` (0,1,1) beats `.col-delta` (0,1,0) for `text-align`. Fix by splitting structural and alignment rules:
   ```css
   .col-delta { border-left: 1px solid #00A3AF; width: 12%; }        /* th + td */
   .acc-tbl td.col-delta { text-align: center; vertical-align: middle; }  /* td only */
   ```
   This keeps `width` on both `<th>` and `<td>` (so `table-layout: fixed` reads it from the header) while overriding alignment on `<td>` only.
5. **Always sum percentage widths** before testing. If they exceed 100%, `table-layout: fixed` produces horizontal scroll or clipping.
### DAX Measure Structure
 
Follow the sectioned pattern:
 
```
/* SECTION 1 │ DYNAMIC ANCHORS (year offsets, context values) */
/* SECTION 2 │ CSS STYLING */
/* SECTION 3 │ METADATA / CONFIG */
/* SECTION 4 │ ROW/COLUMN CONSTRUCTION (CONCATENATEX iteration) */
/* SECTION N │ FINAL HTML ASSEMBLY */
RETURN CSS & Content & Footer
```
 
### DAX Gotchas
 
**SELECTEDVALUE vs MAX for label lookups:**
`SELECTEDVALUE` fails when the HTML Content visual's filter context includes multiple calendar rows — it returns BLANK with no error. **Use `MAX()` for `Dim_DistrictCalendar` label lookups in HTML Content measures.** Example:
```dax
/* WRONG — returns BLANK in multi-row context */
VAR LabelLatest = CALCULATE(SELECTEDVALUE(Dim_DistrictCalendar[SchoolYearShortLabel]),
    Dim_DistrictCalendar[SchoolYearRelativeOffset] = OffsetLatest)
 
/* CORRECT — collapses to single value regardless of context */
VAR LabelLatest = CALCULATE(MAX(Dim_DistrictCalendar[SchoolYearShortLabel]),
    Dim_DistrictCalendar[SchoolYearRelativeOffset] = OffsetLatest)
```
 
**Measures cannot be inline CALCULATE filters:**
Using a measure directly in a CALCULATE filter predicate (e.g., `Column = [SomeMeasure]`) throws a `PLACEHOLDER` error. Always capture the measure result in a VAR first:
```dax
/* WRONG — PLACEHOLDER error */
CALCULATE(..., Dim_DistrictCalendar[SchoolYearRelativeOffset] = [LatestOffset])
 
/* CORRECT — capture in VAR, then reference */
VAR _Offset = [LatestOffset]
... CALCULATE(..., Dim_DistrictCalendar[SchoolYearRelativeOffset] = _Offset)
```
 
**Debug strategy for blank measures:**
When a measure returns blank, strip the RETURN to raw output to isolate which variable fails:
```dax
RETURN _Offset & " | " & _SubjectCount
```
This forces a string return that bypasses BLANK() filters and reveals which variable is the culprit.
 
### Standard Patterns
 
**Tag / Pill Capsules:**
- `_BaseStyle` VAR as reusable inline style template
- Conditional `<span>` rendering per indicator flag
- Color override via inline `background-color` / `color` on the span
- Flex-wrap container for layout
**Styled Tables (single or multi-year):**
- `DATATABLE` or `SUMMARIZE` for metadata-driven rows
- Nested `CONCATENATEX` (outer = row groups, inner = columns or year offsets)
- `HasData` guard to skip empty sections → `""` omitted by CONCATENATEX
- Header row as reusable VAR template
**Delta Badges:**
- `SWITCH(TRUE(), ...)` with paired BG/Text color VARs per threshold
- `FORMAT(value, "+0%;-0%;0%")` three-section format for signed percentages
- Badge HTML: `<span class='bdg' style='background:{BG};color:{TX};'>{text}</span>`
- Separator dots between badges: `<span class='sep'>·</span>`
**Conditional Indicators:**
- Star icons (★) for highlights, colored arrows (▲▼■) for trends
- SUBSTITUTE chains to wrap arrows in colored `<span>` tags
**Density-Adaptive Row Spacing:**
For tables that serve campuses with varying subject/grade counts:
```dax
VAR _Density = SWITCH(TRUE(), TotalRows < 10, "low", TotalRows >= 14, "high", "normal")
VAR _TdPad   = SWITCH(_Density, "low", "2px 2px", "high", "0px 2px", "1px 2px")
VAR _ThPad   = SWITCH(_Density, "low", "3px 2px", "high", "1px 2px", "2px 2px")
VAR _TitleMT = SWITCH(_Density, "low", "12px",    "high", "2px",     "4px")
```
Inject these VARs into the CSS block via string concatenation. Keeps compact campuses readable and dense campuses from overflowing.
 
### Color Logic Patterns
 
Color thresholds adapt to the domain — two standard approaches:
 
- **Binary** (positive/negative): `IF(value >= 0, green, red)` — used for delta badges.
- **Tiered severity**: `SWITCH(TRUE(), val < T1, color1, val < T2, color2, ...)` with paired BG/Text VARs per tier — used for absenteeism, risk levels, performance bands. Always define both `_BGColor` and `_TxtColor` VARs together to maintain contrast.
### Year Offset Anchor Pattern
 
```dax
VAR OffsetLatest = [Domain_LatestOffset]
VAR OffsetY1     = OffsetLatest - 1
VAR OffsetY2     = OffsetLatest - 2
VAR LabelLatest  = CALCULATE(MAX(Dim_DistrictCalendar[SchoolYearShortLabel]),
                     Dim_DistrictCalendar[SchoolYearRelativeOffset] = OffsetLatest)
```
 
Use offset VARs to drive CALCULATE filters; use label VARs for display headers. Note: `MAX()` not `SELECTEDVALUE()` — see DAX Gotchas above.
 
---
 
## 5 │ SHARED CONVENTIONS
 
### Color Palette (HISD Brand)
 
| Token | Hex | Usage |
|---|---|---|
| Teal | `#00A3AF` | Primary accent, borders, icons, star highlights |
| Dark Teal | `#24383C` | Body text, titles, navigation |
| Coral/Red | `#D96364` | Negative values, absent, leaver |
| Green | `#6DB83D` | Positive values, present, remain |
| Forest Green | `#006F5B` | Secondary positive (new enroll) |
| Purple | `#474F99` | Tertiary category (returned) |
| Grey | `#666666` | Neutral category (mover) |
| Light Grey | `#D3D3D3` | No-data cells |
| Border Grey | `#B3B3B3` | Row separators |
| Muted Text | `#506063` / `#7C888A` | Secondary labels |
 
### Typography
 
- Font: `Segoe UI` (primary), `Segoe UI Semibold` for emphasis
- Body: 9pt; Headers: 8.5pt bold; Titles: 10pt semibold
- **Deneb fontWeight:** use numeric `600` for semi-bold, never the string `"semi-bold"`
### General
 
- Optimize for clarity and rendering correctness over cleverness.
- Keep designs clean and production-ready.
- Avoid unnecessary complexity or abstraction.
---
 
## 6 │ DATA ASSUMPTIONS
 
- The user's dataset is already shaped correctly.
- Do NOT redesign the data model.
- Apply only transforms necessary for visualization (layout, aggregation, color encoding).
---
 
## 7 │ PATTERN REUSE
 
Prefer known visual patterns when applicable:
 
| Pattern | Engine | Reference |
|---|---|---|
| Calendar / Grid | Vega | `sequence` → `lookup` → band scales, weekday filter |
| Sankey / Flow | Vega | Dual-stack nodes, `linkpath`, faceted small multiples |
| 100% Stacked Column | Vega | `fold` → `aggregate` → `stack`, internal/external labels, legend circles |
| Horizontal Bar (Tiered) | Vega | `fold` → tier metadata formulas → band scale, legend circles in padding |
| KPI Card | Either | Single-value highlight with trend indicator |
| Bullet Chart | Vega | Target vs actual with threshold bands |
| Trend Chart | Vega | Time-series line/area with signal navigation |
| Tag / Pill | HTML Content | Capsule spans, conditional rendering, flex-wrap |
| Styled Table | HTML Content | Nested CONCATENATEX, year offsets, delta badges |
| Multi-Year Window Table | HTML Content | Data-existence flags per window, dynamic colspan, hidden width row |
 
When generating new visuals:
- **Reuse** structural logic (layout, spacing, encoding patterns, color schemes) from known patterns.
- **Do NOT invent new patterns** unless the requirement cannot be met by adapting an existing one.
---
 
## 8 │ RESET PROMPT PATTERN
 
For complex Deneb specs requiring multi-session development, generate a **reset prompt** document that captures:
 
1. **Current spec JSON** — complete, all patches applied
2. **Container dimensions** — Power BI visual container height × width
3. **Dataset fields** — exact measure/column names
4. **Architecture** — data pipeline description (fold → aggregate → stack, etc.)
5. **Lessons learned** — specific bugs encountered and their resolutions
6. **Open items** — known tech debt or pending refinements
This maximizes context in a fresh chat and prevents re-discovering the same bugs across sessions.