# Product Requirements Document

> **Status:** DRAFT v0.1, awaiting review
> **Purpose of this document:** Defines *what* is being built, *why*, *for whom*, and what is in and out of scope. Every other document (design, UX flows, architecture, database, API, security, testing, agent rules) must stay consistent with this one. If another document conflicts with the PRD, the PRD wins until the PRD is deliberately updated.

**How to read the markers in this document**

- **[DECIDED]**: confirmed by the product owner.
- **[ASSUMPTION A-xx]**: reasonable default I have written down so work can proceed. Change it if wrong.
- **[OPEN Q-xx]**: unresolved. Listed again in Section 12.
- **[FROM PROBLEM STATEMENT]**: taken directly from the SIH problem statement.

---

## 0. Decision Log (reused by all other documents)

| ID | Decision | Source |
|---|---|---|
| D-01 | MVP languages: **Hindi + English** | [DECIDED] |
| D-02 | Primary platform: **mobile-first Progressive Web App (PWA)** | [DECIDED] |
| D-03 | Outcome data: **public benchmarks (PLFS, NSDC) plus clearly labelled pilot data** | [DECIDED] |
| D-04 | The product serves **learner and parent together** as one family unit | [FROM PROBLEM STATEMENT] |
| D-05 | The AI **never states a numeric outcome (earnings, placement rate) that did not come from the outcome-data store** | [ASSUMPTION A-01] |

### 0.1 Working Defaults (pending your confirmation)

These resolve open questions provisionally so the other nine documents could be written consistently. **None are confirmed.** Change any of them and the affected documents will be updated.

| ID | Working default | Resolves | Used by |
|---|---|---|---|
| W-01 | Learners under 18 may use the app only with a parent or guardian present, and consent is recorded as given by the parent/guardian. | Q-03 | SECURITY, UX_FLOWS, DATABASE |
| W-02 | MVP "human escalation" is an **asynchronous callback request** into a counsellor queue. No live voice, video or chat. | Q-04 | UX_FLOWS, ARCHITECTURE, API |
| W-03 | Families use the app **without an account**. A session is identified by an opaque session token and a short resume code. Only staff have accounts. | Q-09 | SECURITY, DATABASE, API |
| W-04 | Outcome data is loaded by seed script and CSV import through the data-steward API. A data-steward UI is deferred. | Q-07 | ARCHITECTURE, API |
| W-05 | Pilot trades and districts are **configuration**, not hard-coded. Their selection stays open (Q-05). | Q-05 | DATABASE, TESTING |
| W-06 | LLM, speech-to-text, text-to-speech and translation providers sit behind adapter interfaces, and no provider is chosen yet. | Q-14 | ARCHITECTURE, SECURITY |
| W-07 | The technical stack in ARCHITECTURE.md is **proposed**, not decided, and depends on team skills (Q-02). | Q-02 | ARCHITECTURE, CODE_STYLE |

---

## 1. Product Overview

**Product Name:** CareerSarthi AI [DECIDED, A-02]

**One-Line Description:**
A Hindi and English conversational counselling app that helps a learner and their parent decide on a vocational pathway together, answering family concerns with sourced outcome data and escalating to a human counsellor when needed.

**Product Type:** Multi-role web platform consisting of:
1. a family-facing conversational app,
2. a counsellor console,
3. a scheme-administrator dashboard.

**Primary Platform:** Mobile-first PWA (web). Desktop layouts are required for the counsellor console and admin dashboard.

---

## 2. Problem

**What problem are we solving?**
Enrolment and retention in vocational training in India are shaped as much by family perception as by the learner's own interest. Parents often see vocational routes as lower status than degree routes. That perception contributes to low enrolment, mid-course dropout, and reluctance to pursue NSQF-aligned progression. [FROM PROBLEM STATEMENT]

**Why does this problem matter?**
Existing guidance tools are learner-facing only. The parents who often make or veto the decision, especially in rural and semi-urban households, are not informed or reassured. Scheme administrators also cannot see where and why parental resistance is concentrated. [FROM PROBLEM STATEMENT]

