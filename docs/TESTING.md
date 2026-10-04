# Testing Strategy

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** Defines how the application is validated. "The code looks correct" is not enough. For this product, testing has two special concerns beyond normal software: (1) **no wrong or unsourced numbers reach families**, and (2) **it works for low-literacy users in Hindi and English**.
> **Depends on:** PRD.md (Definition of Done, F1 to F9), UX_FLOWS.md (flow IDs), ARCHITECTURE.md, API.md, SECURITY.md.
> **Note:** Test tools and commands follow the proposed stack (W-07).

---

## 1. Testing Goals

**Critical functionality (must never break):**

1. **Grounding:** every outcome figure shown comes from `outcome_records`, with source and data-type label (PRD D-05).
2. **Data labelling:** `pilot_demo` data is never labelled `verified` and always shows the demonstration wording (PRD A-08).
3. **Consent:** no data is stored before consent. Guardian consent is enforced for minor/unknown age (W-01).
4. **Escalation:** a case is created with a complete summary, only one active case per session, and the phone number is protected.
5. **Authorization:** each role sees only what it should (SECURITY Section 2).
6. **Privacy in analytics:** small groups are suppressed and no individual data reaches dashboards.
7. **Deletion:** a deletion request removes the data as specified (DATABASE Section 10).
8. **Language:** Hindi and English work across the family flows, including voice input and "Listen".

---

## 2. Test Types

### Unit Testing
Test:
- Numeric slot filling and the **numeric guard** (including tricky cases such as numbers inside Hindi text, Devanagari digits, ranges, percentages, "1,25,000" formatting).
- Escalation trigger rules and priority assignment.
- Concern classification mapping and status transitions.
- Sentiment score conversion (1 to 5 to -1 to 1).
- Agreement/difference summary logic.
- Currency and number formatting helper.
- Fallback selection (district → state → national).
- Validation functions (phone, enums, outcome record constraints).
- Frontend components in isolation (Outcome Data Card, label badge, Listen button, voice button states).

### Integration Testing
Test:
- API endpoints against a real PostgreSQL test database (all of API.md).
- Database constraints (`verified` rules, unique escalation per session, earnings ordering).
- Session token scoping (a token cannot access another session).
- Staff login, lockout, role permissions, audit-log writes.
- Escalation lifecycle: create, claim (including conflict), view contact (audit-logged), resolve.
- Analytics queries including small-group suppression.
- CSV import (valid, invalid, atomic failure).
- AI adapters using **fakes/mocks** for LLM, STT, TTS, translation, including timeouts and error responses.
- Deletion flow.

### End-to-End Testing
Run on a **mobile viewport** (360px) and also desktop for staff screens. Cover flows UX-01 to UX-14 as listed in Section 5.

### Grounding and Language Evaluations (`tests/evals/`)
Automated evaluations run against the conversation engine:
- **Numeric fidelity set:** question set where the expected figures come from known test records. Pass criterion: **100% of figures traceable** to a citation, with **zero** untraceable figures.
- **Adversarial set:** attempts to make the assistant invent numbers ("just guess the salary", "tell me what my son will earn"), prompt injection, and requests to drop labels. Pass criterion: no invented figures, no rule bypass.
- **Missing data set:** trade/district with no data. Pass: fallback with label, or explicit "no data" message.
- **Hindi quality set:** a set of Hindi (and Hinglish) parent concerns reviewed by a native speaker for clarity and respect.
- **Concern classification set:** labelled examples per concern category, measuring accuracy.
- **Bias checks:** the same question varied by gender, region, and income bracket. Responses must not discourage pathways on those grounds.
- **Safety set:** sensitive topics (for example safety of daughters, distress) lead to careful answers and an offer of a human.

Sizes of these sets and numeric pass thresholds beyond the zero-untraceable-figures rule are **not defined yet** (TS-Q1).

### Usability and Accessibility Testing
- **Automated:** axe-core checks in end-to-end tests, contrast checks, Lighthouse accessibility.
- **Manual:** keyboard navigation for staff screens, screen reader spot checks, text scaling to 200%.
- **Usability sessions with real target users** (parents and learners, ideally with low digital familiarity) following a written protocol: tasks, observer notes, success criteria, and quotes. This is a PRD Definition of Done item and is not replaceable by automated testing. Participant numbers are open (TS-Q2).
- **Hindi review** by a native speaker for all UI strings and sample replies.

### Performance and Network Testing
- Lighthouse and throttled network runs (slow mobile profile) on a low-end device profile.
- Measure AI turn latency with the chosen providers. Targets are not yet defined (ARCHITECTURE AR-Q3).

### Security Testing
- Authorization tests (role matrix, session token scoping).
- Input validation and rate-limit tests.
- Verification that logs contain no personal data (automated check on test logs).
- Dependency vulnerability scan in CI.
- Review of the SECURITY.md checklist before release.

---

## 3. Testing Tools (PROPOSED)

| Type | Tool |
|---|---|
| Backend unit and integration | pytest, pytest-asyncio, httpx test client, PostgreSQL test database (container) |
| Frontend unit | Vitest and Testing Library |
| End-to-end | Playwright (mobile and desktop projects) |
| Accessibility | axe-core (via Playwright), Lighthouse CI |
| Evaluations | Custom pytest-based eval harness in `tests/evals/` |
| Linting and types | Ruff, mypy, ESLint, `tsc` (see CODE_STYLE.md) |

---

## 4. Test File Structure

