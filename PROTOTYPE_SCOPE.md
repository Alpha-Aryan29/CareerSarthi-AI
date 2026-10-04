# Prototype Scope (v2, front-end prototype)

> **Status:** ACTIVE. Overrides the stack (W-07) and the MVP scope for this prototype only.
> **Purpose:** Defines the front-end-only prototype built by one person with an AI agent. v2 expands v1 so the prototype covers every requirement in the problem statement, with a more polished, user-friendly design.
> **Rule:** Where this file and another document disagree about *what to build now*, this file wins. The non-negotiable rules in AGENTS.md section 3 still apply.
> **Deliberate overrides in v2:** DS-A3 (no dark mode) is relaxed to allow a high-contrast toggle. PRD "earnings comparison" (Nice to Have) is now in scope. Alumni/success stories stay **out** of scope (PRD Non-Goals).

---

## 1. What the prototype must prove

A learner and a parent are counselled **together**; parental concerns are answered with **sourced, labelled data** for *their* city; they can see **trades, training providers, and career ladders**; a **human** is one tap away; an **administrator** can see **where and why** resistance exists; and the app is usable by **low-literacy** users.

## 2. Stack

- **Vite + React + TypeScript**, plain CSS with design tokens (DESIGN_SYSTEM.md Sections 3 to 7).
- Allowed extra libraries (nothing else without asking): `react-router-dom` (screens), `recharts` (charts), `lucide-react` (icons).
- **No backend, database, login, or API keys.** Data lives in JSON under `src/data/`. Settings, requests and ratings are stored in `localStorage`.
- **No AI provider.** The conversation engine is deterministic: concern (chip or keyword) to response template, with every number filled from JSON (ARCHITECTURE AR-D2).
- Voice: browser speech synthesis for "Listen" and browser speech recognition for the mic. If a browser lacks Hindi, say so and fall back to text.

## 3. Cities (multi-city data)

Include at least these demo districts, mixing urban and rural settings, and make adding a city a data-only change (no code):
Mumbai, Pune, Nagpur, Nashik, Gadchiroli (Maharashtra); Lucknow (Uttar Pradesh); Jaipur (Rajasthan).

- Each city has a Hindi and an English name and a `setting` (`urban`, `semi_urban`, `rural`).
- Each trade has a **state-level fallback record**. If a city has no record, show the state record and a visible "State-level data" notice (API.md `is_fallback` behavior).
- Trades: Electrician, Fitter, COPA (Computer Operator), Health Sanitary Inspector (extend only if time allows).
- A few **demo training providers per city** (names clearly fictional, for example "Demo ITI Pune 1"), each with its own demo outcome record.
- Values must differ plausibly across cities. All are `pilot_demo` (Section 8).

## 4. Screen map

```
Welcome (language) → Consent → City → Home
Home (bottom nav: Home · Counsel · Explore · Help)
 ├─ Counsel
 │    Family setup (learner + parent) → Agreement card → Family summary (top trades + why)
 │    → Concern chat (chips, text, mic, Listen, "did this help?") → Talk to a person
 ├─ Explore
 │    Trade list (search, filter) → Trade detail
 │         Outcome Data Card · Career Ladder · What is NSQF? · Providers in my city
 │    Compare two trades · Compare cities · Earnings calculator
 └─ Help
      Talk to a person (callback form) · Settings
Staff (demo link in footer, no login): Counsellor queue → case · Admin dashboard
End of session: sentiment faces (also asked at start)
```

## 5. Settings and toggles (header gear / Settings screen)

| Setting | Behavior |
|---|---|
| Language | Hindi / English, switchable anywhere |
| City | Change city at any time; all data updates |
| Text size | Normal / Large / Extra large (scales the whole app) |
| Simple mode | Icons + audio + one action per screen, minimal text |
| High contrast | Higher-contrast theme (optional dark variant) |
| Read replies aloud | Off by default. When on, new assistant messages are read after the user opts in. Never autoplays when off |
| Audio speed | Slow / Normal |

All settings persist in `localStorage`. All settings are reachable without reading long text.

## 6. Upgrade scope (build in this order)

**U1. Design polish and toggles**
Apply design tokens, consistent cards, 48px touch targets, loading, empty, error and offline states, bottom navigation, settings from Section 5. Keep the persistent "Talk to a person" button.

