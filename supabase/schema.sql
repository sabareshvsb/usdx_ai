-- ============================================================================
-- USDX AI CMS / Admin Panel — Supabase schema
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> Run
--
-- After running, the admin account is ready:
--   email:    sabareshvsb1@gmail.com
--   password: 12345678
-- Log in at https://<your-app>/admin and change the password immediately.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Admins
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null default 'Administrator',
  role text not null default 'admin' check (role in ('admin', 'editor')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  two_factor_enabled boolean not null default false,
  two_factor_secret text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Admin sessions (server-side, revocable)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  user_agent text,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_admin_id_idx on public.admin_sessions(admin_id);

-- ----------------------------------------------------------------------------
-- CMS sections (independently manageable site sections)
-- ----------------------------------------------------------------------------
create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  "key" text unique not null,
  title text not null,
  heading text not null default '',
  subheading text not null default '',
  body jsonb not null default '[]'::jsonb,
  image_url text not null default '',
  button_text text not null default '',
  button_link text not null default '',
  enabled boolean not null default true,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CMS instructions (title, description, image, date, optional link)
-- ----------------------------------------------------------------------------
create table if not exists public.cms_instructions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text not null default '',
  item_date date,
  link_text text not null default '',
  link_url text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CMS announcements / notices
-- ----------------------------------------------------------------------------
create table if not exists public.cms_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null default '',
  link_text text not null default '',
  link_url text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CMS media library
-- ----------------------------------------------------------------------------
create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  alt_text text not null default '',
  folder text not null default 'uncategorized',
  storage_path text not null,
  url text not null,
  size_bytes bigint not null default 0,
  mime_type text not null default 'image/png',
  width integer,
  height integer,
  is_banner boolean not null default false,
  created_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_media_folder_idx on public.cms_media(folder);

-- ----------------------------------------------------------------------------
-- CMS settings (key/value)
-- ----------------------------------------------------------------------------
create table if not exists public.cms_settings (
  "key" text primary key,
  value jsonb,
  "type" text not null default 'text',
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CMS live leaderboard (participant business-volume rankings)
-- No seed rows on purpose: only real participants added via the Admin Panel
-- should ever appear on the public leaderboard.
-- ----------------------------------------------------------------------------
create table if not exists public.cms_leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_volume numeric not null default 0,
  rank integer not null,
  change_24h numeric not null default 0,
  avatar_url text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  enabled boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_leaderboard_rank_idx on public.cms_leaderboard(rank);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.admins enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_instructions enable row level security;
alter table public.cms_announcements enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_settings enable row level security;
alter table public.cms_leaderboard enable row level security;

-- Anonymous / public users may ONLY READ published content.
drop policy if exists "sections public read" on public.cms_sections;
create policy "sections public read" on public.cms_sections
  for select to anon, authenticated
  using (enabled = true and status = 'published');

drop policy if exists "instructions public read" on public.cms_instructions;
create policy "instructions public read" on public.cms_instructions
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "announcements public read" on public.cms_announcements;
create policy "announcements public read" on public.cms_announcements
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "media public read" on public.cms_media;
create policy "media public read" on public.cms_media
  for select to anon, authenticated
  using (true);

drop policy if exists "settings public read" on public.cms_settings;
create policy "settings public read" on public.cms_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "leaderboard public read" on public.cms_leaderboard;
create policy "leaderboard public read" on public.cms_leaderboard
  for select to anon, authenticated
  using (enabled = true and status = 'published');

-- No policies on admins / admin_sessions => anonymous users get zero rows.
-- All writes happen server-side with the service_role key (bypasses RLS).

-- ============================================================================
-- Seed data
-- ============================================================================

-- Master admin account (password: 12345678 — CHANGE IMMEDIATELY after login)
insert into public.admins (email, password_hash, name, role, status)
values (
  'sabareshvsb1@gmail.com',
  'scrypt$16384$8$1$u1hRvHkF2r1mWMHg5E/a0g==$QUfI1OgL6ucX6S4+d4oQiZLbcoNY3bQiXI8oRcXr/33CdG2WcF0fXZ6rCe84IaSLWmpxW+QkE2dReAXMCeihTw==',
  'Administrator',
  'admin',
  'active'
)
on conflict (email) do nothing;

-- Default sections
insert into public.cms_sections ("key", title, heading, subheading, body, enabled, status, sort_order, published_at)
values
  ('home', 'Home', 'Welcome to USDX AI', 'Live intelligence for USDXSMART, the decentralized stablecoin on Base.', '[{"type":"paragraph","text":"USDX AI brings together real-time pricing, pool analytics, on-chain data and an AI assistant in one dashboard."}]', true, 'published', 0, now()),
  ('about', 'About', 'What is USDXSMART?', 'Unique Smart Contract Decentralized Stable Coin (USDXSMART).', '[{"type":"paragraph","text":"USDXSMART is a decentralized stablecoin running on the Base network. Track price, liquidity and holders from the dashboard."}]', true, 'published', 1, now()),
  ('services', 'Services / Products', 'Ecosystem Services', 'Staking, compounding, wallets and analytics.', '[{"type":"list","items":["Staking with daily rewards","Auto-compounding positions","Wallet management","On-chain analytics"]}]', true, 'published', 2, now()),
  ('instructions', 'Instructions', 'How to get started', 'Step-by-step guides for the USDX ecosystem.', '[]', true, 'published', 3, now()),
  ('announcements', 'Announcements', 'Latest announcements', 'Official notices from the USDX team.', '[]', true, 'published', 4, now()),
  ('gallery', 'Gallery', 'Media & gallery', 'Images and visuals from the ecosystem.', '[]', true, 'published', 5, now()),
  ('contact', 'Contact', 'Contact us', 'Reach the USDX team.', '[{"type":"paragraph","text":"Messages and contact details are managed from the admin panel."}]', true, 'published', 6, now()),
  ('footer', 'Footer', 'USDX AI', 'All system data is for informational purposes only.', '[{"type":"paragraph","text":"© 2026 USDX AI."}]', true, 'published', 7, now())
on conflict ("key") do nothing;

-- Some getting-started instructions
insert into public.cms_instructions (title, description, item_date, link_text, link_url, status, sort_order, published_at)
values
  ('Set up your wallet', 'Connect a supported wallet (e.g. MetaMask) to the Base network to interact with USDXSMART.', '2026-08-01', '', '', 'published', 0, now()),
  ('Acquire USDX', 'Buy USDX on a supported DEX pair or swap USDC/DAI for USDX following the official rules.', '2026-08-02', 'View pair', '/dashboard', 'published', 1, now()),
  ('Start staking', 'Stake your USDX to begin earning daily rewards. Rewards are paid out according to the official compounding schedule.', '2026-08-03', 'Go to staking', '/dashboard?tab=staking', 'published', 2, now())
on conflict do nothing;

-- A welcome announcement
insert into public.cms_announcements (title, message, link_text, link_url, status, sort_order, published_at)
values
  ('Welcome to USDX AI', 'Explore live token intelligence, ask the AI assistant anything, and manage your staking from one dashboard.', 'Explore dashboard', '/dashboard', 'published', 0, now())
on conflict do nothing;

-- Site settings
insert into public.cms_settings ("key", value, "type")
values
  ('site_name', '"USDX AI"', 'text'),
  ('site_tagline', '"Live intelligence for USDXSMART on Base"', 'text'),
  ('contact_email', '"support@usdxai.example"', 'text'),
  ('contact_telegram', '""', 'text'),
  ('contact_x', '""', 'text')
on conflict ("key") do update set value = excluded.value;