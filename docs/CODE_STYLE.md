# Code Style & Conventions

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** Keeps generated and hand-written code consistent across the whole project. It tells the coding agent (and humans) how to name, structure, handle errors, log, and format code.
> **Depends on:** ARCHITECTURE.md (stack is **PROPOSED**, W-07), DATABASE.md, API.md, SECURITY.md.
> **Note:** Tool choices below follow the proposed stack (TypeScript/Next.js frontend, Python/FastAPI backend). If the stack changes, this document changes with it.

---

## 1. General Principles

- Prefer readable code over clever code.
- Keep functions focused on one thing.
- Avoid unnecessary abstractions. Add one only when it is used in at least two places or an architecture rule requires it (for example AI provider adapters).
- Reuse existing components and utilities before writing new ones.
- Prefer consistency over novelty.
- **Project-specific hard rules:**
  1. Outcome numbers reach users only through the `grounding` pipeline (ARCHITECTURE Section 8).
  2. No user-facing text is hard-coded. It lives in locale files (`hi`, `en`).
  3. No provider SDK is used outside `ai_providers`.
  4. No personal data in logs.

---

## 2. Naming

| Item | Convention | Example |
|---|---|---|
| React components | `PascalCase` | `OutcomeDataCard` |
| TS functions and variables | `camelCase` | `fetchOutcomes` |
| TS constants | `UPPER_SNAKE_CASE` | `MAX_MESSAGE_LENGTH` |
| TS types and interfaces | `PascalCase` (no `I` prefix) | `AssistantMessage` |
| Python functions and variables | `snake_case` | `fill_numeric_slots` |
| Python classes | `PascalCase` | `OutcomeRepository` |
| Python constants | `UPPER_SNAKE_CASE` | `DEFAULT_LANGUAGE` |
| Frontend files | Components: `PascalCase.tsx`. Others: `kebab-case.ts` | `OutcomeDataCard.tsx`, `api-client.ts` |
| Python files | `snake_case.py` | `numeric_guard.py` |
| Database fields | `snake_case` per DATABASE.md | `earnings_median_inr` |
| API routes | lowercase, plural nouns, `kebab-case` for multiword | `/sessions/{id}/messages`, `/outcome-records` |
| JSON fields | `snake_case` per API.md | `session_token` |
| Locale keys | dot-separated, lowercase | `consent.title`, `chat.listen_button` |
| Test names | describe behavior | `rejects_pilot_data_marked_verified` |

Naming must match the names in DATABASE.md and API.md exactly.

---

## 3. Folder Structure

Follow the structure in ARCHITECTURE Section 7.

- Backend code is layered: `api` (routers) → `services` → `repositories` → database.
- Frontend code is organized by feature in `features/`, with shared design-system components in `components/`.
- One module per concern. Do not create cross-cutting "utils" dumping grounds. Place helpers next to where they are used, or in `core/` (backend) or `lib/` (frontend) when truly shared.
- Tests mirror source structure (TESTING.md).

---

## 4. Imports

- Order: standard library, third-party, internal. Separate groups with a blank line.
- Use path aliases in the frontend (for example `@/components/...`) instead of long relative paths.
- No circular imports. Module boundaries per ARCHITECTURE Section 8 are enforced by lint rules where possible.
- No wildcard imports.
- Do not import AI provider SDKs outside `ai_providers`.

---

## 5. Components (Frontend)

Components should:
- Have a single responsibility.
- Use design-system tokens (DESIGN_SYSTEM.md). No ad-hoc colors, font sizes, or spacing values.
- Be accessible: labels, focus states, keyboard support, text alternatives (DESIGN_SYSTEM Section 15).
- Meet touch-target and font-size minimums in the family app.
- Handle loading, empty, error, and offline states.
- Take text from locale files. They must never embed Hindi or English strings directly.
- Show the data-type label whenever they display an outcome figure.
- Avoid duplication. Reuse `OutcomeDataCard`, `ListenButton`, etc.

---

## 6. Functions