**U2. Multi-city data and city selector**
Section 3 data. City selector at start and in the header. State-level fallback notice. "Compare cities" for one trade (side-by-side Outcome Data Cards).

**U3. Family mode**
Learner profile (education level, interests), parent profile (concerns, optional income bracket), Agreement/Difference card, and a **Family summary** listing the top 2 to 3 trades with a plain "why" line. Ranking is rule-based (interest match plus education eligibility) and the rule is shown to the user.

**U4. Explore**
Trade list with search, trade detail with Outcome Data Card, **Career Ladder** (NSQF steps, job roles, further-education routes including diploma and lateral degree entry), "What is NSQF?" plain explainer, providers in the selected city with provider-level outcomes, Compare two trades, and the **Earnings calculator**: 3-year earnings of a vocational route versus continuing general studies, where the user can edit assumptions (course cost, duration, starting pay). Starting pay defaults come from the trade's JSON record. The formula is displayed. The result is labelled "Illustrative estimate from demonstration data and your inputs".

**U5. Counsel chat upgrades**
All 8 concern categories (earning potential, job security, social status, growth and further education, safety, distance/travel, cost, "only for those who failed") with a response template each. "Why should I trust this?" sheet on every data card. "Did this help?" Yes / Not really. Escalation is offered after repeated "Not really", on the safety category, or on explicit request (PRD F6 triggers). Start and end sentiment faces (UX-08).

**U6. Staff views (demo)**
- **Counsellor:** queue of requests (new ones from the form plus a few seeded demo cases), priority, trigger reason, case summary, and a status (open, resolved, unreachable). The phone number is shown only after a "Claim case" click.
- **Admin dashboard:** filter by state, district, trade; concerns by category (bar chart); **district by concern grid** with colour and numbers (a map is optional); **Resistance Index** per district with the formula shown (for example weighted concern share, negative sentiment share, and escalation rate, using weights stored in a visible config); sentiment before versus after; escalation counts; and a rule-based **recommendations panel** (for example "Safety concerns are highest in [district]"). A visible **"Demo data"** banner on every dashboard screen. Small groups show "Not enough data".

## 7. Cut order if time runs short

Cut from the bottom upward, and never leave a half-built screen:
1. Compare cities and Compare two trades
2. Recommendations panel and Resistance Index
3. Earnings calculator
4. Providers list
5. Read-aloud toggle, audio speed, high contrast
6. Counsellor view (keep the request form working)

**Never cut:** the family flow, data cards with labels, the career ladder, Listen, "Talk to a person", and the admin concerns chart.

## 8. Data and content rules (binding)

- Every figure shown comes from a JSON record and is displayed with its source, year, sample size and **data-type label**. No number is typed into a component or template.
- **Reply text may only state what a data field supports.** No qualitative claims such as "stable", "good", or "safe" unless a data field backs them. Write "72.5% of the 150 trainees sampled were placed", not "it is a stable field".
- All demo figures use `data_type: "pilot_demo"` and show "Demonstration data, not real results". Nothing is labelled `verified`.
- Derived figures (calculator, indices, comparisons) are computed from JSON values with the formula visible, and are labelled as estimates.
- A real public benchmark may be added only with an exact source, table and year, labelled `public_benchmark`. Do not add one that cannot be sourced.
- Dashboard numbers are demo data with a visible banner. Demo cases contain no real names or phone numbers.
- Hindi text is unreviewed. Show a small "Hindi text under review" note in Settings or About.
- No keys, real personal data, or real phone numbers in the repository.

## 9. Out of scope

Backend, database, authentication, real speech quality guarantees, any LLM or translation service, session resume and deletion, rate limiting, real analytics, data import, a verification workflow, WhatsApp/IVR, success stories or testimonials, and deployment beyond a static host. State these honestly in the pitch as designed in the architecture and not yet built.

## 10. Done when

- [ ] The family flow works in Hindi and English on a phone-sized screen, in at least 3 cities
- [ ] Every number on screen traces to JSON and shows its label, and no unsupported adjective appears
- [ ] Text size, Simple mode, language and city toggles work and persist
- [ ] Listen works on assistant messages and data cards
- [ ] Career ladder, providers and compare views work for all 4 trades
- [ ] A callback request appears in the counsellor view
- [ ] The admin dashboard shows concerns by district, a resistance index, and sentiment shift with the Demo data banner
- [ ] `npm run dev` runs and `npm run build` succeeds
- [ ] No keys or personal data in the repository
