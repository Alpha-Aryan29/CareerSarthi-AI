# Design System

> **Status:** DRAFT v0.1, awaiting review
> **Purpose:** Defines the visual language and UI rules so every screen looks and behaves consistently. It is written for a coding agent and for designers. Because the main users have low literacy and low digital familiarity (PRD F8), several rules here are **requirements**, not style preferences.
> **Depends on:** PRD.md (D-01 Hindi + English, D-02 mobile-first PWA, F8 low-literacy design, F4 data labels).
> **Everything below is PROPOSED.** No brand, logo or palette has been decided by you yet.

---

## 1. Design Direction

**Style:** Plain, warm, high-contrast, and uncluttered. Closer to a trusted government-service kiosk or a good banking app than to a startup landing page.

**Mood:** Respectful, calm and reassuring. The user may arrive worried or sceptical, so the interface must not feel childish or salesy.

**Design Principles:**

1. **Audio is first-class.** Every informational message and screen can be played aloud.
2. **Icon plus label, always.** An icon never appears alone for an important action.
3. **One main action per screen** on the family-facing app.
4. **Evidence is visible.** Any number carries its source and data-type label next to it.
5. **Never rely on reading speed.** Short sentences, short screens, big type.
6. **A human is always one tap away.** "Talk to a person" is persistent in the family app.
7. **Do not rely on color alone.** Always pair color with an icon or text.

---

## 2. Brand

**Brand Name:** CareerSarthi AI (chosen by the product owner, PRD A-02). Hindi form: करियर सारथी (proposed, needs native-speaker review).

**Logo:** Not defined. Until one exists, use the text wordmark in the heading font. Do not generate or invent a logo.

**Brand Voice:**
- Speaks to the family respectfully ("आप" form in Hindi, never casual "तू/तुम").
- Short, concrete and honest, and admits when data is missing.
- Never promises outcomes ("you will earn..."). It reports what the data shows ("people who trained earned...").
- No sales language and no pressure.

---

## 3. Color Palette

Colors are proposed tokens. **All text/background pairs must be verified with a contrast checker before approval (target WCAG AA, 4.5:1 for body text).**

| Token | Hex | Use |
|---|---|---|
| `--color-primary` | `#0F766E` | Main actions, links, active states |
| `--color-primary-contrast` | `#FFFFFF` | Text on primary |
| `--color-secondary` | `#B45309` | Secondary emphasis, highlights |
| `--color-background` | `#FAFAF7` | App background |
| `--color-surface` | `#FFFFFF` | Cards, bubbles, inputs |
| `--color-text` | `#1C1917` | Main text |
| `--color-text-muted` | `#57534E` | Secondary text |
| `--color-border` | `#D6D3D1` | Borders, dividers |
| `--color-success` | `#15803D` | Success states |
| `--color-warning` | `#A16207` | Warnings |
| `--color-error` | `#B91C1C` | Errors |

**Data-type label colors** (always shown with icon and text, see Section 10):

| Label | Token | Hex | Icon |
|---|---|---|---|
| Verified | `--color-label-verified` | `#15803D` | check-circle |
| Public benchmark | `--color-label-benchmark` | `#1D4ED8` | landmark / building |
| Pilot data (demonstration) | `--color-label-pilot` | `#A16207` | flask / beaker |

Dark mode is **not** in the MVP (DS-A3).

---

## 4. Typography

**Font Family:** Noto Sans (Latin) and Noto Sans Devanagari (Hindi), both open-licensed and loaded together so mixed Hindi/English text renders consistently. A system-font fallback is required for slow connections.

| Style | Family | Size / Weight / Line height |
|---|---|---|
| H1 | Heading (Noto Sans / Devanagari) | 28px / 700 / 36px |
| H2 | same | 22px / 600 / 30px |
| H3 | same | 18px / 600 / 26px |
| **Body (family app)** | same | **18px / 400 / 28px** |
| Body (staff console / dashboard) | same | 16px / 400 / 24px |
| Small | same | 14px / 400 / 20px |

Rules:
- **Minimum 16px anywhere in the family app** (nothing smaller than "Small" 14px, and Small is only for secondary captions).
- Devanagari needs extra line height. Never reduce Hindi line height below the values above.
- No all-caps in Hindi. Avoid italics in Hindi.
- Support browser text scaling up to 200% without breaking layout.

---

## 5. Spacing

**Base Unit:** 4px

**Spacing Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96 (px)

Rules:
- Screen padding on mobile: 16px.
- Minimum gap between tappable elements: 12px.
- Minimum touch target: **48 x 48px**. Primary actions: **56px tall**.

---

## 6. Border Radius

| Name | Value |
|---|---|
| Small | 8px |
| Medium | 12px |
| Large | 16px |
| Pill | 999px |

---

## 7. Shadows

- **Small:** subtle, for cards at rest. `0 1px 2px rgba(0,0,0,0.08)`
- **Medium:** for raised elements such as bottom sheets. `0 4px 12px rgba(0,0,0,0.12)`
- **Large:** for modal dialogs only. `0 12px 32px rgba(0,0,0,0.18)`

Prefer borders over shadows for separation.

---

## 8. Buttons

**Primary Button:** Primary background, white text, 56px high, full width on mobile, 12px radius, icon (24px) on the left of the label. One per screen.

**Secondary Button:** White surface, primary border (2px) and primary text, same size as primary.

**Danger Button:** Error color. Used only for destructive actions such as "Delete my data". Always requires a confirmation step.

**Disabled:** 40% opacity, no pointer events, **and** an explanation is shown near the button, never a silent disabled state.

**Loading:** Button label replaced by a spinner and a short text ("कृपया प्रतीक्षा करें…" / "Please wait…"). The button is not clickable while loading.

