# DSA Master — All 5 Phases Complete

A personal DSA learning OS: question tracking with an adaptive spaced-repetition engine, dashboard analytics, mistake tracking, flashcards, achievements, and more. Built phase-by-phase per your spec; every phase was compiled and type-checked in-sandbox (`next build`, strict TypeScript) before moving to the next.

**Final build: 42 routes, zero errors.**

## Phase 1 — Foundation
- Next.js 14 App Router + TypeScript strict mode, Tailwind, dark-theme-by-default design system (indigo→violet accent gradient, swappable — see Phase 5), glassmorphic sidebar/topbar, Framer Motion transitions.
- Hand-rolled shadcn-style primitives (Button, Input, Card, Badge, Dialog, Select, MultiSelectChips, etc.) — the shadcn CLI registry wasn't reachable from this sandbox, but the class-variance-authority patterns match, so real `shadcn-ui add` components drop in cleanly.
- Auth: signup, login, forgot/reset password (1-hour expiring token, hashed at rest), Google OAuth, JWT access token (15 min, memory-only) + httpOnly refresh cookie (30 days), `tokenVersion`-based logout-all-devices, profile page.
- All 8 Mongoose models (User, Question, Topic, Pattern, Attempt, RevisionLog, Mistake, Flashcard).

## Phase 2 — Core Question Tracking
- Question list (`/questions`): debounced search, combinable URL-synced filters, skeleton loaders, pagination.
- Question detail (`/questions/[id]`): tabbed Brute/Better/Optimal code editor (CodeMirror 6, per-tab language + Big-O dropdowns), Tiptap markdown notes, confidence meter, attempt/revision timelines, "Log attempt" dialog with mistake tagging.
- Full CRUD APIs for Questions/Topics/Patterns; `/attempts` and `/revisions` endpoints (the SM-2 engine was built here, a phase early, since the detail page needed real revision data to render).
- Debounced autosave (flushes on tab-close), server + client HTML sanitization (`sanitize-html` — swapped in after `isomorphic-dompurify`'s jsdom broke the production build).
- Bundle-size fix: pulled Question-related constants out of `models/Question.ts` into `lib/constants/question.ts` so client components stop accidentally bundling `mongoose`.

## Phase 3 — Spaced Repetition Engine
- `/revisions` — dedicated "Due Today" view: every question where `nextRevisionDate <= now`, split into Overdue / Due Today, with inline Failed/Struggled/Confident buttons.
- Dashboard's revision-due count and the Due Today page share one hook (`useDueQuestions`) so the numbers can't drift apart.

## Phase 4 — Dashboard & Analytics
- Dashboard (`/dashboard`): animated goal ring, streak, revision-due, total solved, weekly chart, strong/weak topics, 365-day GitHub-style heatmap (custom SVG), learning calendar (month grid, click a day for detail).
- Analytics (`/analytics`): 90-day trend, difficulty donut, questions-per-topic, confidence-over-time, avg solve time, revision completion rate, consistency %, topic mastery leaderboard.
- Topics & Patterns (`/topics`, `/patterns` + `[slug]` detail): progress %, solved/remaining, revision due, avg time, confidence, weak areas, mastery score — sortable by "most neglected."
- Shared backend: `lib/analytics/group-stats.ts` computes topic *and* pattern stats from one function, so mastery numbers can't disagree between the dashboard, Analytics page, and Topics/Patterns pages.
- **Mastery formula (assumption, not spec'd):** `accuracy × confidenceNorm × revisionSuccessRate × 100`. Isolated in one function if you want it changed.
- **Known gap:** pattern-level mastery doesn't factor in revision-success-rate (only topic-level does) — `RevisionLog` is denormalized by topic only, since a question has one topic but many patterns. Documented in code; two possible fixes if it matters to you.
- Fixed a real bug: Tailwind color tokens weren't alpha-aware, so `bg-primary/20`-style opacity modifiers (used throughout, including the heatmap) silently didn't work. Switched to the `hsl(var(--x) / <alpha-value>)` pattern.

## Phase 5 — Supporting Features
- **Mistake tracker** (`/mistakes`): most-common tags, 90-day trend, filterable by topic/pattern.
- **Daily planner** (`/planner`): set question/revision/study-time goals, see today's progress against each.
- **Flashcards** (`/flashcards`): create from any question (also reachable via a "Make flashcard" button on the question detail page), flip-to-reveal review UI, reuses the exact same SM-2 engine and `RevisionLog` as Questions.
- **Achievements** (`/achievements`): 100/500/1000 solved, 30-day streak (longest-ever, so it doesn't un-unlock when a streak resets), Revision Master, Binary Search/Graph/DP Master — staggered unlock animation.
- **Notifications**: bell icon + dropdown with computed reminders (revisions due, today's goal progress, missed-yesterday nudge). **In-app only, as flagged in your original spec** — no background job or push/email service is wired up, so these are computed fresh on every fetch, not actually "pushed."
- **Settings**: 4-option accent color picker (applies instantly via CSS variables; also fixed a few SVG charts that had the gradient hardcoded and weren't following it) and one-click JSON data export. Profile edit / password change / logout-all / delete-account live on `/profile` (built in Phase 1) — Settings links there instead of duplicating.

## Explicitly stubbed / needs your input
- **Email delivery**: password resets are logged to the server console, not emailed. No transactional email provider is wired up (would need Resend or similar).
- **MongoDB / Google OAuth**: need your real credentials — every route compiles and type-checks but hasn't run against live services in this sandbox.
- **Assumptions worth double-checking against real data:**
  - Mastery score formula (Phase 4) — see above.
  - Achievement thresholds (Phase 5): 10 solved questions for topic-specific "Master" badges, 50 on-time revisions for "Revision Master" — not specified in your brief, so I picked reasonable numbers. Both live in `lib/achievements/definitions.ts`, a one-line change if you want different numbers.
  - Topic-Master matching is done by substring on the topic name ("binary search", "graph", "dynamic programming"/" dp") — works with conventional topic names, won't match something unexpected.
  - Attempt/RevisionLog/Mistake exist both embedded on Question (fast detail-page timelines) and as standalone collections (cross-question analytics) — an early Phase-1 assumption that everything downstream now depends on.
  - "Instant fuzzy search" is a debounced (250ms) server-side substring match, not a fuzzy-matching library.
- **Performance note**: analytics aggregations run fresh on every request — fine at hobby scale, first place I'd add caching if you scale into thousands of questions.

## What I couldn't verify here, so please check once you're running locally
- No live MongoDB or browser in this sandbox. I've hand-checked every aggregation pipeline and SM-2 calculation, but "compiles and type-checks" isn't the same as "the numbers are right with real data." Worth running through: solve a question → confirm it schedules a revision → log a revision → confirm the dashboard updates → confirm an achievement unlocks at the right threshold.
- Visual polish — I can't screenshot the rendered app. The design system is consistent across all five phases (same card/badge/gradient patterns throughout), but please tell me what needs adjusting once you see it running.

## Run it yourself
```bash
cd dsa-master
pnpm install
cp .env.example .env.local   # fill in MONGODB_URI, JWT secrets, Google OAuth keys
pnpm dev
```
Generate JWT secrets with `openssl rand -hex 32`.

## Your original 16-item build order, at a glance
1. Scaffold, dark theme + toggle, accent gradient — ✅ Phase 1
2. Auth — ✅ Phase 1
3. All 8 Mongoose models — ✅ Phase 1
4. Question model fields — ✅ Phase 1/2
5. Question list (search, filters, skeletons) — ✅ Phase 2
6. Question detail (editor, notes, mistakes, timelines) — ✅ Phase 2
7. SM-2 spaced repetition + Due Today — ✅ Phase 2/3
8. Dashboard widgets — ✅ Phase 4
9. Analytics page — ✅ Phase 4
10. Topic/Pattern pages with mastery — ✅ Phase 4
11. Mistake tracker — ✅ Phase 5
12. Daily planner — ✅ Phase 5
13. Flashcards — ✅ Phase 5
14. Achievements — ✅ Phase 5
15. Notifications (in-app, flagged) — ✅ Phase 5
16. Settings — ✅ Phase 1/5

The app is feature-complete against your spec. Next steps are up to you: real-data validation, visual QA, or picking at any assumption flagged above.

## Visual Polish Pass (post-launch, batch 1 of 3 requested)
After the initial build, a "make it feel premium" pass was requested. This batch covered **animations + glassmorphism/glow**, plus one item pulled forward from a later batch (**push notifications with sound**, since it was quick to add alongside the notification bell that already existed).

**Added:**
- `components/ui/animated-counter.tsx` — count-up animation for stat numbers (dashboard streak/solved/due, goal ring).
- `components/ui/stagger-list.tsx` — reusable fade-in-stagger wrapper, applied to the dashboard stat cards and the Topics/Patterns grids.
- `components/ui/page-transition.tsx` — cross-fade on every route change, wired into the dashboard layout.
- `components/ui/premium-empty-state.tsx` — bigger glowing icon, friendlier copy, CTA button; replaces the old plain "No items" text on Questions/Topics/Patterns/Flashcards.
- Card component gained `interactive` and `glow` props (hover-lift + soft glow); Button gained hover-scale and active-press micro-interactions.
- New CSS utilities: `.glow-primary`, `.glow-primary-hover`, `.gradient-border`, and a richer `.glass` (heavier blur).
- Sidebar: entrance slide-in, smoother active-item spring, hover nudge.
- **Browser push notifications with sound**: `lib/notifications/browser-push.ts` (permission request, `Notification` API, a synthesized two-tone chime via Web Audio — no audio file was available to source in this sandbox, so the chime is generated in code) + `hooks/use-browser-notification-watcher.ts` (fires once per new reminder, not on every 5-minute poll). Toggle lives in Settings → Notifications.

**Explicitly not done in this batch (next batches, on request):**
- Confetti, mascot/illustration, calendar hover tooltips, search autocomplete, multi-theme switching beyond the accent picker, sound effects for clicks, drag-and-drop planner, rich math/image notes, contest rating, AI Coach.
- AI Coach specifically needs your own Anthropic API key — skipped per your instruction, not forgotten.
- "Phone rings" notifications aren't possible from a website — browser push (implemented) is the closest real equivalent; explained this trade-off before building.

Same verification caveat as every phase: compiled and type-checked cleanly in this sandbox (`next build`, 42 routes, zero errors), but I have no browser here to confirm the animations actually feel right — please look at it running and tell me what to dial up or down.
