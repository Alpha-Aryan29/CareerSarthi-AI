# Architecture

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** Defines how the system is structured, how components communicate, and why. It answers: where does everything go, and what rules keep it that way.
> **Depends on:** PRD.md (D-01 to D-05, W-02 to W-07), DESIGN_SYSTEM.md, UX_FLOWS.md.
> **Important:** The technology stack below is **PROPOSED (W-07)**. It was chosen for a small team and a fast build, but it depends on your team's skills (Q-02). Tell me your team's strengths and I will adjust it.

---

## 1. System Overview

The system has three user-facing surfaces served by one backend:

1. **Family app:** mobile-first PWA for learners and parents (Hindi + English, text + voice).
2. **Counsellor console:** web screens for handling callback cases.
3. **Admin dashboard:** web screens for aggregated resistance and sentiment analytics.

The backend runs the conversation, fetches **outcome data from the database**, calls AI providers (LLM, speech-to-text, text-to-speech, translation) through adapters, records concerns and sentiment, creates escalation cases, and serves the dashboards.

**The central design rule:** the AI never produces outcome numbers itself (D-05). Numbers come from the database and are inserted by the server (see Decision AR-D2).

---

## 2. Architecture Pattern

**Pattern:** Modular monolith (one backend deployable, one frontend deployable, one database).

**Reason:**
- Small team and a time-boxed MVP.
- Clear module boundaries still allow later extraction (for example the conversation engine).
- Lower operational complexity than microservices.

---

## 3. Technology Stack (PROPOSED)

| Layer | Technology | Note |
|---|---|---|
| Frontend | Next.js (React) with TypeScript, Tailwind CSS | PWA via service worker; i18n with locale files for `hi` and `en` |
| Frontend charts/maps | Recharts; Leaflet for the district map | District boundary data source is open (AR-Q4) |
| Backend | Python 3.12 with FastAPI, Pydantic | Async API |
| ORM and migrations | SQLAlchemy 2 and Alembic | |
| Database | PostgreSQL 16 | Single database for all data, including job queue |
| Authentication | Staff: email/password with server-side sessions in secure cookies. Families: opaque session token (W-03) | See SECURITY.md |
| Password hashing | Argon2 | |
| Storage | No file storage in MVP. Audio is **not** persisted (AR-D8) | |
| Hosting | **Not decided** (AR-Q1) | Must support HTTPS and a managed PostgreSQL |
| Payments | None | Out of scope |
| Email | None in MVP | Staff accounts created by admin script or seed |
| Analytics | First-party only (own database). No third-party trackers | |
| AI providers | LLM, STT, TTS, translation through adapters (W-06) | Provider not chosen (Q-14) |
| Testing | pytest, Vitest, Playwright | See TESTING.md |

---

## 4. System Components

### Frontend

Responsibilities:
- Render family, counsellor and admin screens per DESIGN_SYSTEM.md and UX_FLOWS.md.
- Capture microphone audio and send it to the backend, and play audio returned by the backend.
- Manage local state of an in-progress session and cache static assets and reference data for the PWA.
- Show offline and error states.
- **Never** call AI providers directly and never hold provider keys.

### Backend (modules)

| Module | Responsibility |
|---|---|
| `sessions` | Create/resume/delete family sessions, profiles, resume codes |
| `consent` | Record and withdraw consent |
| `conversation` | Orchestrates one turn (see Section 6) |
| `grounding` | Outcome-data lookup tools, numeric slot filling, numeric guard |
| `pathways` | Career-ladder content per trade |
| `concerns` | Concern classification and status tracking |
| `sentiment` | Self-reported and model-estimated sentiment readings |
| `escalation` | Trigger rules, case creation, queue, summaries |
| `analytics` | Aggregated queries with small-group suppression |
| `auth` | Staff login, roles, session handling |
| `data_admin` | Outcome data import and labelling |
| `speech` | Speech-to-text and text-to-speech via adapters |
| `ai_providers` | Adapter interfaces and implementations for LLM/STT/TTS/translation |
| `audit` | Audit log writing |

### Database

Responsibilities:
- System of record for outcome data, sessions, messages, concerns, sentiment, escalations, staff, and audit logs (see DATABASE.md).
- Also acts as the simple job queue for background tasks (AR-D4).

---

## 5. Architecture Diagram

```
 Learner / Parent (phone, PWA)          Counsellor / Admin / Data steward (browser)
              │                                        │
              └─────────────── HTTPS ──────────────────┘
                                 │
                       ┌─────────▼─────────┐
                       │   Next.js web app  │
                       └─────────┬─────────┘
                                 │ REST (JSON)
                       ┌─────────▼──────────────────────────────┐
                       │          FastAPI backend                 │
                       │  routers → services → repositories       │
                       │                                          │
                       │  sessions  conversation  escalation      │
                       │  grounding concerns      analytics       │
                       │  auth      data_admin    audit           │
                       │            │                             │
                       │      ai_providers (adapters)             │
                       └───────┬───────────────┬──────────────────┘
                               │               │
                     ┌─────────▼───┐     ┌─────▼──────────────────┐
                     │ PostgreSQL  │     │ External AI providers   │
                     │ (all data)  │     │ LLM · STT · TTS · Transl│
                     └─────────────┘     └─────────────────────────┘
```