**How are users solving this today?**
[ASSUMPTION A-03] Families rely on word of mouth, local training-centre staff, and general career-guidance tools aimed at the learner. This should be validated by the primary research planned in Q-06.

---

## 3. Goal

**Primary Goal:**
Enable a learner and parent to reach an informed, joint decision about a vocational pathway, by giving them credible, localised, sourced answers to the family's concerns.

**Secondary Goals:**

- Present outcome data (earnings ranges, placement rates, progression routes) with its source and verification status always visible.
- Explain how vocational qualifications map to job roles and career growth, in low-jargon language, tailored to the family's context.
- Hand unresolved cases to a human counsellor without making the family repeat themselves.
- Give scheme administrators visibility into where and why family resistance is concentrated.

---

## 4. Target Users

### User Type 1: Learner

- **Description:** A prospective or current vocational trainee, typically a school leaver or dropout choosing a pathway. [ASSUMPTION A-04: age band 15 to 25, including minors. See Q-03.]
- **Needs:**
  - Understand which trades fit their interests and academic background.
  - See a realistic growth path beyond the first job.
- **Pain Points:**
  - The family may veto their choice.
  - Guidance tools do not address their parents' concerns.

### User Type 2: Parent / Guardian

- **Description:** The household member who influences or decides the learner's pathway. May have low literacy and low digital familiarity. [FROM PROBLEM STATEMENT]
- **Needs:**
  - Honest information on earning potential, safety, job security and social standing.
  - Information in Hindi, spoken or written, with minimal jargon.
- **Pain Points:**
  - Perceives vocational training as low-status.
  - Distrusts generic information and wants local, credible numbers.
  - May be uncomfortable with text-heavy interfaces.

### User Type 3: Human Counsellor

- **Description:** A trained person who takes over cases the AI cannot resolve. [ASSUMPTION A-05: counsellors are employed or engaged by the scheme or training partners. See Q-08.]
- **Needs:**
  - A summary of the family, their concerns, and what was already discussed.
  - A queue of cases with priority and reason for escalation.
- **Pain Points:**
  - Families repeating themselves after handoff.
  - No visibility into prior AI conversation.

### User Type 4: Scheme Administrator

- **Description:** Staff who oversee vocational skilling schemes across districts. [FROM PROBLEM STATEMENT]
- **Needs:**
  - See where and why parental resistance is concentrated.
  - See sentiment change before and after counselling.
- **Pain Points:**
  - No structured data on the reasons behind low enrolment and dropout.

### User Type 5: Data Steward (internal role) [ASSUMPTION A-06]

- **Description:** A person who loads and maintains the outcome data and its verification status.
- **Needs:** A controlled way to add, label and update outcome data.
- **Note:** Whether this is a UI in the MVP or a managed data-load process is open (Q-07).

---

## 5. User Stories

**Family session**
- As a learner, I want to answer a few questions about my interests and schooling so that I get relevant trades.
- As a parent, I want to say my concerns in Hindi by voice so that I do not have to read or type.
- As a family, we want to see where the learner and parent agree and differ so that we can discuss the real disagreement.

**Information**
- As a parent, I want to see average and typical-range earnings for a trade in my district so that I can judge whether it is worth it.
- As a parent, I want to know whether the data is verified and where it came from so that I can trust it.
- As a learner, I want to see how a qualification leads to higher NSQF levels and further education so that I know it does not close the door on a degree.

**Escalation**
- As a parent, I want to talk to a real person when the app cannot answer my concern so that I feel heard.
- As a counsellor, I want a summary of the family's concerns and the conversation so far so that I can start where the AI stopped.

**Administration**
- As an administrator, I want to see resistance by district and by concern type so that I can target awareness efforts.
- As an administrator, I want to see how sentiment changed after counselling so that I can judge whether counselling works.

**Data and privacy**
- As a parent, I want to understand and control what data is collected so that I feel safe using the app.
- As a data steward, I want every number labelled with source and verification status so that nothing unverified appears as verified.

