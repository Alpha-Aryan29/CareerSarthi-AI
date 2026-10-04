# Workflow Prompts & Pre-Code Checklist

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** The copy-paste prompts for working with the AI coding agent (Antigravity or any other), adapted from the Vibe Coding Blueprint (Parts 7, 8, 11, 15 to 17) to this project's rules. It also audits the Blueprint's "before you write your first line of code" checklist against the documents already written.
> **Depends on:** AGENTS.md (the agent's standing rules), all other documents in `/docs`.
> **How to use:** AGENTS.md is loaded automatically by the agent. These prompts are what **you** type. Each one forces the agent to read, plan, wait for approval, build, validate, and update docs, in that order.

---

## 1. The Lifecycle

```
CREATE docs → REVIEW → BUILD (one step at a time) → VALIDATE → UPDATE docs → BUILD again
```

Per task, the loop is: **Context → Plan → Review plan → Implement → Validate → Review diff → Update docs → Commit.**

---

## 2. Prompt A: Context check (use at the start of every new conversation)

```text
Read AGENTS.md and the relevant files in /docs before making any change.
Do not modify any code or files yet.

Then tell me:
1. The non-negotiable rules you must follow (AGENTS.md section 3).
2. Which documents apply to the task I am about to give you.
3. Any conflicts, gaps, or TBD items in those documents that would block the task.
```

**Pass check:** the answer mentions the no-invented-numbers rule (D-05), the rule that demonstration data is never labelled verified, and consent before storing data. If it does not, the rules file is not loading. Fix that before continuing.

---

## 3. Prompt B: Plan (before any non-trivial change)

```text
Task: [TASK, one step from the build order in AGENTS.md section 5.1]

Do not modify code yet. Create an implementation plan that includes:
- Requirements affected (cite PRD feature IDs, e.g. F4, and flow IDs, e.g. UX-06)
- Documents that apply, and any that must be updated first
- Files likely to change
- Database changes (must already exist in DATABASE.md, otherwise stop and tell me)
- API changes (must already exist in API.md, otherwise stop and tell me)
- Security considerations (SECURITY.md)
- Tests required (TESTING.md flows T-xx)
- Edge cases and risks
- Open questions that block this task

Wait for my approval before implementing.
```

---

## 4. Prompt C: Implement (after you approve the plan)

```text
Implement the approved plan.
Follow the documentation as the source of truth.
Reuse existing components, utilities and patterns.
Do not add dependencies without asking me first.
Do not modify unrelated files.
Do not hard-code user-facing text (use hi and en locale files).
Do not write any outcome number into code, prompts, or fixtures as if it were real data.
If something is undefined or conflicts with a document, stop and ask. Do not guess.
```

---

## 5. Prompt D: Validate

```text
Now validate the implementation. Run:
- Tests (unit, integration, and relevant end-to-end flows)
- The evaluation suite, if you touched conversation, grounding, prompts or adapters
- Lint
- Type checking
- Build

Then inspect the final diff and report:
1. What changed
2. What you actually ran, and the real results (say so if something could not be run)
3. Remaining issues
4. Documentation that needs updating
```

---

## 6. Prompt E: Review as a senior engineer (after each feature, before you commit)

```text
Review the changes you just made as a senior engineer. Compare them against /docs.
Do not modify anything yet.

Check for:
- Incorrect requirements and architecture violations
- Duplicate logic and unnecessary abstractions
- Security issues, and authorization enforced server-side
- Database and API inconsistencies with DATABASE.md and API.md
- Accessibility and responsive UI issues (DESIGN_SYSTEM.md)
- Missing loading, empty, error and offline states
- Missing tests, regressions, unnecessary dependencies, unintended file changes

Project-specific checks:
- Any number shown to a user that does not come from the grounding pipeline
- Any outcome figure missing its source or data-type label
- Any path where demonstration data could be shown as verified
- Any personal data (phone, conversation text) in logs, prompts, tests or fixtures
- Any hard-coded Hindi or English string
- Any AI provider SDK used outside ai_providers
- Any data stored before consent

Provide: 1. Findings  2. Severity  3. Recommended fixes  4. Documentation to update.
```

---

## 7. Prompt F: Update the documentation

```text
Review whether this implementation changed any documented requirements,
architecture, database schema, API contracts, security rules, or conventions.
If yes, update the matching document (see the update table in section 9) and
list what you changed. Update the assumptions and open-questions tables if
anything was resolved. Do not change anything else.
```

---

## 8. Prompt G: Add a feature later

```text
I want to add this feature: [FEATURE]

Before changing code:
1. Read the relevant documentation.
2. Say which documents are affected, and whether this is in the PRD MVP scope
   or under Non-Goals. If it is a Non-Goal, stop and ask me.
3. Inspect the existing implementation and explain the current architecture
   relevant to this feature.
4. Identify affected frontend files, backend/API files, and database changes.
5. Identify security considerations and tests required.
6. Create an implementation plan and wait for my approval.

Do not modify unrelated parts of the project.
After implementation: run tests, lint, type checking and build, review the final
diff, and update the documentation if required.
```

---

## 9. When to Update Each Document

| Change | Update |
|---|---|
| Product requirement or scope | `PRD.md` |
| User journey | `UX_FLOWS.md` |
| Visual change | `DESIGN_SYSTEM.md` |
| New architecture or a technical decision | `ARCHITECTURE.md` |
| Database change | `DATABASE.md` (**before** the migration) |
| API change | `API.md` (**before** the endpoint) |
| Security change | `SECURITY.md` |
| Coding convention | `CODE_STYLE.md` |
| Testing strategy or commands | `TESTING.md` |
| Agent behavior | `AGENTS.md` |

The Blueprint also lists `ENVIRONMENT.md`, `ERROR_HANDLING.md`, `DEPLOYMENT.md`, `OBSERVABILITY.md`, `DECISIONS.md`, `ROADMAP.md` and `CHANGELOG.md`. They are **not created yet**. Environment variables, error codes and key decisions currently live inside `SECURITY.md`, `API.md` and `ARCHITECTURE.md`. See section 11.

---

## 10. Pre-Code Checklist (Blueprint Part 11), audited against this project

Legend: ✅ documented, ⚠️ documented but needs your approval or an answer, ❌ not done.

**Product**
- ✅ Idea, problem, target users, user stories, core features, non-goals, MVP scope (PRD)
- ⚠️ Success-metric targets are TBD (Q-12)

**UX**
- ✅ Major flows UX-01 to UX-14, with loading, empty, error and success behavior (UX_FLOWS)
- ⚠️ Crisis handling, callback hours, and lookup lists are open (UX-Q2, UX-Q4, UX-Q5)

**Design**
- ✅ Colors, typography, spacing, components, responsive rules, accessibility (DESIGN_SYSTEM)
- ⚠️ Palette and fonts are proposed. Contrast must be verified. No brand or logo (DS-Q1)

**Technical**
- ✅ Architecture, project structure, data flow, schema, API contracts documented
- ⚠️ **Tech stack is proposed and needs your approval** (W-07, depends on team skills, Q-02)
- ⚠️ Hosting and AI providers are not chosen (AR-Q1, AR-Q2)

**Security**
- ✅ Authentication, authorization, secrets, sensitive data, API security (SECURITY)
- ⚠️ Legal review of consent and children's data (SEC-Q1). Limits and retention values are TBD

**Code**
- ✅ Naming, folders, formatting, error handling, logging (CODE_STYLE)

**Testing**
- ✅ Critical flows T-01 to T-21, strategy, definition of done (TESTING)
- ⚠️ Tools are proposed. Commands are placeholders until the project is scaffolded

**AI**
- ✅ AGENTS.md exists. Workflow (this file). Source of truth and validation process are defined
- ⚠️ Documentation-update process is defined here and in AGENTS.md. It needs you to follow it

**Gate to start coding:** you approve the documents, confirm or change working defaults W-01 to W-07, and answer the team and deadline questions (Q-01, Q-02). Then change the "No application code" line in AGENTS.md section 1 to say the project is in the build phase.

---

## 11. Possible Additions (not created, your call)

| Document | Why you might want it | Recommendation |
|---|---|---|
| `ROADMAP.md` | Stops the agent suggesting features (NOW / NEXT / LATER / NOT PLANNED). Useful because the PRD Non-Goals are many | Add now |
| `DECISIONS.md` | Records choices such as AR-D1 to AR-D9 so they are not re-debated | Add when decisions are approved |
| `ENVIRONMENT.md` | Lists every environment variable once the project is scaffolded | Add during scaffold |
| `ERROR_HANDLING.md` | Currently covered by API.md error codes and ARCHITECTURE Section 12 | Optional |
| `DEPLOYMENT.md`, `OBSERVABILITY.md`, `CHANGELOG.md` | Production concerns | Later, once hosting is chosen |

---

## 12. Note on the API Response Format

The Blueprint's Part 9 shows an example envelope `{ "data": ..., "error": null }` for every response. This is only an example. API.md uses plain success bodies and an error object `{ "error": { "code", "message", "request_id", "details" } }` only on failure. Both are consistent. If you prefer the Blueprint's envelope, tell me and I will update API.md, CODE_STYLE.md and TESTING.md together.