Functions should:
- Do one logical thing and have a clear name.
- Be short enough to read without scrolling when practical.
- Avoid deep nesting (use early returns).
- Use explicit types. No `any` in TypeScript without a comment explaining why. Type hints are required on all Python function signatures.
- Avoid hidden side effects. Functions that write to the database or call providers say so in their name or docstring.

---

## 7. Error Handling

**Use:**
- **Backend:** domain-specific exception classes (for example `SessionNotFoundError`, `ConsentRequiredError`) raised from services. A single error-handling layer maps them to the API error format and codes in API.md.
- **Frontend:** the API client converts error responses into typed errors with the `code`. UI maps the `code` to a localized, friendly message. Families never see raw codes or technical text.
- AI provider failures are caught in `ai_providers` and surfaced as provider errors. The conversation service decides on a fallback (ARCHITECTURE Section 12).

**Do not:**
- Swallow exceptions silently.
- Return `null` or empty data to hide a failure.
- Expose stack traces, SQL or provider error text to users.
- Invent fallback numbers or data when a lookup fails.

---

## 8. Comments

Comments should explain:
- **Why** something exists (for example why the numeric guard regenerates only once).
- Important tradeoffs and non-obvious behavior.
- References to documents (for example `# PRD A-08: pilot data can never be verified`).

Avoid comments that repeat the code. Remove stale comments. Use docstrings for public service functions.

---

## 9. Logging

**Backend:** Python standard `logging` configured for **structured JSON** output with `request_id`.
**Frontend:** no `console.log` in committed code. Use a small logging wrapper that is disabled in production for anything containing user content.

Rules:
- Follow SECURITY Section 9: **never log** passwords, tokens, API keys, resume codes, phone numbers, conversation text or free text.
- Log IDs, not content.
- Use levels consistently: `debug` (development only), `info` (business events), `warning` (recoverable), `error` (failures).

---

## 10. Formatting, Linting, Type Checking

| Area | Tool |
|---|---|
| TypeScript formatting | Prettier |
| TypeScript linting | ESLint (with accessibility plugin `jsx-a11y`) |
| TypeScript types | `tsc --noEmit`, with `strict: true` |
| Python formatting and linting | Ruff (`ruff format` and `ruff check`) |
| Python types | mypy (strict on `grounding`, `escalation`, `auth`; standard elsewhere) |
| Secrets | secret-scanning pre-commit hook |
| Commits | Short, imperative messages. One logical change per commit |

Formatters run automatically (pre-commit or CI). Code that fails lint or type checking is not complete.

---

## 11. Internationalization (i18n)

- Every user-facing string has keys in **both** `hi` and `en` locale files.
- Hindi strings that were machine-generated must be marked `unreviewed` until a native speaker approves them (DESIGN_SYSTEM Section 16).
- Do not concatenate sentences from fragments. Use full-sentence keys with placeholders because word order differs between Hindi and English.
- Format numbers and currency through a single helper (Indian digit grouping, "₹", per month).

---

## 12. Database and API Code

- Schema changes: update DATABASE.md first, then write an Alembic migration.
- API changes: update API.md first, then implement.
- Raw SQL only inside repositories. Use parameterized queries.
- Do not return ORM models from routers. Use Pydantic response schemas.

---

## 13. Do

- Reuse existing patterns.
- Keep changes focused on the task.
- Follow project conventions and documentation.
- Remove dead code.
- Add or update tests with the change (TESTING.md).
- Flag anything that conflicts with a document instead of guessing.

## 14. Don't

- Create duplicate utilities.
- Introduce unnecessary dependencies.
- Ignore the architecture or dependency rules.
- Change unrelated files.
- Hard-code strings, colors, or outcome numbers.
- Put real data, secrets, or personal data in tests, fixtures, or examples.
- Label demonstration data as verified.

---

## 15. Assumptions

| ID | Assumption |
|---|---|
| CS-A1 | The proposed stack is accepted (W-07). |
| CS-A2 | A monorepo with `apps/web` and `apps/api` is used. |
| CS-A3 | CI exists to run lint, type checks and tests. |

## 16. Open Questions

| ID | Question |
|---|---|
| CS-Q1 | Is the team comfortable with both TypeScript and Python? (Q-02) |
| CS-Q2 | Which branch and review workflow will be used (for example pull requests)? |