---

## 6. Data Flow

### 6.1 One conversation turn (text)

1. Frontend sends the user's message with the session token.
2. API authenticates the session token and checks consent exists.
3. `conversation` loads the session context (profiles, location, language, recent messages).
4. `concerns` classifies concerns in the message.
5. The LLM is called with a system prompt, the context, and **tools** defined by `grounding` (for example `get_outcome_data(trade, location)` and `get_pathway(trade)`).
6. The LLM returns a reply containing **placeholders** such as `{{outcome:<record_id>.earnings_median}}`, not raw digits for outcome figures (AR-D2).
7. `grounding` **fills the placeholders** from the database and attaches structured citations (record id, data type label, source, year, sample size).
8. **Numeric guard:** the final text is scanned. Any figure that is not from a filled placeholder or an explicitly allowed non-outcome number fails the check. On failure, regenerate once, otherwise use the safe fallback reply (Section 12).
9. `sentiment` and `concerns` update records. `escalation` evaluates trigger rules.
10. The assistant message, citations, concern tags and sentiment are stored.
11. The response is returned. Audio for "Listen" is generated **on demand** (Section 6.2).

### 6.2 Voice

- **Input:** Frontend records audio and uploads it. `speech` sends it to the STT adapter and returns the transcript with a confidence value. Audio is discarded after transcription (AR-D8). The transcript then enters the normal turn flow (6.1).
- **Output:** When the user taps "Listen", the frontend asks for audio of a given message. `speech` calls the TTS adapter and returns audio. Audio can be cached on the client only.

### 6.3 Escalation

1. A trigger fires (user request, repeated unresolved concern, low confidence/no data, negative sentiment, sensitive topic).
2. The family confirms phone number and preferred time (UX-07).
3. `escalation` generates a summary (concerns, data shown, sentiment trend, what was tried) and creates a case with a priority.
4. Counsellors see it in the queue, claim it, and resolve it (UX-12).
5. Audit log entries are written for claim, view of phone number, and resolve.

### 6.4 Analytics

1. Concern tags and sentiment readings are stored per session during turns.
2. `analytics` queries aggregate by location, trade, category and time.
3. Groups under the minimum size are suppressed (AR-D7). The dashboard receives only aggregates.

---

## 7. Project Structure (PROPOSED)

```text
/
├── apps/
│   ├── web/                      # Next.js PWA + staff screens
│   │   └── src/
│   │       ├── app/              # routes: (family), (counsellor), (admin)
│   │       ├── components/       # design-system components
│   │       ├── features/         # session, chat, data-cards, ladder, dashboard
│   │       ├── hooks/
│   │       ├── lib/              # api client, audio, i18n helpers
│   │       ├── locales/          # hi/, en/
│   │       └── types/
│   └── api/                      # FastAPI backend
│       └── src/
│           ├── api/              # routers (HTTP only)
│           ├── services/         # business logic per module
│           ├── repositories/     # database access
│           ├── models/           # SQLAlchemy models
│           ├── schemas/          # Pydantic request/response
│           ├── ai_providers/     # adapter interfaces + implementations
│           ├── grounding/        # tools, slot filling, numeric guard
│           ├── core/             # config, logging, errors, security
│           └── jobs/
├── data/
│   ├── seed/                     # labelled pilot data, lookup values
│   └── benchmarks/               # derived public-benchmark files + source notes
├── docs/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── evals/                    # grounding and language evaluations
├── scripts/
├── .env.example
└── README.md
```

---

## 8. Dependency Rules

1. Routers call services only. Services call repositories and other services' public interfaces. Repositories are the only code that touches the database.
2. A module must not import another module's repository or models directly. Use the other module's service interface.
3. UI components never access the database or AI providers. They use the API client in `lib/`.
4. **All AI calls go through `ai_providers` adapters.** No SDK from a provider is imported outside that module.
5. `conversation` may call `grounding` but `grounding` must not depend on `conversation`.
6. Secrets are read only through `core/config`. Nothing else reads environment variables.
7. Any text sent to a user in a given language comes from locale files or the LLM reply, never from hard-coded strings.
8. Numbers describing outcomes may only reach the user through the `grounding` pipeline.

---

## 9. Key Technical Decisions

### AR-D1: Modular monolith
**Context:** small team, short timeline. **Alternatives:** microservices, serverless functions. **Reason:** simplest to build and debug while keeping module boundaries. **Tradeoff:** scaling is vertical at first.

