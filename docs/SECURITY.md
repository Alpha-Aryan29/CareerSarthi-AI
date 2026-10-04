# Security Guidelines

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** Defines authentication, authorization, secrets, API protection, data protection, AI-specific safeguards and privacy rules. Security is a requirement from the start, not a final polish step. The product handles data about families and possibly minors, so these rules are stricter than a typical demo app.
> **Depends on:** PRD.md (F9, W-01, W-03, W-06), ARCHITECTURE.md, DATABASE.md, API.md.
> **Legal note:** This is a technical security document, **not legal advice**. India's Digital Personal Data Protection Act, 2023 (DPDP Act) and its rules are expected to apply to personal data, especially children's data. A qualified person must review the consent, retention and children's-data requirements before any real deployment (SEC-Q1).

---

## 1. Authentication

### Family sessions (W-03)
- No accounts. Creating a session returns an **opaque session token** (cryptographically random, at least 128 bits) and a **resume code**.
- Only a **hash** of the token and of the resume code is stored (DATABASE `family_sessions`).
- The token is sent in the `X-Session-Token` header. A token grants access to **only its own session**.
- Resume code: format is defined at implementation. It must be easy to read aloud and type but have enough entropy to resist guessing under rate limits. Wrong attempts are limited per IP and per code, with temporary lockout (`RESUME_LOCKED`).
- Sessions expire after inactivity. The period is configuration, and the value is not defined here (SEC-Q3).

### Staff (counsellor, administrator, data steward)
- Method: email and password.
- Password hashing: **Argon2**.
- Server-side sessions stored in `staff_sessions`, referenced by a secure, HTTP-only, `SameSite` cookie.
- Failed-login counter and temporary lockout. Generic error message (`INVALID_CREDENTIALS`).
- Staff accounts are created by an administrator script, not by self-registration.
- Multi-factor authentication for staff is **recommended** but not decided (SEC-Q2).

---

## 2. Authorization

Authorization is enforced **server-side** on every endpoint. The frontend hiding a button is never a control.

**Roles:**

| Role | Permissions |
|---|---|
| `family` (session token) | Read/write **own** session only. Create escalation for own session. Read public reference data. |
| `counsellor` | View escalation queue and cases. Claim a case. View the phone number **only after claiming** (audit-logged). Resolve cases. No access to other dashboards or outcome data editing. |
| `administrator` | View aggregated dashboards. Manage staff accounts (via script/admin function). Read-only view of escalation statistics. **No** access to individual conversations or phone numbers. |
| `data_steward` | Manage `data_sources` and `outcome_records`. Verify records (never `pilot_demo`, PRD A-08). No access to sessions or cases. |

Principle of least privilege: a role gets only what its flows in UX_FLOWS.md need.

Rules:
- Check resource ownership, not just role (for example a counsellor can only fetch the contact of a case assigned to them).
- Deny by default.

---

## 3. Secrets

Rules:
- Never hard-code credentials.
- Never commit production secrets. `.env` is git-ignored. Only `.env.example` (with empty values) is committed.
- Never expose private secrets to the client. AI provider keys live **only** on the backend.
- Use environment variables, loaded through the single config module (ARCHITECTURE Section 8).
- Rotate any compromised credential immediately.
- Use the hosting platform's secret storage in staging and production.
- Use a pre-commit secret scanner (CODE_STYLE).

---

## 4. Environment Variables

Names are proposed. Final list is documented when the project is scaffolded.

**Public (safe for the browser):**
`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_DEFAULT_LANGUAGE`

**Private (server only):**
`DATABASE_URL`, `SESSION_SECRET`, `PHONE_ENCRYPTION_KEY`, `LLM_API_KEY`, `STT_API_KEY`, `TTS_API_KEY`, `TRANSLATION_API_KEY`, `ANALYTICS_MIN_GROUP_SIZE`, `SESSION_IDLE_TIMEOUT_MINUTES`

---

## 5. API Security

- **Input validation:** every input validated against schemas (types, lengths, enums). Reject unknown fields where practical.
- **Rate limiting:** applied by IP and by session on session creation, resume, messages, voice endpoints, escalation creation, and staff login. Limits are configuration and are not defined here (SEC-Q4). The AI endpoints need limits mainly to control abuse and cost.
- **CORS:** allow only the known frontend origin(s). No wildcard with credentials.
- **Transport:** HTTPS only. HSTS enabled in production.
- **Cookies:** `Secure`, `HttpOnly`, `SameSite=Lax` or stricter for staff sessions. CSRF protection on staff endpoints that change state.
- **Authentication:** per API.md. Protected endpoints reject missing or invalid credentials with the standard error format.
- **Authorization:** per Section 2.
- **Errors:** never return stack traces, SQL errors or internal identifiers beyond `request_id`.
- **Headers:** security headers (Content-Security-Policy, X-Content-Type-Options, frame protections).

---

## 6. Data Protection

### Data classification

| Class | Examples | Handling |
|---|---|---|
| **Restricted** | Phone numbers, staff password hashes, session tokens | Encrypted or hashed, minimum access, audit-logged |
| **Sensitive** | Conversation text, profile free text, income bracket, learner age band, location (district) | Not logged, not shared with third parties beyond what AI processing requires, deletable |
| **Aggregated / anonymous** | Dashboard counts | Shown only above minimum group size |
| **Public** | Reference data, outcome data with labels | No restriction |

### Collection minimisation
- **No names, no email, no Aadhaar or other government IDs, no exact address, no school name** are collected from families. The only direct identifier is the phone number given for a callback (UX-07).
- Location is district-level (or state-level).
- Income bracket and profile fields are optional.
- Audio is never stored (ARCHITECTURE AR-D8).