---

## 6. Core Features

### Feature 1: Family Session

**Purpose:** Counsel the learner and parent jointly rather than the learner alone.

**User Flow:**
1. A family member starts a session and selects language (Hindi or English).
2. Consent is shown and recorded (see F9).
3. The learner answers a short profile (interests, education level, location).
4. The parent answers a short profile (concerns, location, household income bracket).
5. The app presents a "where you agree / where you differ" summary.
6. The conversation proceeds to concerns, data and pathways.

**Inputs:** Language, consent, learner profile, parent profile.
**Outputs:** Family profile; agreement/difference summary; list of concerns to address.

**Acceptance Criteria:**
- The learner and parent can each give input separately within one session.
- The agreement/difference summary is shown to both.
- Income bracket and other sensitive fields are optional, and the session continues if skipped.

**Edge Cases:**
- Only one person is present (the session runs in single-user mode and flags that the other perspective is missing).
- The parent and learner give conflicting location data.
- The session is interrupted and resumed later (see Q-09).

### Feature 2: Conversational Interface (Hindi + English, Voice and Text)

**Purpose:** Let families interact naturally, including those who cannot comfortably read or type.

**Acceptance Criteria:**
- Users can interact in Hindi or English by text.
- Users can speak their input, and replies can be played back as audio, in Hindi and English.
- Every assistant message has a visible control to play it aloud.
- The user can switch language mid-session without losing context.

**Edge Cases:**
- Speech recognition fails or has low confidence (the app asks the user to repeat or offers text/choice buttons).
- Mixed Hindi/English input (Hinglish).
- No microphone permission or poor connectivity.

### Feature 3: Concern Handling Engine

**Purpose:** Recognise common parental concerns and respond with relevant, sourced data.

**Initial concern categories** [ASSUMPTION A-07, to be validated in primary research Q-06]:
earning potential, job security, social status/perception, growth and further education, safety (including for girls), distance/travel, cost, and "only for those who failed".

**Acceptance Criteria:**
- Each user concern is classified into one or more categories, or "other".
- Responses to categories involving numbers use outcome data (see F4) and show source and label.
- If no relevant data exists for the family's trade and district, the app says so and falls back to the nearest available data with an explicit label (for example, state-level or national benchmark).
- Unclassifiable or repeated unresolved concerns trigger escalation (F6).

### Feature 4: Outcome Data Store and Display

**Purpose:** Ensure every number shown to families comes from a defined, labelled source.

**Data fields (conceptual, final schema in DATABASE.md):** trade, provider, location, cohort year, earnings range, placement rate, sample size, NSQF level, progression pathways, source, data type, verification status.

**Data type labels** [DECIDED, D-03]:
- **Public benchmark:** derived from public sources such as PLFS and NSDC.
- **Pilot data (demonstration):** created for this project and visibly labelled as such.
- **Verified:** reserved for data confirmed through a provider verification process. In the MVP, no pilot data may be labelled verified. [ASSUMPTION A-08]

**Acceptance Criteria:**
- Every displayed number shows its source, data type label, and (where available) sample size and year.
- Earnings are shown as ranges, not only as a single average, where the data supports it.
- The AI does not state any earnings or placement figure that was not returned from the data store (D-05).
- Pilot data is never presented as real or verified.

### Feature 5: Pathway Explainer (Career Ladder)

**Purpose:** Show, in plain language, how a qualification leads to job roles and higher qualifications.

**Acceptance Criteria:**
- Shows a step-by-step path (starting qualification level, next NSQF levels, job roles, further education options).
- Tailored using the family's location, income bracket (if given) and learner's academic background.
- Uses minimal jargon, and any technical term (for example "NSQF") has a plain-language explanation.
- Explicitly shows routes from vocational pathways to further education where such routes exist in the data.

**Edge Cases:**
- No matching pathway for the learner's academic background.
- Pathway data incomplete for a trade.

### Feature 6: Human Escalation and Counsellor Console

**Purpose:** Provide a clear path to a human when the AI cannot adequately help.