### AR-D2: Numeric slot filling plus numeric guard (grounded generation)
**Context:** PRD D-05, a wrong salary figure could change a family's decision. **Alternatives:** (a) trust the LLM to quote tool results, (b) post-hoc fact-checking only. **Decision:** the LLM writes placeholders. The server substitutes values from the database and runs a guard that rejects stray figures. **Reason:** removes the main path for hallucinated numbers. **Tradeoff:** more engineering, and some replies need regeneration.

### AR-D3: Provider adapters for all AI services
**Context:** provider not chosen (W-06, Q-14), and Hindi quality varies by provider. **Decision:** define adapter interfaces for LLM, STT, TTS, translation. **Reason:** swap without changing business logic and evaluate options. **Tradeoff:** extra abstraction.

### AR-D4: PostgreSQL only
**Context:** avoid extra infrastructure. **Decision:** one PostgreSQL database holds data, including a simple jobs table for background work. No Redis and no separate vector database in the MVP. **Alternatives:** Redis queue, vector DB. **Tradeoff:** limited throughput. Revisit if scale demands.

### AR-D5: Anonymous family sessions
**Context:** low digital familiarity and registration friction (W-03). **Decision:** opaque tokens and resume codes, no family accounts. **Tradeoff:** a lost token and code means a lost session. This is acceptable in the MVP.

### AR-D6: PWA with limited offline support
**Decision:** cache the app shell, static content and reference lists, but chat needs a connection. The app saves in-progress answers locally. **Reason:** intermittent connectivity. **Tradeoff:** no full offline counselling.

### AR-D7: Small-group suppression in analytics
**Decision:** the analytics layer, not the UI, hides aggregates below a configured minimum group size. **Reason:** protects families' privacy.

### AR-D8: No audio persistence
**Decision:** voice recordings are processed and discarded. Only transcripts are kept. **Reason:** data minimisation. **Tradeoff:** cannot re-audit speech recognition errors from recordings.

### AR-D9: Curated pathway content in the database (no RAG in MVP)
**Context:** pathway explanations must be accurate and consistent. **Decision:** curated structured content per trade. Retrieval over documents (RAG) is deferred. **Tradeoff:** less coverage, more control.

---

## 10. Performance Considerations

- Target mobile networks of variable quality. Keep the family app's initial bundle small (budget TBD, see AR-Q3).
- Stream or show progress for slow AI replies. Show a "still working" message if a reply is slow.
- Generate audio on demand, not for every message.
- Index frequently filtered columns (see DATABASE.md).
- Numeric latency targets (for example p95 response time) are **not defined yet** (AR-Q3). They need a measured baseline with the chosen providers.

## 11. Scalability Considerations

- The backend is stateless (state in PostgreSQL), so it can run as multiple instances behind a load balancer.
- Language scaling: locale files and an adapter-based speech/translation layer allow adding languages (out of scope now).
- Dashboard queries use indexed aggregates or materialized views if volume grows.
- Rate limiting protects AI cost (SECURITY.md).

## 12. Failure Scenarios

| What happens if... | Expected behavior |
|---|---|
| Database is unavailable | API returns 503. Family app shows a friendly message and keeps local answers. No fake data is shown. |
| LLM times out or errors | Retry once. Then a safe fallback message: the app explains it cannot answer now, shows any matching Outcome Data Card directly from the database if one applies, and offers escalation. |
| Numeric guard fails twice | Use the safe fallback: show the deterministic Outcome Data Card without AI-written commentary. |
| STT fails or low confidence | Ask to repeat or type. Never act on a low-confidence transcript without confirming. |
| TTS fails | Text remains visible. The Listen button shows a retry/"audio unavailable" message. |
| Translation fails | Fall back to the user's other available language and say so. |
| No outcome data for trade/district | Use nearest-level fallback with an explicit label, or say no data is available. |
| Staff authentication fails | Generic error. Lockout after repeated attempts. |
| Network offline on client | Offline banner, answers saved locally, chat disabled with explanation. |
| Background job fails | Retry with backoff, log the error. Escalation case creation must not depend on background jobs. |

---

## 13. Assumptions

| ID | Assumption |
|---|---|
| AR-A1 | The proposed stack fits the team's skills (W-07, Q-02). |
| AR-A2 | Hosting provides managed PostgreSQL and HTTPS. |
| AR-A3 | The chosen LLM supports tool calling and structured output. |
| AR-A4 | A suitable Hindi STT/TTS provider is available. Quality is to be evaluated. |
| AR-A5 | Seed and benchmark data are version-controlled in `data/`. |

## 14. Open Questions

| ID | Question |
|---|---|
| AR-Q1 | Where will this be hosted (cloud, region, government infrastructure)? Data residency may matter. |
| AR-Q2 | Which LLM/STT/TTS/translation providers are allowed and budgeted? (Q-14) |
| AR-Q3 | What are the performance targets (bundle size, response time) and the lowest supported device? (Q-11) |
| AR-Q4 | Which source of district boundary data will power the map? |
| AR-Q5 | Is any integration with national skilling platforms required in the MVP? (Currently assumed no.) |
