# Database

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** The source of truth for the data model. No table, column, enum or relationship should exist in code unless it is defined here. If a change is needed, update this document first.
> **Depends on:** PRD.md (F4 data labels, A-08, W-01 to W-05), ARCHITECTURE.md, SECURITY.md.

---

## 1. Database Engine

**Database:** PostgreSQL 16 (proposed, ARCHITECTURE AR-D4)
**Hosting:** Not decided (AR-Q1). Must be managed, backed up, and encrypted at rest.

---

## 2. Naming Conventions

| Item | Convention |
|---|---|
| Tables | `snake_case`, plural (`family_sessions`) |
| Columns | `snake_case` |
| Primary keys | `id` of type `uuid` (default `gen_random_uuid()`) for entity tables. Lookup tables use a `code` text primary key |
| Foreign keys | `<singular_table>_id` (for example `session_id`, `trade_id`) |
| Timestamps | `created_at`, `updated_at` as `timestamptz` in UTC. Others as `<event>_at` |
| Booleans | `is_` or `has_` prefix |
| Enums | PostgreSQL `enum` types or text with `CHECK`, named `<thing>_enum`. Values are `snake_case` |
| Money | Integer rupees (`INR`) per month. Never floats |
| Percentages | `numeric(5,2)` between 0 and 100 |

Language-specific content uses paired columns `*_en` and `*_hi`.

---

## 3. Enums

| Enum | Values |
|---|---|
| `language_enum` | `hi`, `en` |
| `session_status_enum` | `active`, `completed`, `abandoned`, `deleted` |
| `session_mode_enum` | `both`, `learner_only`, `parent_only` |
| `participant_role_enum` | `learner`, `parent` |
| `message_sender_enum` | `learner`, `parent`, `assistant`, `system` |
| `input_mode_enum` | `text`, `voice`, `choice` |
| `data_type_enum` | `public_benchmark`, `pilot_demo`, `verified` |
| `record_scope_enum` | `provider`, `district`, `state`, `national` |
| `location_level_enum` | `state`, `district`, `block` |
| `concern_status_enum` | `open`, `addressed`, `unresolved` |
| `escalation_trigger_enum` | `user_request`, `repeated_unresolved`, `low_confidence_or_no_data`, `negative_sentiment`, `sensitive_topic` |
| `escalation_status_enum` | `open`, `assigned`, `resolved`, `unreachable`, `cancelled` |
| `priority_enum` | `normal`, `high` |
| `sentiment_checkpoint_enum` | `start`, `mid`, `end` |
| `sentiment_source_enum` | `self_report`, `model` |
| `staff_role_enum` | `counsellor`, `administrator`, `data_steward` |
| `age_band_enum` | `15_17`, `18_21`, `22_25` (per PRD A-04, to be confirmed) |

---

## 4. Tables

### 4.1 Reference and lookup tables

**`locations`**
Purpose: states, districts and (optionally) blocks used for families, providers and data.
Columns: `id`, `level` (`location_level_enum`), `parent_id` (self-FK, nullable), `state_code`, `name_en`, `name_hi`, `created_at`, `updated_at`.

**`education_levels`** *(lookup)*
Columns: `code` (PK), `label_en`, `label_hi`, `sort_order`.
Seed values: **TBD** (UX-Q5).

**`income_brackets`** *(lookup)*
Columns: `code` (PK), `label_en`, `label_hi`, `sort_order`.
Seed values and thresholds: **TBD**. Not invented here.

**`interest_options`** *(lookup)*
Columns: `code` (PK), `label_en`, `label_hi`, `icon`, `sort_order`.
Seed values: **TBD** (UX-Q5).

**`concern_categories`** *(lookup)*
Columns: `code` (PK), `label_en`, `label_hi`, `is_sensitive`, `sort_order`.
Seed values (from PRD F3): `earning_potential`, `job_security`, `social_status`, `growth_further_education`, `safety` (`is_sensitive = true`), `distance_travel`, `cost`, `only_for_failures`, `other`.

