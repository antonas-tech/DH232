# DH/232 — Beat Battles

Closed competitive platform for beatmakers, inspired by *Digital Hustlas*.
Built with Next.js 14 (App Router), TypeScript, Tailwind, Shadcn-style UI,
WaveSurfer.js, Prisma, and Supabase (Auth + Postgres + Storage).

## Features

- 3-tier role model: **USER** (beatmaker), **JUDGE**, **ADMIN**
- Admin CRUD for rounds: cover images, sample-pack ZIP uploads,
  status transitions (`DRAFT → REGISTRATION → ACTIVE → JUDGING → FINISHED`)
- Strict per-user timer that starts when a beatmaker joins and starts the
  round; the upload form locks once time runs out
- Drag-and-drop beat upload (.mp3 / .wav) directly to Supabase Storage with
  progress feedback
- **Judge panel** with WaveSurfer waveform player, anonymous "Submission #N"
  labels, and 4-criterion sliders (Mix / Idea / Sample / Vibe) + comments
- Score deduplication via unique `(submission_id, judge_id)` index
  (re-submissions update the existing score)
- Auto-recomputation of beatmakers' lifetime `total_score`
- Public **leaderboard** + **Hall of Fame** of legendary beats and users
- **Global persistent audio player** (Zustand store + single bottom bar)
  that survives route changes
- Brutalist dark UI with neon accents, DAW vibes, scanlines, animated
  borders

## Tech Stack

- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS,
  Shadcn-style primitives, Framer Motion, Lucide icons
- **Audio:** WaveSurfer.js (waveform), HTML `<audio>` for global player
- **Backend:** Next.js Route Handlers (`src/app/api/...`)
- **DB / Auth:** Supabase (Postgres + Auth + OAuth GitHub/Google) +
  Prisma ORM
- **Storage:** Supabase Storage buckets — `avatars`, `samples`, `beats`,
  `covers`
- **State:** Zustand (player), React Server Components everywhere else
- **UX:** `sonner` toast notifications, server actions, optimistic refresh

## Getting Started

```bash
# 1. install deps
npm install

# 2. configure env
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, anon + service-role keys, DATABASE_URL,
# DIRECT_URL

# 3. push schema
npx prisma db push

# 4. dev
npm run dev
```

### Supabase setup

1. Create a Supabase project.
2. Enable **Email/Password**, **GitHub**, and **Google** providers under
   *Authentication → Providers*.
3. Set the redirect URL to `${NEXT_PUBLIC_APP_URL}/api/auth/callback`.
4. Create 4 public buckets: `avatars`, `samples`, `beats`, `covers`.
5. Recommended bucket policies: public read for `avatars`, `covers`, `beats`,
   `samples`. Authenticated insert for all four.
6. Run `npx prisma db push` to provision tables.

### Promote yourself to ADMIN

After your first sign-in, the user row is created with role `USER`. Open
your Supabase SQL editor and run:

```sql
update users set role = 'ADMIN' where email = 'you@example.com';
```

You can then promote others from `/admin/users`.

## App Routes

| Route                       | Who              | Purpose                                          |
|----------------------------|------------------|--------------------------------------------------|
| `/`                        | public           | Landing, top rounds, leaderboard preview, HoF    |
| `/rounds`                  | public           | All rounds                                        |
| `/rounds/:id`              | public           | Round detail, join + start timer + upload beat   |
| `/leaderboard`             | public           | Season leaderboard                               |
| `/hall-of-fame`            | public           | Legends + greatest beats                         |
| `/u/:username`             | public           | Public profile + beat history                    |
| `/login`                   | public           | Email/password + OAuth                           |
| `/settings`                | auth             | Edit profile (username, bio, links, avatar)      |
| `/judge`                   | JUDGE/ADMIN      | List of rounds open for judging                  |
| `/judge/:id`               | JUDGE/ADMIN      | Anonymous score board                             |
| `/admin`                   | ADMIN            | Stats overview                                    |
| `/admin/rounds`            | ADMIN            | CRUD list                                         |
| `/admin/rounds/new`        | ADMIN            | Create round                                      |
| `/admin/rounds/:id`        | ADMIN            | Edit / delete                                    |
| `/admin/users`             | ADMIN            | Roles + Hall of Fame toggle                       |

## Deployment

The project is Vercel-ready out of the box. Add the same env vars to your
Vercel project, point Supabase OAuth callbacks to your production URL, and
deploy. The `postinstall` and `build` scripts run `prisma generate`
automatically.

## Project Layout

```
src/
  app/
    api/                 — route handlers (auth, rounds, judge, admin, me)
    admin/               — admin panel (RBAC enforced server-side)
    judge/               — judge panel
    rounds/              — public rounds + participate flow
    u/[username]/        — public profile
    settings/            — self-service profile editor
    login/               — auth
  components/            — UI primitives + global player + headers
  lib/                   — supabase clients, auth, prisma, utils, storage
  store/                 — zustand global player store
prisma/schema.prisma     — DB models
```

## Notes

- Timer enforcement is performed both client-side (UI lockout) and
  server-side (`/api/rounds/:id/submit` rejects late uploads and marks the
  participant as `EXPIRED`).
- Scores are always *upserted* — judges can revise their own past scores.
- Beatmaker total scores are recomputed on every score write so that the
  leaderboard stays accurate without cron jobs.