**Escalation triggers** [ASSUMPTION A-09]:
- User explicitly asks for a human.
- The same concern remains unresolved after repeated attempts (threshold TBD, Q-10).
- Low AI confidence or no available data.
- Strongly negative sentiment.
- Sensitive topics (for example a safety concern) as defined in the concern categories.

**Acceptance Criteria:**
- The family can request a human at any point.
- Escalation creates a case with a conversation summary, concerns raised, data already shown, and trigger reason.
- Counsellors can view a queue, open a case, and mark it resolved with a note.
- The family is told what to expect next (for example "a counsellor will contact you").

**Out of scope for MVP escalation:** live video/voice infrastructure (see Q-04).

### Feature 7: Engagement, Sentiment and Admin Dashboard

**Purpose:** Show administrators where and why family resistance is concentrated.

**Acceptance Criteria:**
- Concern categories are tagged per session and aggregated by district (and block where data allows).
- Sentiment is recorded at defined points so that **change** (before vs after) can be shown.
- Dashboard shows: concerns by category and location, sentiment shift, escalation counts and outcomes, and session/engagement counts.
- Dashboard displays only aggregated and anonymised data, with no individual family identities.

**Edge Cases:**
- Small sample sizes in a district (display a "low sample" warning).
- Sessions with no sentiment data.

### Feature 8: Low-Literacy and Low-Digital-Familiarity Design

**Purpose:** Make the app usable by people with limited reading ability and limited app experience.

**Acceptance Criteria:**
- Core flows can be completed using icons, large buttons and audio, without reading long text.
- Audio playback is available on every informational screen.
- Language is plain and avoids jargon.
- The interface works on low-end Android phones and on slow connections. Exact targets are TBD (Q-11).
- A usability test with real target users is planned and documented (see Success Metrics).

### Feature 9: Consent and Privacy

**Purpose:** Collect and use family data lawfully and transparently.

**Acceptance Criteria:**
- Consent is requested before personal data is collected, in the user's chosen language.
- Handling of minors' data follows the requirements to be defined in SECURITY.md (see Q-03).
- Users can see what is collected and request deletion [ASSUMPTION A-10].

---

## 7. Non-Goals

Intentionally **not** part of this version:

- WhatsApp or IVR/missed-call channels.
- Regional languages other than Hindi (English is included).
- Native Android/iOS apps.
- Course enrolment, fee payment, or application submission.
- A provider-facing portal for submitting data (designed conceptually, not built).
- Automated verification of provider data against official records.
- Live video or voice counselling infrastructure (see Q-04).
- Alumni testimonial or video matching.
- Job listings or placement services.

---

## 8. MVP Scope

**Must Have:**
- F1 Family Session
- F2 Conversational interface in Hindi + English with text and voice
- F3 Concern handling for the initial categories
- F4 Outcome data store with source/label display (PLFS/NSDC benchmarks plus labelled pilot data)
- F5 Pathway explainer
- F6 Escalation to a counsellor queue with case summary
- F7 Admin dashboard with concern and sentiment views
- F8 Low-literacy design basics
- F9 Consent

**Nice to Have:**
- Earnings comparison between a vocational path and a degree path.
- A resistance index per district.
- AI-suggested talking points for counsellors.
- Offline or low-bandwidth mode.

**Future:**
- WhatsApp and IVR channels.
- Additional languages.
- Provider data submission and verification workflow.
- Alumni stories matched to family context.
- Integration with national skilling platforms.

---

## 9. Success Metrics

Targets are **TBD** until baselines exist. No numeric targets have been invented here (Q-12).

**Primary Metrics:**
- Share of numeric statements shown to users that trace to a source in the data store (expected: 100%).
- Change in parent sentiment before vs after a session.
- Share of sessions completed by both learner and parent.
- Share of escalations that reach a counsellor with a complete summary.

**Secondary Metrics:**
- Concern categories resolved without escalation.
- Speech recognition success rate in Hindi.
- Task completion in usability testing with target users.
- Response latency.