```text
tests/
├── unit/
│   ├── api/            # backend unit tests mirror src structure
│   └── web/            # frontend unit tests (or co-located, see CS decision)
├── integration/
├── e2e/
│   ├── family/
│   ├── counsellor/
│   └── admin/
├── evals/
│   ├── numeric_fidelity/
│   ├── adversarial/
│   ├── missing_data/
│   ├── hindi_quality/
│   ├── concern_classification/
│   └── bias/
├── fixtures/           # synthetic test data only
└── usability/          # protocols and anonymised findings
```

**Test data rules:** only synthetic data. No real family data, real phone numbers, or secrets. Test outcome records are clearly marked as test data.

---

## 5. Critical User Flows

| ID | Flow | Steps | Expected result |
|---|---|---|---|
| T-01 | Start session with consent (UX-01) | Choose Hindi, "Both together", agree, choose district | Session and consent stored, resume code shown. Declining stores nothing |
| T-02 | Minor consent rule | Learner age 15 to 17, consent attempted as learner | Rejected. Parent consent required |
| T-03 | Profiles and agreement summary (UX-02 to UX-04) | Fill both profiles with different concerns | Summary shows shared and different points. Skipping fields works |
| T-04 | Grounded answer (UX-05, UX-06) | Parent asks about earnings for a seeded trade | Reply figures match the record, card shows label, source, sample size |
| T-05 | Pilot data labelling | Ask about a trade with only `pilot_demo` data | Demonstration wording shown. Never labelled verified |
| T-06 | Fallback data | Ask for a district without data | Nearest level data shown with fallback notice |
| T-07 | No data | Ask for a trade with no data anywhere | Honest "no data" message and offer of a human. No invented numbers |
| T-08 | Voice input and Listen | Speak in Hindi, confirm transcript, tap Listen | Message sent with `input_mode = voice`. Audio plays only after tap. Audio not stored |
| T-09 | Voice failure | STT returns low confidence | Retry/type options shown |
| T-10 | AI failure fallback | Simulate LLM timeout | Fallback message, data card still shown if applicable, escalation offered |
| T-11 | Numeric guard | Simulate LLM output with an unsourced figure | Regenerate once, otherwise safe fallback. Stray figure never displayed |
| T-12 | Escalation (UX-07) | Tap "Talk to a person", enter phone, submit | Case created with summary. Second request shows existing case |
| T-13 | Counsellor handling (UX-12) | Log in, claim, view contact, resolve | Phone visible only after claim and audit-logged. Conflict handled |
| T-14 | Authorization | Counsellor calls admin endpoint. Family token calls another session | 403/404 as defined |
| T-15 | Sentiment shift (UX-08, UX-13) | Start and end ratings recorded | Dashboard shows before/after for sessions having both |
| T-16 | Small-group suppression | Dashboard filter with group below minimum | Suppressed ("Not enough data") |
| T-17 | Delete my data (UX-10) | Delete after conversation and escalation | Data removed per DATABASE Section 10. Case cancelled. Session unusable |
| T-18 | Resume (UX-09) | Resume with correct and wrong codes | Correct restores session. Repeated wrong codes lock out |
| T-19 | Language switch | Switch Hindi ↔ English mid-conversation | Context kept. UI and replies change language |
| T-20 | Offline (UX Section 12) | Go offline during profile | Banner shown, answers saved locally, chat disabled with explanation |
| T-21 | Data import (UX-14) | Import valid and invalid CSV | Valid imports. Invalid rejected atomically with reasons. Verify of `pilot_demo` rejected |

---

## 6. Coverage

**Target:** a practical target, not a blanket percentage. Numeric thresholds are not set yet (TS-Q3).

**Prioritize (must have thorough tests):**
- Grounding, numeric guard and data labelling
- Consent and minors rule
- Authorization and session token scoping
- Escalation creation and phone protection
- Deletion
- Analytics suppression
- The critical flows T-01 to T-21

Lower priority: purely presentational components.

---

## 7. Commands (to be confirmed when the project is scaffolded)

| Task | Command (proposed) |
|---|---|
| Backend tests | `pytest` (from `apps/api`) |
| Frontend tests | `pnpm test` (from `apps/web`) |
| End-to-end | `pnpm test:e2e` |
| Evaluations | `pytest tests/evals` |
| Lint (backend) | `ruff check .` |
| Lint (frontend) | `pnpm lint` |
| Type check (backend) | `mypy .` |
| Type check (frontend) | `pnpm typecheck` |
| Build | `pnpm build` and backend packaging as defined in DEPLOYMENT (not yet created) |

These commands are placeholders. The agent must not assume they exist until the project is created, and must update this section when they are set.

---

## 8. Definition of Done

A change is done when:

- [ ] Relevant unit and integration tests pass
- [ ] End-to-end tests for affected flows pass
- [ ] Evaluation suite passes with **zero untraceable figures**
- [ ] Lint, type checking and build pass
- [ ] Accessibility checks pass for changed screens
- [ ] Hindi and English strings both present (Hindi review status noted)
- [ ] No personal data in logs or fixtures
- [ ] Documentation updated where behavior, API or schema changed
- [ ] No blocking errors

**Product-level release gate** (additionally): usability testing with target users completed and documented (PRD Section 13).

---

## 9. Assumptions

| ID | Assumption |
|---|---|
| TS-A1 | Tests run with fake AI providers by default. Evaluations that need real providers run separately and are not part of every commit. |
| TS-A2 | A native Hindi speaker is available for review. |
| TS-A3 | Seed/test data exists for at least a few trades and districts (W-05). |

## 10. Open Questions

| ID | Question |
|---|---|
| TS-Q1 | How large should the evaluation sets be, and what accuracy thresholds apply to concern classification and Hindi quality? |
| TS-Q2 | How many target users can be recruited for usability testing, and where? |
| TS-Q3 | What coverage targets does the team want? |
| TS-Q4 | Will CI be available, and on which platform? |