### Encryption
- In transit: TLS.
- At rest: database encryption provided by the host.
- Phone numbers: **additionally** encrypted at the application level with a key kept outside the database.

### Minimum group size (small-group suppression)
- The analytics layer hides any aggregate whose group is below a configured minimum (`ANALYTICS_MIN_GROUP_SIZE`). The value is **not decided** (SEC-Q5). It is configuration, and the default must err on the side of hiding.

### Retention and deletion
- Families can delete their data at any time (UX-10, DATABASE Section 10).
- Automatic retention periods are **not defined** (SEC-Q6). Until they are, the system must not claim a specific retention period to users.
- Escalation phone numbers should be deleted once the case is resolved or after a defined period (SEC-Q6).

### Children and consent (W-01)
- If the learner is under 18 or age is unknown, the session is treated as involving a minor. **Consent must be given by a parent/guardian** (API enforces `granted_by_role = parent`).
- The consent text must be in the user's language, plain, and say what is collected, why, who sees it, and how to delete.
- No profiling for advertising and no sharing of family data with third parties for any purpose other than operating the service.
- Whether further parental-consent verification is legally required is an open question (SEC-Q1).

---

## 7. AI-Specific Security and Safety

| Risk | Control |
|---|---|
| **Hallucinated numbers** | Numeric slot filling plus numeric guard (ARCHITECTURE AR-D2). The LLM cannot output outcome figures directly. |
| **Prompt injection** (user text trying to change rules) | The system prompt and tool definitions are server-side. User text is treated as data. Tool outputs are validated. The LLM has no tools that write data or reveal other sessions. |
| **Data leakage to AI providers** | Send only what is needed for the turn. **Never send phone numbers, token values or staff data to any AI provider.** Prefer providers with contractual no-training-on-data terms. Data residency is an open question (SEC-Q7). |
| **Unsafe or harmful content** | Content safety handling and calm redirection. Offer human help (UX-05). Crisis handling content is open (UX-Q2). |
| **Overreliance** | The assistant states the data type label and sample size, shows when data is a fallback, and never promises outcomes. |
| **Bias** | Evaluate responses across genders, regions and income brackets in the evaluation suite (TESTING.md). Do not discourage a learner from a pathway because of gender or income. |
| **Cost abuse** | Rate limits and per-session turn limits (limits are configuration). |

The assistant must **never** present `pilot_demo` data as real or verified. The label must always accompany any such figure.

---

## 8. File and Audio Uploads

- **Allowed:** audio for transcription only. Formats are defined at implementation (typical browser recording formats).
- **Maximum size and duration:** configuration. A short limit per utterance is recommended (value not defined here, SEC-Q4).
- **Validation:** check content type and actual file signature, enforce size limits, and reject everything else.
- **Storage:** audio is processed in memory or a temporary location and **deleted immediately** after transcription. No long-term audio storage.
- **CSV import (data steward):** validate encoding, columns and values, process atomically, and limit size. Do not execute or interpret any cell content (guard against formula injection if files are re-exported).

---

## 9. Logging and Auditing

**Never log:**
- Passwords, tokens, API keys, resume codes
- Phone numbers
- Conversation text, free text, or anything a family typed or said
- Raw audio

**Log:**
- Staff authentication events (success, failure, lockout)
- Claim, view-contact and resolve actions on escalations (audit log)
- Outcome data imports and verification actions
- Session creation/deletion events (IDs only)
- Errors with `request_id`
- Security events (rate-limit hits, repeated failed resume attempts)

Audit logs are append-only. Logs carry no personal data.

---

## 10. Dependency and Supply Chain

- Pin dependency versions with lockfiles.
- Run automated dependency vulnerability scanning in CI.
- Review any new dependency before adding it (AGENTS.md).
- Remove unused dependencies.

---

## 11. Security Checklist

- [ ] Staff authentication implemented (Argon2, lockout)
- [ ] Family session tokens hashed and scoped to own session
- [ ] Authorization enforced server-side for every endpoint and role
- [ ] Server-side validation on all inputs
- [ ] Secrets stored outside the repository and never exposed to the client
- [ ] Phone numbers encrypted and access audit-logged
- [ ] Consent captured before data collection; guardian consent for minors/unknown age
- [ ] Deletion flow works end to end
- [ ] Analytics suppress small groups
- [ ] Rate limiting configured
- [ ] CORS, cookie, and security headers configured
- [ ] Audio not stored; uploads validated
- [ ] Logs contain no personal data
- [ ] Numeric guard and prompt-injection tests pass
- [ ] No pilot data labelled as verified
- [ ] Dependencies reviewed and scanned
- [ ] Errors do not expose internal details

---

## 12. Assumptions

| ID | Assumption |
|---|---|
| SEC-A1 | Phone number is the only direct identifier collected from families. |
| SEC-A2 | Anonymous sessions (no family login) are acceptable to the scheme and legally sufficient with guardian consent. This needs legal review. |
| SEC-A3 | AI providers can be configured not to train on submitted data. |
| SEC-A4 | The hosting platform provides encryption at rest and secret storage. |

## 13. Open Questions

| ID | Question |
|---|---|
| SEC-Q1 | What do the DPDP Act and rules require for consent, children's data, notice, and verification of a guardian? Who will review? |
| SEC-Q2 | Is MFA required for staff? |
| SEC-Q3 | What is the session inactivity timeout? |
| SEC-Q4 | What rate limits, upload size/duration limits and per-session turn limits apply? |
| SEC-Q5 | What is the minimum group size for analytics? |
| SEC-Q6 | What are the retention periods for sessions, messages and escalation phone numbers? (DB-Q1) |
| SEC-Q7 | Is data residency in India required for the AI providers and hosting? |
