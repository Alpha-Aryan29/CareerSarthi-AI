# API Documentation

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** The source of truth for API contracts between the frontend and backend. No endpoint, field or error code should be implemented unless it is listed here. Update this document first when a contract changes.
> **Depends on:** PRD.md, UX_FLOWS.md, ARCHITECTURE.md, DATABASE.md, SECURITY.md.

---

## 1. General Conventions

- **Base path:** `/api/v1`
- **Format:** JSON (`application/json`), except audio endpoints.
- **Field naming:** `snake_case`.
- **IDs:** UUID strings.
- **Timestamps:** ISO 8601 in UTC.
- **Language:** the `language` field uses `hi` or `en`.
- **Money:** integer rupees per month (`_inr` suffix). **Percent:** number 0 to 100 (`_pct` suffix).

### Authentication types

| Type | Used by | How |
|---|---|---|
| **Session token** | Family app | Header `X-Session-Token: <opaque token>` returned when a session is created (W-03) |
| **Staff session** | Counsellor, administrator, data steward | Secure HTTP-only cookie created by `/auth/login` |
| **None** | Public reference data | No authentication, but rate-limited |

Authorization is enforced **server-side** on every endpoint (SECURITY.md).

### Error Format

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found",
    "request_id": "b7c1...",
    "details": []
  }
}
```

`message` is safe to show in logs. User-facing text is produced by the frontend from `code`, in the user's language.

### Error Codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid input. `details` lists fields |
| 401 | `AUTH_REQUIRED` | Missing or invalid credentials |
| 401 | `INVALID_CREDENTIALS` | Staff login failed (generic) |
| 403 | `FORBIDDEN` | Role lacks permission |
| 403 | `CONSENT_REQUIRED` | Action needs consent first |
| 404 | `NOT_FOUND` | Generic not found |
| 404 | `SESSION_NOT_FOUND` | Session missing, expired or deleted |
| 409 | `CONFLICT` | State conflict (for example case already claimed) |
| 409 | `ESCALATION_ALREADY_OPEN` | A case is already open for the session |
| 422 | `SPEECH_UNRECOGNIZED` | Audio could not be transcribed with enough confidence |
| 429 | `RATE_LIMITED` | Too many requests |
| 429 | `RESUME_LOCKED` | Too many wrong resume codes |
| 502 | `AI_PROVIDER_ERROR` | An external AI provider failed |
| 503 | `SERVICE_UNAVAILABLE` | Database or dependency unavailable |
| 504 | `AI_PROVIDER_TIMEOUT` | An AI provider timed out |
| 500 | `INTERNAL_ERROR` | Unexpected error (details never exposed) |

Note: when an AI failure occurs inside a conversation turn, the backend returns a **successful** response with a safe fallback assistant message (ARCHITECTURE Section 12). The `AI_*` errors apply to endpoints that cannot fall back (for example speech).

---

## 2. Family Endpoints (session token)

### POST /sessions
Create a session. **Authentication:** none (rate-limited).

Request:
```json
{
  "language": "hi",
  "mode": "both",
  "location_id": "uuid",
  "learner_age_band": "15_17"
}
```
Response `201`:
```json
{
  "session_id": "uuid",
  "session_token": "opaque-string",
  "resume_code": "ABC-123",
  "status": "active",
  "is_minor_or_unknown": true
}
```
Validation: `language`, `mode`, `location_id` required. `session_token` and `resume_code` are returned **only once**. Consent must be recorded (below) before any other data endpoint will work.

### POST /sessions/resume
Request: `{ "resume_code": "ABC-123" }`. **Authentication:** none (strictly rate-limited).
Response `200`: same shape as create, with a new `session_token`. Errors: `SESSION_NOT_FOUND`, `RESUME_LOCKED`.

### GET /sessions/{session_id}
Returns session state, profiles, and consent status. **Auth:** session token.

### POST /sessions/{session_id}/consent
Request:
```json
{ "consent_version": "v1", "granted_by_role": "parent", "language": "hi" }
```
Response `201`: `{ "consent_id": "uuid", "granted_at": "..." }`.
Rule: if `is_minor_or_unknown` is true, `granted_by_role` must be `parent` (W-01).

### DELETE /sessions/{session_id}/consent
Withdraws consent and triggers the deletion process (DATABASE Section 10). Response `204`.

### PUT /sessions/{session_id}/profiles/{role}
`role` is `learner` or `parent`.
Request (all fields optional except where noted):
```json
{
  "education_level_code": "string",
  "age_band": "15_17",
  "income_bracket_code": "string",
  "interest_codes": ["string"],
  "free_text": "string",
  "concern_codes": ["earning_potential", "safety"]
}
```
Rules: `age_band` only for `learner`. `income_bracket_code` only for `parent`. Codes must exist in lookup tables. Response `200` returns the stored profile.

### GET /sessions/{session_id}/agreement-summary
Returns shared priorities and differences, or `204` if not computable (UX-04).
```json
{
  "shared": ["string"],
  "learner_focus": ["string"],
  "parent_focus": ["string"]
}
```
Text is in the session language.

### POST /sessions/{session_id}/messages
Send a user message and get the assistant reply. **Auth:** session token. Requires consent.

Request:
```json
{
  "sender": "parent",
  "input_mode": "text",
  "language": "hi",
  "content_text": "string",
  "choice_code": null
}
```
Validation: `sender` is `learner` or `parent`. Either `content_text` or `choice_code` is required. `content_text` is length-limited.

Response `201`:
```json
{
  "user_message_id": "uuid",
  "assistant_message": {
    "id": "uuid",
    "language": "hi",
    "content_text": "string",
    "citations": [
      {
        "outcome_record_id": "uuid",
        "field_name": "earnings_median_inr",
        "data_type": "pilot_demo",
        "source_name": "string",
        "reference_year": 2024,
        "sample_size": 120,
        "scope": "district"
      }
    ],
    "data_cards": [ { "outcome_record_id": "uuid" } ],
    "suggested_actions": ["offer_escalation", "show_pathway"],
    "is_fallback": false
  },
  "escalation_suggested": false
}
```
Behavior: figures in `content_text` are server-filled from `outcome_records` (ARCHITECTURE AR-D2). If the numeric guard fails twice, `is_fallback` is true and the text is the safe fallback. The numbers inside the example above are illustrative only.

### GET /sessions/{session_id}/messages
Query: `limit`, `before` (cursor). Returns messages in order, with citations.

### POST /sessions/{session_id}/voice/transcribe
Upload audio for transcription. **Content-Type:** `multipart/form-data` with `audio` and `language`.
Response `200`: `{ "transcript": "string", "confidence": 0.91, "language": "hi" }`.
Errors: `SPEECH_UNRECOGNIZED`, `AI_PROVIDER_ERROR`, `AI_PROVIDER_TIMEOUT`.
Rules: allowed audio types and size limit in SECURITY Section 8. Audio is not stored.
Note: the frontend then submits the confirmed transcript via `/messages` with `input_mode: "voice"`.

### POST /sessions/{session_id}/messages/{message_id}/speech
Generates audio for the "Listen" button. Response: audio bytes (content type depends on the provider, to be fixed at implementation). Errors: `AI_PROVIDER_ERROR`. Only assistant messages and cards of this session can be voiced.

### GET /sessions/{session_id}/outcomes
Query: `trade_id` (required). Returns the best available outcome record for the session's location, with fallback.
```json
{
  "trade_id": "uuid",
  "record": {
    "id": "uuid",
    "scope": "district",
    "is_fallback": false,
    "location_name": "string",
    "cohort_year": 2024,
    "placement_rate_pct": 0,
    "earnings_p25_inr": 0,
    "earnings_median_inr": 0,
    "earnings_p75_inr": 0,
    "sample_size": 0,
    "data_type": "pilot_demo",
    "source": { "name": "string", "publisher": "string", "reference_year": 2024, "url": "string" },
    "label_text": "string"
  }
}
```
`record` is `null` when no data exists at any level. Zeros above are placeholders for the shape, not real data. `label_text` is returned in the session language and includes "Demonstration data" wording for `pilot_demo`.

### GET /sessions/{session_id}/pathway
Query: `trade_id`. Returns pathway steps in order (title, description, `nsqf_level`, `step_type`, `typical_duration_months`) in the session language.

### POST /sessions/{session_id}/sentiment
Records a self-reported sentiment.
```json
{ "checkpoint": "start", "raw_value": 3 }
```
`checkpoint` is `start`, `mid` or `end`. `raw_value` is 1 to 5. Response `201`.

### POST /sessions/{session_id}/escalations
Request:
```json
{
  "phone": "string",
  "preferred_window": "morning",
  "trigger": "user_request",
  "share_summary_consent": true
}
```
Response `201`: `{ "escalation_id": "uuid", "reference": "string", "status": "open" }`.
Errors: `ESCALATION_ALREADY_OPEN` (with existing case status), `VALIDATION_ERROR`, `CONSENT_REQUIRED`.
Rule: `share_summary_consent` must be true.

### GET /sessions/{session_id}/escalations/current
Returns the status of the session's active case (no counsellor identity beyond a generic status).

### DELETE /sessions/{session_id}
Deletes the session's data (UX-10, DATABASE Section 10). Response `204`.

---

## 3. Public Reference Endpoints

**Authentication:** none. Rate-limited. Cacheable.

| Method and path | Returns |
|---|---|
| `GET /reference/locations?level=&parent_id=` | States, districts, blocks |
| `GET /reference/trades` | Active trades with Hindi and English names |
| `GET /reference/education-levels` | Lookup list |
| `GET /reference/income-brackets` | Lookup list |
| `GET /reference/interest-options` | Lookup list |
| `GET /reference/concern-categories` | Lookup list |

All responses return both `_en` and `_hi` labels.

---

## 4. Staff Authentication

| Method and path | Purpose |
|---|---|
| `POST /auth/login` | Body `{ "email", "password" }`. Sets session cookie. Response `{ "user": { "id", "name", "role" } }`. Failure: `INVALID_CREDENTIALS` |
| `POST /auth/logout` | Revokes the session. `204` |
| `GET /auth/me` | Current staff user and role |

Rate-limited with lockout (SECURITY Section 1).

---

## 5. Counsellor Endpoints (role: `counsellor`; `administrator` read-only where noted)

| Method and path | Purpose |
|---|---|
| `GET /counsellor/escalations?status=&priority=&district_id=` | Queue. Returns **no phone numbers** |
| `GET /counsellor/escalations/{id}` | Case detail: summary, concerns (with status), data cards shown, sentiment trend, preferred window. **Phone not included** unless the case is claimed by the caller |
| `POST /counsellor/escalations/{id}/claim` | Assigns to the caller. `409 CONFLICT` if already claimed |
| `GET /counsellor/escalations/{id}/contact` | Returns the decrypted phone. Only for the assigned counsellor. **Audit-logged** |
| `POST /counsellor/escalations/{id}/resolve` | Body `{ "status": "resolved" or "unreachable", "resolution_note": "string" }` |

---

## 6. Administrator Dashboard Endpoints (role: `administrator`)

All return **aggregates only**. Groups below the minimum group size are returned as `suppressed: true` without counts (SECURITY Section 6).

Common query parameters: `from`, `to`, `state_id`, `district_id`, `trade_id`, `language`.

| Method and path | Returns |
|---|---|
| `GET /admin/dashboard/summary` | Session count, completed sessions, escalation count, average sentiment change |
| `GET /admin/dashboard/resistance-by-location` | Per-location concern intensity and sample size |
| `GET /admin/dashboard/concerns` | Counts by concern category, optionally by trade and location |
| `GET /admin/dashboard/sentiment-shift` | Before/after sentiment (only sessions having both readings) |
| `GET /admin/dashboard/escalations` | Counts by trigger, status, time to resolution |

Example (`/admin/dashboard/concerns`):
```json
{
  "items": [
    { "category_code": "earning_potential", "location_id": "uuid", "count": 0, "suppressed": false }
  ],
  "min_group_size": 0
}
```
Values are illustrative placeholders. The minimum group size comes from configuration.

The "resistance index" is a Nice to Have and has **no endpoint** until its definition is approved (API-Q2).

---

## 7. Data Steward Endpoints (role: `data_steward`)

Per W-04, the MVP offers an API and script. No UI is committed.

| Method and path | Purpose |
|---|---|
| `GET/POST /data/sources` | List or create `data_sources` |
| `GET /data/outcome-records` | Search and list |
| `POST /data/outcome-records` | Create one record. `source_id` and `data_type` required |
| `POST /data/outcome-records/import` | CSV import. Returns accepted/rejected rows with reasons. Atomic per file |
| `PATCH /data/outcome-records/{id}` | Edit (audit-logged) |
| `POST /data/outcome-records/{id}/verify` | Marks `data_type = verified`. **Rejected** for `pilot_demo` records (A-08) |

---

## 8. Health

`GET /health`: returns `{ "status": "ok" }`. No sensitive information. Used by deployment checks.

---

## 9. API Rules

- Validate **all** inputs server-side.
- Authenticate protected endpoints and authorize resource access (a session token only accesses its own session).
- Return the consistent error format. Never expose stack traces or internal details.
- Never return phone numbers, token hashes or other staff users' data outside the endpoints that explicitly allow it.
- Rate limit by IP and by session (values in SECURITY.md).
- Version breaking changes with `/api/v2`.
- Endpoints that call AI providers have timeouts and must not hang indefinitely.

---

## 10. Assumptions

| ID | Assumption |
|---|---|
| API-A1 | REST with JSON is acceptable. Streaming of AI replies is not required in the MVP. |
| API-A2 | The resume code format (`ABC-123` above) is only an example and is defined at implementation (see SECURITY). |
| API-A3 | Audio formats and sizes are fixed at implementation, within the SECURITY limits. |

## 11. Open Questions

| ID | Question |
|---|---|
| API-Q1 | Is streaming of replies needed for perceived speed on slow networks? |
| API-Q2 | How will the "resistance index" be defined, if included? |
| API-Q3 | Should counsellors be able to export case lists? (Currently no.) |