---

## 10. Constraints

**Technical:**
- Mobile-first PWA that works on low-end phones and variable connectivity (D-02).
- Hindi and English only in MVP (D-01).
- Outcome data limited to public benchmarks and labelled pilot data (D-03).

**Business:**
- Business model, ownership and deployment partner are not defined (Q-13).

**Design:**
- Must serve users with low literacy and low digital familiarity (F8).

**Timeline:**
- Hackathon deadline and team size are not yet confirmed (Q-01, Q-02).

**Legal and compliance:**
- Personal data of families, including minors, is involved. India's data-protection requirements (DPDP Act) must be reviewed for SECURITY.md. This is not legal advice.

---

## 11. Assumptions

| ID | Assumption |
|---|---|
| A-01 | The AI never states a numeric outcome that did not come from the outcome-data store. |
| A-02 | The product name is "CareerSarthi AI" (chosen by the product owner). The Hindi form "करियर सारथी" is proposed and needs native-speaker review. No logo or brand identity exists yet. |
| A-03 | Current alternatives are informal (word of mouth, centre staff, learner-only tools). |
| A-04 | Learners are aged 15 to 25 and may include minors. |
| A-05 | Human counsellors are available to the scheme and respond asynchronously (queue, callback) in the MVP. |
| A-06 | A data steward role exists to manage outcome data. |
| A-07 | The initial concern categories are those listed in F3. |
| A-08 | No pilot data may carry the "verified" label in the MVP. |
| A-09 | Escalation triggers are those listed in F6. |
| A-10 | Users can request deletion of their data. |
| A-11 | Pilot data will cover a small set of trades and districts, to be chosen (Q-05). |

---

## 12. Open Questions

| ID | Question | Blocks |
|---|---|---|
| Q-01 | What is the submission deadline, and what are the milestones? | Roadmap, scope |
| Q-02 | Team size and skills (frontend, backend, AI, data)? | Architecture, scope |
| Q-03 | Are minors expected to use the app directly, and is parental consent required? | SECURITY.md, UX_FLOWS.md |
| Q-04 | Is "connect to a live counsellor" acceptable as a callback or queue request in the MVP, or must it be a live call or chat? | F6, ARCHITECTURE.md |
| Q-05 | Which trades and which districts or state should the pilot data cover? | DATABASE.md, F4 |
| Q-06 | Will you run a small survey or interviews with parents to validate concerns and baselines? | Success metrics |
| Q-07 | Is the data steward a UI in the MVP, or is data loaded by script? | DATABASE.md, API.md |
| Q-08 | Who are the real counsellors, and do they have login accounts in the MVP? | SECURITY.md, F6 |
| Q-09 | Does a family need an account, or can they use the app anonymously with a session link? | SECURITY.md, DATABASE.md |
| Q-10 | What threshold defines "repeated unresolved concern" for escalation? | F6 |
| Q-11 | What are the minimum device and network targets (for example, lowest Android version)? | ARCHITECTURE.md, TESTING.md |
| Q-12 | Are there target numbers to set for success metrics, once baselines exist? | Section 9 |
| Q-13 | Who owns and hosts the product after the hackathon? | Constraints, DEPLOYMENT |
| Q-14 | Which LLM, speech and translation providers are allowed or preferred (for example, Bhashini or others)? | ARCHITECTURE.md |

---

## 13. Definition of Done

The product is considered complete for the MVP when:

- [ ] All Must Have features (Section 8) are implemented
- [ ] A learner and parent can complete a joint session in Hindi and in English
- [ ] Every number shown to users displays source and data type label
- [ ] No unlabelled or unsourced figure is produced by the AI in the test set
- [ ] An escalation creates a counsellor case with a complete summary
- [ ] The admin dashboard shows concerns and sentiment change by location using anonymised data
- [ ] Usability testing with target users has been performed and documented
- [ ] Critical user flows work and tests pass
- [ ] Build succeeds
- [ ] Security and privacy requirements in SECURITY.md are satisfied
- [ ] Documentation is updated