**`trades`**
Purpose: vocational trades covered.
Columns: `id`, `code` (unique), `name_en`, `name_hi`, `sector`, `entry_nsqf_level` (smallint), `description_en`, `description_hi`, `is_active` (pilot scope per W-05), `created_at`, `updated_at`.

**`providers`**
Purpose: training providers (for example ITIs or training centres).
Columns: `id`, `name`, `location_id` (FK), `provider_type` (text), `is_active`, `created_at`, `updated_at`.

**`data_sources`**
Purpose: where each outcome figure comes from.
Columns: `id`, `name`, `publisher`, `url`, `reference_year` (smallint), `description`, `created_at`, `updated_at`.

### 4.2 Outcome and pathway data

**`outcome_records`**
Purpose: the **only** source of outcome numbers shown to families (PRD D-05).
Columns:
- `id`
- `trade_id` (FK, required)
- `provider_id` (FK, nullable, required when `scope = provider`)
- `location_id` (FK, required)
- `scope` (`record_scope_enum`)
- `cohort_year` (smallint)
- `placement_rate_pct` (`numeric(5,2)`, nullable)
- `earnings_p25_inr`, `earnings_median_inr`, `earnings_p75_inr` (integer monthly rupees, nullable)
- `sample_size` (integer, nullable)
- `data_type` (`data_type_enum`, required)
- `source_id` (FK to `data_sources`, **required**)
- `verified_by` (FK to `staff_users`, nullable)
- `verified_at` (timestamptz, nullable)
- `notes`
- `created_at`, `updated_at`

Rules (enforced by `CHECK` constraints):
- `data_type = 'verified'` requires `verified_by` and `verified_at`. Any other `data_type` requires both to be null. (PRD A-08)
- `earnings_p25_inr <= earnings_median_inr <= earnings_p75_inr` when all are present.
- `placement_rate_pct` between 0 and 100.
- `source_id` is never null.

Note: the PRD's "verification status" field is represented by `data_type` plus the `verified_*` columns, avoiding duplicate fields that could disagree.

**`pathways`**
Columns: `id`, `trade_id` (FK), `name_en`, `name_hi`, `created_at`, `updated_at`.

**`pathway_steps`**
Columns: `id`, `pathway_id` (FK), `step_order` (smallint), `nsqf_level` (smallint, nullable), `title_en`, `title_hi`, `description_en`, `description_hi`, `step_type` (text: `qualification`, `job_role`, `further_education`), `typical_duration_months` (smallint, nullable), `created_at`, `updated_at`.
Unique: (`pathway_id`, `step_order`).

### 4.3 Family sessions

**`family_sessions`**
Purpose: one counselling session. Contains no names.
Columns: `id`, `token_hash` (hash of the opaque session token, unique), `resume_code_hash` (unique), `language` (`language_enum`), `mode` (`session_mode_enum`), `status` (`session_status_enum`), `location_id` (FK), `is_minor_or_unknown` (boolean), `created_at`, `updated_at`, `last_active_at`, `completed_at` (nullable), `deleted_at` (nullable).

**`session_profiles`**
Purpose: learner and parent profile answers.
Columns: `id`, `session_id` (FK), `role` (`participant_role_enum`), `education_level_code` (FK, nullable), `age_band` (`age_band_enum`, nullable, learner only), `income_bracket_code` (FK, nullable, parent only), `interest_codes` (`text[]`), `free_text` (text, nullable), `created_at`, `updated_at`.
Unique: (`session_id`, `role`).

**`consents`**
Columns: `id`, `session_id` (FK), `consent_version` (text), `granted_by_role` (`participant_role_enum`), `language` (`language_enum`), `granted_at`, `withdrawn_at` (nullable).
Rule: a session cannot hold messages unless a non-withdrawn consent exists.

**`messages`**
Columns: `id`, `session_id` (FK), `sender` (`message_sender_enum`), `input_mode` (`input_mode_enum`), `language` (`language_enum`), `content_text` (text), `stt_confidence` (`numeric(4,3)`, nullable), `created_at`.
Audio is **not** stored.

