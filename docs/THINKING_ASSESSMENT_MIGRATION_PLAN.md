# Student Thinking Assessment Module — Database Migration Plan & Express Collections

## 1. Architecture & Persistence Strategy

Virat Student 360° uses a multi-tenant Express JSON document store (`.data/virat_student_360.json`) managed by `server/store.ts` with strict `schoolId` tenant isolation. To support full SSB-style **SRT, WAT, TAT, and PPDT** workflows without altering or risking any existing ERP, Notebook, Learners Score, or 15-OLQ collections, the module uses an **additive, zero-downtime, idempotent migration plan**.

All new Express collections live cleanly alongside existing collections:

| Collection Key | Purpose | Primary Key | Foreign Keys / Tenant Scope |
|---|---|---|---|
| `thinkingQuestionBank` | Age/class-wise prompt bank across SRT, WAT, TAT, PPDT | `id` (`tq-*`) | `schoolId`, `targetOlqs: OlqKey[]` |
| `thinkingScoringConfigs` | Per-school thresholds, marker dictionaries, & corroboration minimum | `schoolId` | `schoolId` |
| `thinkingAssessments` | Unified session envelope (student attempt, 4 dimensions, AI draft, review) | `id` (`ts-*`) | `schoolId`, `studentId` |
| `srtRecords` | Normalized Situation Reaction Test records (10 sub-dimensions) | `id` (`srt-rec-*`) | `schoolId`, `sessionId`, `studentId`, `questionId` |
| `watRecords` | Normalized Word Association Test records (latency, syntax, patterns) | `id` (`wat-rec-*`) | `schoolId`, `sessionId`, `studentId`, `questionId` |
| `tatRecords` | Normalized Thematic Apperception Test stories (arc + 6 traits + sequence) | `id` (`tat-rec-*`) | `schoolId`, `sessionId`, `studentId`, `questionId` |
| `ppdtRecords` | Normalized PPDT perception, individual narration, & group discussion rubric | `id` (`ppdt-rec-*`) | `schoolId`, `sessionId`, `studentId`, `questionId` |
| `thinkingOlqMappings` | Explicit relational bridge mapping each record onto the 15 `OLQ_DEFINITIONS` | `id` (`tom-*`) | `schoolId`, `studentId`, `recordId`, `olqKey`, `evidenceSourceKey` |
| `databaseMigrations` | Append-only versioned migration execution & integrity audit ledger | `id` (`mig-*`) | Global (`version`, `module`, `status`) |

---

## 2. Format-Specific Record Schemas

Every normalized record extends `ThinkingRecordBase` (`id`, `schoolId`, `sessionId`, `studentId`, `studentName`, `classSection`, `questionId`, `difficulty`, `ageBand`, `classRange`, `timedMode`, `timeLimitSec`, `responseTimeMs`, `dimensionScores` [4 separate dimensions], `autoPatternFlags`, `olqSignals`, `reviewStatus`, `reviewedBy`, `reviewedAt`, `createdAt`, `updatedAt`).

### A. `srtRecords` (Situation Reaction Test)
- `situationTitle`, `situationPrompt`, `responseText`
- `subDimensions` (0–100 across all 10 behavioural factors):
  `speedOfResponse`, `practicalThinking`, `decisionMaking`, `responsibility`, `initiative`, `positiveAttitude`, `problemSolving`, `emotionalMaturity`, `teamOrientation`, `selfAwareness`

### B. `watRecords` (Word Association Test)
- `cueWord`, `responseText`, `wordCount`
- `sentenceConstruction`: `'coherent_complete' | 'fragment' | 'one_word'`
- `underlyingPattern` & `patternTags`: `'constructive' | 'positive' | 'practical' | 'responsible' | 'self_centred' | 'avoidant' | 'neutral'`

### C. `tatRecords` (Thematic Apperception Test)
- `sceneCode`, `sceneCaption`, `storyText`, `historicalSequenceNo`
- `storyStructure`: `{ protagonist, objective, challenges, actions, outcome }`
- `traitEvaluation` (0–100): `{ initiative, planning, confidence, responsibility, empathy, problemSolving }`

### D. `ppdtRecords` (Picture Perception & Discussion Test)
- `sceneCode`, `sceneCaption`, `workflowMode` (`'Individual' | 'Group'`), `storyText`
- `perception`: `{ charactersCount, approximateAges, mood, centralSituation, narrationSummary }`
- `groupDiscussion` (optional teacher/counsellor rubric): `{ groupId, groupTitle, communication, cooperation, initiative, listening, leadership, evaluatorName, evaluatorNotes, evaluatedAt }`

---

## 3. Mapping to Existing 15-OLQ Framework & `DevelopmentEvidence`

Records never write directly into `StudentRecord` or duplicate scores inside `evidence`. Instead, every record writes deterministic rows into `thinkingOlqMappings` referencing the existing `OLQ_DEFINITIONS` (`OlqKey` + `OlqGroup`), and only promotes into `DevelopmentEvidence` (`sourceType: 'thinking_assessment'`, deterministic `sourceKey: thinking:${schoolId}:${studentId}:corroborated`) when **both**:
1. `corroboratedResponseCount >= thinkingScoringConfigs[schoolId].minCorroborationCount` (default **3**), AND
2. A teacher/counsellor/principal explicitly reviews and promotes the assessment.

