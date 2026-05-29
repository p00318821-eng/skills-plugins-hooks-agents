# AI Compatibility Matrix
 
What each AI consumer reads from Power BI semantic model metadata (verified as of May 2026).
 
## Metadata Consumption by AI System
 
| Metadata | Copilot Q&A (Report) | Copilot (Service) | FDA DAX Tool |
|---|---|---|---|
| Table/column/measure **names** | ✅ | ✅ | ✅ |
| `///` description property | ✅ | ✅ | ✅ |
| `annotation Synonyms` (pipe-delimited) | ✅ | ❌ | ❌ |
| `annotation SynonymCollection` (JSON array) | ❌ | ✅ | ✅ |
| Relationship structure (cardinality, filter direction) | ✅ | ✅ | ✅ |
| Prep for AI → AI Instructions | ✅ | ❌ | ✅ |
| Prep for AI → AI Data Schema | ✅ | ❌ | ✅ |
| Prep for AI → Verified Answers | ✅ | ❌ | ✅ |
| Report visual metadata | ❌ | ❌ | ✅ |
| Custom annotations (AI_Category, etc.) | ❌ | ❌ | ❌ |
 
## Key Implications
 
### Invest in (consumed by at least one AI system)
- Business-readable object names — highest-ROI optimization across all three systems
- `///` descriptions — universally consumed
- Both synonym annotation formats — `Synonyms` (pipe) feeds Copilot Q&A in Report; `SynonymCollection` (JSON array) feeds FDA + Copilot in Service
- Prep for AI configuration — AI Instructions, AI Data Schema, and Verified Answers feed Copilot in Report and FDA DAX tool
- Clear relationship structure — naming, cardinality, filter direction

### Do not invest in (consumed by nothing)
- Custom annotations beyond `Synonyms` and `SynonymCollection` (e.g., `AI_Category`, `AI_CommonFilters`, `Copilot_QueryHints`, `FDA_TechnicalContext`) — no AI system reads these
- `///` descriptions on relationships — TMDL does not support this syntax
- `///` descriptions on partitions or annotations — not supported

## Q&A Deprecation Note (December 2026)
 
Microsoft announced Power BI Q&A retirement by December 2026. At that point:
- `annotation Synonyms` (pipe-delimited) will lose its only consumer (Copilot Q&A in Report)
- `annotation SynonymCollection` (JSON array) becomes the sole synonym mechanism
- Until then, enforce both formats to maintain full coverage