**`message_citations`**
Purpose: links an assistant message to the outcome records behind each figure (traceability for D-05).
Columns: `id`, `message_id` (FK), `outcome_record_id` (FK), `field_name` (text, for example `earnings_median_inr`), `created_at`.

**`concern_tags`**
Columns: `id`, `session_id` (FK), `message_id` (FK, nullable), `category_code` (FK), `status` (`concern_status_enum`), `confidence` (`numeric(4,3)`, nullable), `created_at`, `updated_at`.

**`sentiment_readings`**
Columns: `id`, `session_id` (FK), `message_id` (FK, nullable), `checkpoint` (`sentiment_checkpoint_enum`), `source` (`sentiment_source_enum`), `raw_value` (smallint, nullable, 1 to 5 for self-report), `score` (`numeric(3,2)`, -1.00 to 1.00), `created_at`.

### 4.4 Escalation

**`escalations`**
Columns: `id`, `session_id` (FK), `trigger` (`escalation_trigger_enum`), `status` (`escalation_status_enum`), `priority` (`priority_enum`), `summary_text` (text), `contact_phone_encrypted` (bytea, nullable after deletion), `preferred_window` (text, nullable), `assigned_to` (FK to `staff_users`, nullable), `claimed_at`, `resolved_at`, `resolution_note` (text, nullable), `created_at`, `updated_at`.
Rule: at most one non-closed escalation per session (partial unique index).

### 4.5 Staff and audit

**`staff_users`**
Columns: `id`, `email` (unique, case-insensitive), `name`, `role` (`staff_role_enum`), `password_hash`, `is_active`, `failed_login_count`, `locked_until` (nullable), `last_login_at`, `created_at`, `updated_at`.

**`staff_sessions`**
Columns: `id`, `staff_user_id` (FK), `session_token_hash`, `expires_at`, `created_at`, `revoked_at`.

**`audit_logs`**
Columns: `id`, `actor_type` (`staff` or `system` or `family_session`), `actor_id` (nullable), `action` (text), `entity_type`, `entity_id`, `metadata` (`jsonb`, never containing personal data), `created_at`.
Append-only.

### 4.6 Jobs

**`jobs`**
Columns: `id`, `type`, `payload` (`jsonb`), `status`, `attempts`, `run_after`, `last_error`, `created_at`, `updated_at`.

---

## 5. Relationships

- `locations` → `locations` (parent/child, state → district → block)
- `trades` → `outcome_records`: one-to-many
- `providers` → `outcome_records`: one-to-many (optional)
- `locations` → `outcome_records`: one-to-many
- `data_sources` → `outcome_records`: one-to-many
- `trades` → `pathways` → `pathway_steps`: one-to-many each
- `family_sessions` → `session_profiles`: one-to-many (max one per role)
- `family_sessions` → `consents`, `messages`, `concern_tags`, `sentiment_readings`: one-to-many
- `messages` → `message_citations` → `outcome_records`
- `family_sessions` → `escalations`: one-to-many (one active at a time)
- `staff_users` → `escalations` (assignment), `outcome_records` (verification), `staff_sessions`

---

## 6. Constraints

**Required:** `outcome_records.source_id`, `outcome_records.data_type`, `family_sessions.language`, `family_sessions.location_id`.

**Unique:** `family_sessions.token_hash`, `family_sessions.resume_code_hash`, `staff_users.email`, `trades.code`, (`session_profiles.session_id`, `role`), (`pathway_steps.pathway_id`, `step_order`).

**Foreign keys:** as listed in Section 5. Use `ON DELETE RESTRICT` for reference data and `ON DELETE CASCADE` for session-owned data only where deletion rules (Section 8) require it.

**Check constraints:** see `outcome_records` rules and sentiment `score` range.

---

## 7. Indexes

