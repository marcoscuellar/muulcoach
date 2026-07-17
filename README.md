# Muul

**Show up. Do the thing. Every damn day.**

Muul is a content-calendar and AI coaching product that gets people posting
consistently on LinkedIn in their authentic, expert voice — while holding them
to a daily streak. It's built ADHD-first: one obvious next action per screen,
no blank pages, the streak as the dopamine engine, and a coach that acts as a
body-double rather than a nag.

This is a production recreation of the Muul design handoff, built in Next.js
against the **Slate** brand system.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for the design tokens (Slate palette)
- **Anthropic API** for live drafting + coaching, called server-side via a
  Next route handler (`/api/complete`)

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

The UI runs fully without a key — the Composer and Coach simply show a friendly
"not connected yet" message instead of a draft/reply until `ANTHROPIC_API_KEY`
is set.

### Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server                            |
| `npm run build`     | Production build                      |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | ESLint (next/core-web-vitals)         |
| `npm run typecheck` | `tsc --noEmit`                        |

## Screens

| Route        | Screen    | Notes                                                                 |
| ------------ | --------- | --------------------------------------------------------------------- |
| `/`          | Home      | Streak, weekly stats, "up next" queue, coach nudge, consistency heat  |
| `/composer`  | Composer  | **Live AI.** Angle → brain-dump → draft → refine → copy/schedule      |
| `/trending`  | Trending  | Trends + Daily Brief; each item seeds the Composer via query params   |
| `/calendar`  | Calendar  | Week view of scheduled / drafted / posted content                     |
| `/coach`     | Coach     | **Live AI.** Chat-based accountability coach                          |
| `/analytics` | Analytics | Engagement, consistency, posts/week, reach-by-type                    |
| `/library`   | Library   | Archive of past posts + drafts                                        |

The **"We Got You"** support widget (regulation / body-double panel) lives in
the top bar of every screen: pick a state → get a matched coping technique
(2-minute rule, timebox with a live timer, body-doubling links, movement break,
or "write the worst sentence") → offload a thought. State persists to
`localStorage['dos-support-widget-v1']`.

## Architecture

```
app/
  layout.tsx            Root: fonts (Space Grotesk / Instrument Sans / Space Mono)
  globals.css           Reset + CSS variables
  (app)/
    layout.tsx          App shell: sidebar + top bar + content
    page.tsx            Home
    composer/ …         Composer (client, live AI)
    trending/ …         Trending + Daily Brief
    calendar/ …         Calendar
    coach/ …            Coach (client, live AI)
    analytics/ …        Analytics
    library/ …          Library
  api/complete/route.ts Server-side Anthropic proxy
components/             Sidebar, TopBar, SupportWidget, Composer, Coach, icons, Tag
lib/
  anthropic.ts          Anthropic client + complete() (the LLM integration point)
  muul-client.ts        Browser → /api/complete wrapper
  prompts.ts            System prompts, angles, refines (from the design)
  data.ts               Placeholder content for the shell screens
```

## What's live vs. mocked

**Live (real AI):** Composer drafting/refining and Coach chat, through
`/api/complete` → Anthropic.

**Mocked (UI shells with placeholder data):** Trending feed, Daily Brief news,
Analytics, and the Home/Calendar/Library content. These match final visual
fidelity but have no real data source yet — see `lib/data.ts`. Wiring targets:

- **Trending / Daily Brief** — a live LinkedIn trends feed + a daily news source,
  filtered to the user's field and target buyer.
- **Analytics** — real LinkedIn post analytics (impressions, engagement,
  follower growth) plus streak/posting history.
- **Onboarding / voice-learning** — not yet built: one-time import of the user's
  emails, texts, past posts, and AI chat exports to train a voice profile the
  Composer's system prompt references.

## Brand — Slate

| Token         | Value     | Use                                        |
| ------------- | --------- | ------------------------------------------ |
| Volt (accent) | `#C4F542` | Action only — buttons, streaks, AI (~10%)  |
| Ink           | `#22282B` | All copy + dark surfaces                   |
| Paper         | `#FFFFFF` | Base background                            |
| Flare         | `#FF6A3D` | Rare AI / urgency pop                      |
| Surface       | `#F2F3F1` | Subtle raised surface                      |

Type: **Space Grotesk** (display), **Instrument Sans** (body), **Space Mono**
(labels/metrics). The logo is a CSS-drawn chevron mark — no image assets.

---

The original design references live in `_handoff/` (gitignored) — they are
prototyping references, not production code.