| Test Format | Mapped `OlqKey` | Existing `OlqGroup` | Weight | Derivation Rule |
|---|---|---|---:|---|
| **SRT** | `effective_intelligence` | Planning and Organising | 0.22 | `practicalThinking * 0.60 + problemSolving * 0.40` |
| **SRT** | `reasoning_ability` | Planning and Organising | 0.18 | `problemSolving * 0.55 + decisionMaking * 0.45` |
| **SRT** | `speed_of_decision` | Social Effectiveness | 0.16 | `decisionMaking * 0.65 + speedOfResponse * 0.35` *(quality-gated)* |
| **SRT** | `sense_of_responsibility` | Social Adjustment | 0.16 | `responsibility * 0.65 + selfAwareness * 0.35` |
| **SRT** | `initiative` | Social Effectiveness | 0.14 | `initiative * 0.70 + positiveAttitude * 0.30` |
| **SRT** | `cooperation` | Social Adjustment | 0.14 | `teamOrientation * 0.70 + emotionalMaturity * 0.30` |
| **WAT** | `power_of_expression` | Planning and Organising | 0.28 | `betterThinking + sentenceConstruction` clarity bonus |
| **WAT** | `liveliness` | Social Effectiveness | 0.26 | `positiveThinking` constructive framing |
| **WAT** | `social_adaptability` | Social Adjustment | 0.24 | `100 - selfCentredThinking` cooperative patterns |
| **WAT** | `self_confidence` | Social Effectiveness | 0.22 | `positiveThinking * 0.55 + betterThinking * 0.45` |
| **TAT** | `organising_ability` | Planning and Organising | 0.22 | `planning` + structured narrative arc completeness |
| **TAT** | `initiative` | Social Effectiveness | 0.20 | `initiative` protagonist action steps |
| **TAT** | `determination` | Dynamic Qualities | 0.20 | `problemSolving * 0.55 + confidence * 0.45` |
| **TAT** | `sense_of_responsibility` | Social Adjustment | 0.20 | `responsibility * 0.65 + empathy * 0.35` |
| **TAT** | `courage` | Dynamic Qualities | 0.18 | `confidence * 0.60 + problemSolving * 0.40` |
| **PPDT** | `power_of_expression` | Planning and Organising | 0.22 | GD `communication * 10` (or story `betterThinking`) |
| **PPDT** | `cooperation` | Social Adjustment | 0.22 | GD `(cooperation * 0.6 + listening * 0.4) * 10` |
| **PPDT** | `influence_group` | Social Effectiveness | 0.20 | GD `(leadership * 0.65 + communication * 0.35) * 10` |
| **PPDT** | `initiative` | Social Effectiveness | 0.18 | GD `initiative * 10` |
| **PPDT** | `effective_intelligence` | Planning and Organising | 0.18 | Scene perception & realistic outcome synthesis |

---

## 4. Ordered, Idempotent Migration Steps

Executed automatically on store boot (`server/store.ts` → `runThinkingAssessmentMigrations(db)`) and inspectable/re-runnable via `/api/thinking/migrations/*`:

1. **`2026_11_19_001_init_thinking_collections`** — Initializes empty arrays for `srtRecords`, `watRecords`, `tatRecords`, `ppdtRecords`, `thinkingOlqMappings`, and `databaseMigrations` if missing on existing JSON stores.
2. **`2026_11_19_002_backfill_format_records_from_sessions`** — Iterates chronologically through all existing `thinkingAssessments`, normalizing each response into `srtRecords`, `watRecords`, `tatRecords`, or `ppdtRecords` with deterministic IDs (`<fmt>-rec-<sessionId>-<idx>`). Safe to re-run with zero duplicates.
3. **`2026_11_19_003_build_olq_framework_mapping_ledger`** — Populates `thinkingOlqMappings` (`tom-<recordId>-<olqKey>`) with exact weights, rationale, corroboration counts, and `evidenceSourceKey` links to existing `DevelopmentEvidence` entries.
4. **`2026_11_19_004_verify_tenant_and_corroboration_integrity`** — Audits `schoolId` validity, student referential integrity, and enforces that `promotedToEvidence` is strictly `false` unless `corroborationSatisfied && Boolean(reviewedBy)`.

### Rollback & Non-Destructive Safety
- All migrations are strictly **additive**; existing `students`, `evidence`, `notebookEntries`, `examMarks`, and `thinkingAssessments` are never dropped or overwritten.
- Rolling back simply ignores the normalized collections while preserving `thinkingAssessments` and `evidence` untouched.

---

## 5. Express Collection API Endpoints

All routes enforce `requireAuth`, active tenant isolation (`req.activeSchoolId`), and role-based access control (students/parents can only read their own linked student records):

- `GET /api/thinking/collections/schema` — Returns collection schemas, OLQ mapping matrix, and live migration status.
- `GET /api/thinking/migrations/status` — Returns applied/pending migration ledger and tenant collection counts (Staff).
- `POST /api/thinking/migrations/run` — Re-runs idempotent sync & integrity checks (Leadership/Admin, audit-logged).
- `GET /api/thinking/collections/srt` & `POST /api/thinking/collections/srt` — Query / create validated SRT records.
- `GET /api/thinking/collections/wat` & `POST /api/thinking/collections/wat` — Query / create validated WAT records.
- `GET /api/thinking/collections/tat` & `POST /api/thinking/collections/tat` — Query / create validated TAT records.
- `GET /api/thinking/collections/ppdt` & `POST /api/thinking/collections/ppdt` — Query / create validated PPDT records.
- `GET /api/thinking/collections/olq-mappings` — Query the Thinking-to-15-OLQ mapping ledger by `studentId`, `testType`, `olqKey`, or `olqGroup`.
