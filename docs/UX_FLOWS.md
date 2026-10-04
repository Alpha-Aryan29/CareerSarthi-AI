# UX Flows

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** Documents the step-by-step user journeys, including success, failure, loading, and empty behavior. It turns PRD features into screens and decisions the coding agent can implement without guessing.
> **Depends on:** PRD.md (F1 to F9, W-01 to W-04), DESIGN_SYSTEM.md.
> **Conventions:** "Family" means learner and/or parent using the app. Flow IDs (UX-xx) are referenced by TESTING.md.

---

## Flow Index

| ID | Flow | Actor |
|---|---|---|
| UX-01 | Start session, language and consent | Family |
| UX-02 | Learner profile | Learner |
| UX-03 | Parent profile | Parent |
| UX-04 | Agreement / difference summary | Family |
| UX-05 | Concern conversation (text or voice) | Family |
| UX-06 | View outcome data and career ladder | Family |
| UX-07 | Escalate to a human counsellor | Family |
| UX-08 | End-of-session sentiment check | Family |
| UX-09 | Resume a session | Family |
| UX-10 | Delete my data | Family |
| UX-11 | Staff login | Staff |
| UX-12 | Handle an escalation case | Counsellor |
| UX-13 | View resistance dashboard | Administrator |
| UX-14 | Load and label outcome data | Data steward |

---

## UX-01: Start Session, Language and Consent

```
Open app → Choose language → Who is here? → Consent → Choose location → UX-02
```

1. User opens the app. Splash shows the name and a short audio-enabled welcome.
2. **Language screen:** two large cards, "हिन्दी" and "English". Choice is stored and can be changed later from the top bar.
3. **Who is here?** Three large cards: "Learner only", "Parent only", "Both together" (recommended and highlighted). This sets session mode (see edge cases).
4. **Consent screen:** plain-language explanation (what is collected, why, who sees it, how to delete), with "Listen" button. If the learner is under 18 or the learner's age is unknown, the screen states that a **parent/guardian must agree** (W-01). Buttons: "I agree / मैं सहमत हूँ" and "Not now".
5. **Location screen:** choose state, then district (large lists with search). Used to select local data.
6. System creates the session, stores consent, and shows the **resume code** (short, readable, with a "Listen" button and "Save this code" hint).
7. Continue to UX-02 (or UX-03 if "Parent only").

**Success:** Session exists, consent recorded, location set.
**Failure:**
- "Not now" on consent → polite message, nothing is stored, option to return later. No data collected.
- Network error creating session → retry button and message; no partial session.
**Loading:** Spinner and "Please wait" while the session is created.
**Edge cases:**
- Learner age unknown → treated as possible minor (W-01).
- Parent only → the app notes that the learner's view is missing and continues in single-user mode.
- Location not found → option "My district isn't listed" then use state-level data (labelled as fallback).

---

## UX-02: Learner Profile

```
Education level → Interests (pick cards) → What worries you? (optional) → UX-03
```

1. Screen title: "Tell us about you". Learner (or the person helping) answers on one question per screen.
2. **Education level:** large cards from the lookup list (values to be configured, see DATABASE.md `education_levels`).
3. **Age band:** large cards (see DATABASE.md `age_band`).
4. **Interests:** multi-select icon cards (for example working with machines, electrical, vehicles, health care, computers, beauty and wellness, etc. The final list is configured data, not fixed in code).
5. Optional: "Anything you want to ask or worry about?" with voice or text.
6. Next → UX-03.

**Skippable:** every question except education level may be skipped.
**Failure:** Save error → inline message and retry, answers kept on screen.
**Empty state:** none.
**Edge:** Learner chooses "I don't know" for interests → app continues and later suggests trades from education level and location.

---

## UX-03: Parent Profile

1. Screen title: "Tell us about your family's concerns".
2. **Main concerns:** multi-select cards using the concern categories (earning potential, job security, respect/social standing, growth and further education, safety, distance from home, cost, "only for those who failed"). Each has icon, short label and "Listen". Option: "Something else".
3. **Household income bracket:** optional. Large cards. Preface text: "This helps us show the right support. You can skip."
4. Optional voice answer: "Tell us in your own words." (UX-05 style voice input)
5. Next → UX-04.

**Skippable:** all questions.
**Edge:** Parent selects no concerns → conversation starts open-ended in UX-05.

