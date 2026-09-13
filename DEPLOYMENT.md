# USDX AI — Admin Panel / CMS Setup & Deployment

The site includes a fully self-contained admin panel (CMS) at `/admin`, backed by
Supabase. Everything (database schema, admin accounts, API routes, media library,
publishing) is included in this repo. Follow the steps below once to enable it.

## 1. Create / prepare the Supabase project

1. Create a project in [Supabase](https://supabase.com) (or use the existing one with the database named `usdxai`).
2. Browse to **Dashboard → SQL Editor → New query**.
3. Open `supabase/schema.sql` in this repo, copy every line into the SQL editor, and press **Run**.

   This creates all tables (`admins`, `admin_sessions`, `cms_sections`,
   `cms_instructions`, `cms_announcements`, `cms_media`, `cms_settings`,
   `cms_leaderboard`), enables Row Level Security (public users can only read
   published content), and seeds the default admin account plus starter content.
   The leaderboard is intentionally left empty — real participants are added via
   Admin Panel → Leaderboard.

4. From **Project Settings → API**, copy three values:
   - `Project URL` (e.g. `https://xxx.supabase.co`)
   - `anon public` key
   - `service_role` key

   Keep the `service_role` key secret — it is only used server-side.

## 2. Configure environment variables

Local development uses `.env.local` (gitignored). Copy `.env.example` config:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

> Keys are stripped from git. If you cloned a copy without `.env.local`, paste the
> values into your local `.env.local` to run locally.

## 3. First admin login

1. Start the app (`npm run dev`) or deploy it, then open **`/admin`**.
2. Sign in with:
   - **Email:** `sabareshvsb1@gmail.com`
   - **Password:** `12345678`
3. **Immediately** go to **Account → Password** and change the password.
4. Recommended: enable **Two-factor authentication** from **Account → 2FA**.

The default admin credentials are also embedded in `supabase/schema.sql` — that's
expected, but change the password after first login.

## 4. Media bucket

The media library stores uploads in the Supabase Storage bucket `cms-media`. The
bucket is created automatically on the first upload (server-side). Because Storage
buckets are not covered by the table-level RLS above, this call uses the
service-role key, so no manual bucket setup is required.

If you prefer to create it manually: **Storage → New bucket → `cms-media`** and mark
it **public** (readable by visitors).

## 5. Deploy to Vercel

1. Import the repo into [Vercel](https://vercel.com).
2. In **Project Settings → Environment Variables**, add the three variables from
   step 2.
3. Deploy. The build should complete without configuration changes — the admin
   uses a `proxy.ts` guard (Next.js 16), standard route handlers, and server-side
   sessions.

## How the CMS works

- `/admin` — dashboard, website sections, instructions, announcements,
  leaderboard rankings, media library, site settings, account (profile / password
  / 2FA / active sessions).
- Publishing: create or edit content, then hit **Publish**. Only `published`
  content with `enabled = true` becomes visible.
- `/api/public/content` — public endpoint returning only published content; the
  public site renders announcements, the live leaderboard and CMS-managed
  sections from it on the dashboard, knowledge base, docs, FAQ and settings
  pages.
- Leaderboard rankings refresh on the public site every 15 seconds from the same
  public endpoint — add and publish entries via Admin Panel → Leaderboard.
- Sessions are server-side and revocable from **Account → Active sessions**.
- Rate limiting protects the login endpoint.

## Local scripts

```
npm run dev     # dev server
npm run lint    # eslint
npm run build   # production build (recommended after schema changes)
```