| Index | Reason |
|---|---|
| `outcome_records (trade_id, location_id, scope, cohort_year)` | Main lookup used by the grounding tool |
| `messages (session_id, created_at)` | Load conversation history |
| `concern_tags (category_code, created_at)` and `(session_id)` | Dashboard aggregation |
| `sentiment_readings (session_id, checkpoint)` | Before/after comparison |
| `escalations (status, priority, created_at)` | Counsellor queue |
| `family_sessions (location_id, created_at)` | District analytics |
| `audit_logs (entity_type, entity_id, created_at)` | Investigation |
| Partial unique index on `escalations (session_id)` where status in (`open`, `assigned`) | One active case per session |

---

## 8. Data Validation

- Percentages 0 to 100. Earnings non-negative integers. Years within a sensible range.
- Phone numbers normalized to a single format before encryption.
- Enum values validated at API and database level.
- `outcome_records` import rejects any row missing source or data type.
- Free text is length-limited.

## 9. Soft Delete

- **Reference data** (`trades`, `providers`): deactivated with `is_active`, not deleted.
- **Family sessions:** user deletion requests use a **purge** process (Section 10), not just a flag.
- **Staff:** deactivated with `is_active`, never deleted.
- `audit_logs` are never deleted by the application.

## 10. Deletion and Retention

On a family deletion request (UX-10):
1. Delete `messages`, `message_citations`, `session_profiles` (including `free_text`), and the `contact_phone_encrypted` value.
2. Cancel any open escalation and null out its phone and summary.
3. Set `family_sessions.status = 'deleted'` and `deleted_at`. Keep the consent withdrawal record.
4. Keep `concern_tags` and `sentiment_readings` only as anonymous aggregates (with `message_id` set to null), per assumption DB-A2.

Automatic retention periods (for example, purge after N days) are **not defined** (DB-Q1).

## 11. Auditing

Recorded: staff login, logout and lockout; claim/resolve of escalations; every view of a phone number; outcome data import and verification; session deletion; staff account changes.
Fields: who, what, which entity, when. No personal data in `metadata`.

## 12. Sensitive Data

| Field | Protection |
|---|---|
| `escalations.contact_phone_encrypted` | Application-level encryption, key from secrets store, decrypted only on counsellor claim, audit-logged |
| `session_profiles.free_text`, `messages.content_text` | May contain personal details. Never logged. Deleted on request |
| `income_bracket_code` | Optional, parent only. Aggregated only in analytics |
| `staff_users.password_hash` | Argon2 |
| `token_hash`, `resume_code_hash` | Stored only as hashes |

## 13. Migration Rules

Schema changes must:
1. Be documented here first.
2. Have a migration (Alembic).
3. Be tested on a copy with seed data.
4. Avoid breaking existing data (expand, then migrate, then contract).

## 14. Seed Data

- **Lookup tables:** loaded from `data/seed/`. Values for education levels, income brackets and interests are TBD.
- **`data_sources`:** entries for the public sources used (for example PLFS and NSDC publications). Final list is TBD (DB-Q2).
- **`outcome_records`:**
  - `public_benchmark` rows are derived from public publications, with the source and year recorded.
  - `pilot_demo` rows are created for the pilot trades/districts (W-05, Q-05). They are always labelled and **never** marked verified.
- **Demo staff accounts:** created by script in development only. Never seeded in production.

---

## 15. Assumptions

| ID | Assumption |
|---|---|
| DB-A1 | Earnings are stored as monthly rupee figures. |
| DB-A2 | Anonymous concern and sentiment records may be kept after a deletion request. |
| DB-A3 | Age bands follow PRD A-04 (15 to 25). |
| DB-A4 | `verified` data can only come from a future verification process. No such data exists in the MVP. |

## 16. Open Questions

| ID | Question |
|---|---|
| DB-Q1 | What are the data retention periods for sessions, messages, and escalations? |
| DB-Q2 | Which exact public sources and tables will provide the benchmarks, and how will derived figures be documented? |
| DB-Q3 | What are the education level, income bracket and interest lists? (UX-Q5) |
| DB-Q4 | Are blocks required, or is district level enough for the MVP? |
| DB-Q5 | Should aggregated analytics persist after deletion requests? (DB-A2) |