---

## UX-04: Agreement / Difference Summary

1. System compares learner and parent inputs and shows the **Agreement/Difference Card**.
2. Shows: "You both want..." (shared priorities), "Learner is thinking about..." and "Parent is thinking about...".
3. Buttons: "Let's talk about this" (→ UX-05), "Listen".

**Rules:**
- Only shown in "Both together" mode and only if both profiles exist.
- Language is neutral. It never says who is right.
- If there is nothing to compare, skip to UX-05.

**Failure:** If the summary cannot be generated, skip this screen and continue (the flow must never block here).

---

## UX-05: Concern Conversation (Text or Voice)

```
Assistant greeting → user speaks/types/taps → reply (text + data) → [Listen] → follow-up
                                  ↑                                         |
                                  └─────────── continue / "Talk to a person" ┘
```

1. Chat screen with assistant messages, user messages, and quick-reply chips (suggested concerns).
2. User may **speak** (mic button), **type**, or **tap a chip**.
3. System responds. If the answer involves numbers, an **Outcome Data Card** is attached (UX-06).
4. Each assistant message has a **Listen** button. No autoplay.
5. Concerns raised are tagged in the background. When a concern is addressed, the app asks a simple check: "Did this help?" with Yes / Not really (large buttons).
6. If "Not really" repeats (see threshold, Q-10) or other triggers occur, the app offers escalation (UX-07).
7. Persistent "Talk to a person" button.

**Loading:** typing indicator; if slow, "Still working on it".
**Voice failure:** "We couldn't hear that" with try again or type options.
**AI failure or no data:** the assistant says it does not have reliable information and offers (a) the nearest available data, labelled, and (b) escalation. It never guesses numbers (PRD D-05).
**Out-of-scope question:** polite redirect to what the app can help with; offer human if it matters.
**Language switch:** allowed any time; the conversation continues.
**Sensitive topic (for example safety):** the assistant answers carefully and **proactively offers** a human counsellor.
**Abusive or unsafe content, or signs of crisis:** respond calmly, do not argue, and offer human help. Exact crisis handling is an open question (UX-Q2).

---

## UX-06: View Outcome Data and Career Ladder

1. From a chat reply or the "Show me the numbers" shortcut, the user opens an **Outcome Data Card** for a trade in their district.
2. Card shows earnings range, placement rate, sample size, year, source, and **data-type label** (Verified / Public benchmark / Pilot data (demonstration)).
3. If data is not available at district level, a banner explains the fallback level (state or national) and labels it.
4. "See the path" opens the **Career Ladder** (pathway steps with NSQF levels, roles, and further-education routes).
5. "Compare" (Nice to Have) shows vocational vs degree path earnings. Not in MVP unless approved.
6. Each card has "Listen" and "Why should I trust this?" which opens a plain-language explanation of the label and source.

**Empty state:** "We don't have information for this trade yet." plus a human option.
**Failure:** card shows an error with retry; chat continues.
**Rule:** A pilot data card must always show "Demonstration data, not real results".

---

## UX-07: Escalate to a Human Counsellor

```
Tap "Talk to a person" (or accept the app's offer) → confirm contact → choose time → submit → confirmation
```

1. Triggered by: user tap, or assistant offer after a trigger (PRD F6).
2. Screen explains what will happen: "A counsellor will call you back. We will share a summary so you won't need to repeat yourself." (W-02)
3. Collects: **phone number** (required for callback), **preferred time window** (large cards, optional), and who will answer the phone (parent/learner, optional).
4. Consent line for sharing the conversation summary with the counsellor, with "Listen".
5. Submit → confirmation screen: "Request sent." Shows the case reference and what happens next.
6. The family can continue using the app after escalation.

**Failure:** Submit fails → data kept on screen, retry button, and message "Your request has not been sent yet."
**Edge cases:**
- User declines to give a phone number → explain that without a number a callback is not possible, and offer to try later; do not create an empty case.
- Duplicate request in the same session → show the existing case status instead of creating another.
- Request outside counsellor hours → show expected callback timing (TBD, UX-Q4).

---

## UX-08: End-of-Session Sentiment Check