**Special: Talk to a person.** Persistent, secondary-style button with a phone/person icon and the label "किसी इंसान से बात करें" / "Talk to a person". It must be reachable from every family screen.

**Special: Listen.** A speaker-icon button labelled "सुनें" / "Listen" on every assistant message and informational card. Minimum 48px.

---

## 9. Inputs

**Default:** 56px high, 2px border, 18px text, visible label above the field (never placeholder-only labels).

**Focus:** 3px primary outline with 2px offset, clearly visible.

**Error:** Error-color border, an error icon, and a plain-language message under the field. Not color alone.

**Disabled:** Muted background and text, with a reason shown when relevant.

**Placeholder:** Muted text, used only for examples, never as the label.

**Voice input:** Large circular microphone button (64px), states: idle, listening (animated and text "सुन रहे हैं…" / "Listening…"), processing, error. Tapping again stops recording. Always offer a text field as the alternative.

**Choice inputs:** Prefer large selectable cards (icon plus label) over dropdowns and free text for profile questions.

---

## 10. Cards

**Standard card:** Surface background, 1px border, 16px radius, 16px padding, small shadow.

**Outcome Data Card (core component):**
- Trade name and location.
- The figure (earnings range or placement rate) shown large.
- **Data-type label badge** (Verified / Public benchmark / Pilot data (demonstration)) with icon and text.
- Source name, year and sample size (if available), in Small text.
- "Listen" button.
- If the data is fallback (for example state-level instead of district-level), a visible line says so.
- Pilot data cards also show the text "Demonstration data, not real results" in the family's language.

**Career Ladder Card:** Vertical step list. Each step: NSQF level, plain-language name, typical role or route, and an arrow to the next step. Further-education routes branch to the side with their own icon. Steps are readable without any jargon (an "NSQF?" help link explains the term in plain language).

**Agreement/Difference Card:** Two columns (learner and parent) with icons, plus a shared "You both want..." area on top.

---

## 11. Navigation

**Family app (mobile):**
- No sidebar. A simple top bar with back button, language switch (हिन्दी / English), and the persistent "Talk to a person" button.
- Linear flow with a progress indicator (steps, not percentages).
- No hidden gestures.

**Counsellor console and admin dashboard (desktop-first):**
- Left sidebar with icon plus text labels, collapsing to a top menu on tablet.
- Mobile fallback: usable but not optimized in MVP (DS-A4).

---

## 12. States

| State | Rule |
|---|---|
| **Loading** | Skeleton or spinner plus short text. If the AI reply takes more than a few seconds, show a "still working" message. |
| **Empty** | Explain in plain language what is missing and offer a next step (for example "No data for this district yet. Here is the nearest available data."). |
| **Error** | Friendly sentence, what the user can do next, and always the "Talk to a person" option. No error codes shown to families. |
| **Success** | Short confirmation with an icon, not just color. |
| **Disabled** | See Buttons. |
| **Offline** | Banner: "No internet. Your answers are saved on this phone." Chat input is disabled with explanation. |
| **Voice failure** | Fall back to text or choice buttons with a message ("We couldn't hear that. Please try again or type."). |

---

## 13. Icons

**Icon Library:** Lucide (outline style).

**Default Size:** 24px. Primary actions and navigation: 32px.

**Icon Style:** Outline, 2px stroke, rounded. Every icon used for an action has a text label (see Principle 2).

---

## 14. Responsive Design

**Mobile (primary):** Single column, bottom-aligned primary action, thumb-reachable controls.

**Tablet:** Single column, wider max width (max 640px content), or two-column cards where it helps.

**Desktop:** Family app is centered in a narrow column. Counsellor console and admin dashboard use multi-column layouts and tables.

**Breakpoints:**

| Name | Range |
|---|---|
| Mobile | 0 to 639px |
| Tablet | 640px to 1023px |
| Desktop | 1024px and above |

Design for **360px width** as the smallest supported screen (DS-A1).

---

## 15. Accessibility

- Use semantic HTML.
- WCAG 2.1 AA contrast as the target.
- Keyboard navigation for everything (required for staff console).
- Visible focus states.
- Accessible labels on every control, including audio and mic buttons. Screen reader labels exist in Hindi and English.
- Do not rely only on color (always icon or text).
- Respect `prefers-reduced-motion`.
- Audio must never autoplay without a user action. It starts only on tap ("Listen").
- Pair text with audio, never audio only.

---

## 16. Localization Rules

- All user-facing text is in locale files for `hi` and `en`. No hard-coded strings.
- Hindi strings must be reviewed by a native Hindi speaker before release. Machine-translated Hindi is marked as unreviewed.
- Numbers in Hindi UI: use Western digits (0-9) by default (DS-A2).
- Currency: Indian Rupee, shown as "₹" with Indian digit grouping (for example ₹1,25,000), per month where applicable.
- Layout must tolerate Hindi strings being longer than English.

---

## 17. Assumptions

| ID | Assumption |
|---|---|
| DS-A1 | Smallest supported screen is 360px wide. |
| DS-A2 | Hindi UI uses Western digits (0-9). |
| DS-A3 | No dark mode in the MVP. |
| DS-A4 | Counsellor and admin screens are desktop/tablet first. |
| DS-A5 | Noto fonts are acceptable and will be self-hosted or loaded in a way that works on slow connections. |

## 18. Open Questions

| ID | Question |
|---|---|
| DS-Q1 | Is there an existing brand, logo or color scheme (for example from the scheme or your team) to follow? |
| DS-Q2 | Who will review the Hindi text? |
| DS-Q3 | Should there be a lighter "text-light" mode for very slow connections? |