1. Near the end (user taps "Finish", or after a defined period of inactivity), show a 5-face rating: "How do you feel about vocational training now?" (faces plus short words, with "Listen").
2. A matching "start" rating is collected at the beginning of UX-05 (before the first answer) so change can be measured.
3. Optional: "What would help you decide?" voice/text.
4. Thank-you screen, resume code reminder, and a "Talk to a person" option.

**Skippable:** yes. Skipped checks are recorded as missing, not as neutral.
**Rule:** The start and end ratings use the same scale and wording.

---

## UX-09: Resume a Session

1. On the start screen, "I have a code".
2. User enters the resume code (large input, numeric/alphanumeric keyboard as defined in API.md).
3. If valid, the app restores profile, conversation and consent, and continues where they left off.

**Failure:** Wrong code → friendly message with limited retries; repeated failure → temporary lockout (see SECURITY.md).
**Edge:** Session deleted → "This session no longer exists."

---

## UX-10: Delete My Data

1. Menu → "Delete my data".
2. Explain what will be deleted and what remains (anonymous counts), in plain language with "Listen".
3. Confirmation (danger button, confirm step).
4. Result screen: "Your data has been deleted."

**Failure:** Error → message and retry. Never show a false "deleted" state.
**Edge:** Deleting while an escalation is open → warn that the callback request will be cancelled.

---

## UX-11: Staff Login

1. Email and password screen (counsellor, administrator, data steward).
2. On success, redirect by role: counsellor → case queue, administrator → dashboard, data steward → data tools.

**Failure:** generic "Email or password is incorrect" (no hint which one). Lockout after repeated failures (SECURITY.md).
**Edge:** Deactivated account → generic failure.

---

## UX-12: Handle an Escalation Case (Counsellor)

1. **Queue screen:** table of open cases with priority, trigger reason, district, language, created time, and status.
2. Counsellor opens a case: sees **summary**, concerns raised (with status), data cards already shown, sentiment trend, preferred callback time, and the phone number (only after the counsellor claims the case).
3. "Claim case" assigns it to them.
4. After the call, the counsellor records outcome and note, and marks as "Resolved" or "Unreachable".
5. Optional (Nice to Have): AI-suggested talking points panel.

**Empty state:** "No open cases."
**Failure:** Claim conflict (another counsellor claimed first) → message and refresh.
**Rule:** Every view of a phone number is audit-logged.

---

## UX-13: View Resistance Dashboard (Administrator)

1. Landing: summary tiles (sessions, escalations, average sentiment change).
2. **Map/table by district:** concern intensity by location.
3. **Concern breakdown:** by category, by trade, by district.
4. **Sentiment shift:** before vs after.
5. **Escalations:** counts, response times, outcomes.
6. Filters: date range, state, district, trade, language.

**Rules:**
- Only aggregated data is shown. No individual families.
- Groups below the minimum size are suppressed with "Not enough data" (threshold in SECURITY.md).
- Data-type labels are shown for any benchmark figures.
**Empty state:** explains no data for the selected filter.
**Failure:** retry and error message.

---

## UX-14: Load and Label Outcome Data (Data Steward)

Per W-04, the MVP provides an **API and script**, not a full UI. If a UI is approved later (Q-07), this flow would be:

1. Upload CSV of outcome records.
2. Validation report (rows accepted/rejected with reasons).
3. Each record must have a source and data type.
4. Confirm import.

**Rule:** `verified` can only be set through an explicit verification action by a data steward and never on pilot data in the MVP (PRD A-08).

---

## Assumptions

| ID | Assumption |
|---|---|
| UX-A1 | A session has one or two participants (learner and/or parent) on a single shared device. |
| UX-A2 | A session ends by user tap or inactivity. The inactivity period is a configuration value (not defined here). |
| UX-A3 | A short "start" sentiment rating is acceptable to users and counted as part of the session. |
| UX-A4 | Callback is the only human contact mode in the MVP (W-02). |

## Open Questions

| ID | Question |
|---|---|
| UX-Q1 | Is a shared device used by both learner and parent, or might they join from two phones? |
| UX-Q2 | What should the app do if a user shows signs of crisis or harm (for example a helpline referral)? Which helpline(s)? |
| UX-Q3 | What sentiment question wording and scale are acceptable? |
| UX-Q4 | What are counsellor working hours and expected callback time? |
| UX-Q5 | What list of interests, education levels and income brackets should be used? |
