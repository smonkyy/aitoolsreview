-- ============================================================
-- AI Tools Review — Analytics Schema (Supabase / PostgreSQL)
-- ============================================================
--
-- Setup steps:
--  1. Run this script in the Supabase SQL editor (or via CLI)
--  2. Enable Row Level Security (already done below)
--  3. Set env vars in your deploy environment:
--       SUPABASE_URL          → Project URL (server-side only)
--       SUPABASE_ANON_KEY     → Anon/public key (server-side only)
--       PUBLIC_SUPABASE_URL   → Same project URL (client-side)
--       PUBLIC_SUPABASE_ANON_KEY → Same anon key (client-side)
-- ============================================================


-- ── Raw events ────────────────────────────────────────────────────────────────

create table if not exists events (
  id          uuid        default gen_random_uuid() primary key,
  event_type  text        not null,
  -- 'page_view' | 'comparison_view' | 'cta_click' | 'tool_click' | 'advisor_complete' | 'comparison_pick'
  slug        text,       -- comparison slug (e.g. "claude-4-vs-chatgpt-4o") or page path
  tool_a      text,       -- primary tool ID
  tool_b      text,       -- secondary tool ID (for comparisons)
  meta        jsonb       default '{}',  -- flexible extra data
  created_at  timestamptz default now()
);

-- Indexes for fast GROUP BY aggregations
create index if not exists events_type_slug_idx  on events (event_type, slug);
create index if not exists events_type_tool_idx  on events (event_type, tool_a);
create index if not exists events_created_at_idx on events (created_at desc);


-- ── Row Level Security ────────────────────────────────────────────────────────
-- Anonymous inserts allowed (browser tracking), no reads allowed publicly.

alter table events enable row level security;

-- Anyone can INSERT (browser → Supabase)
create policy "anon_insert" on events
  for insert to anon
  with check (true);

-- Only authenticated service role can SELECT (your build server)
create policy "service_select" on events
  for select to authenticated
  using (true);


-- ── Aggregated views ──────────────────────────────────────────────────────────

-- Overall comparison performance (all time)
create or replace view comparison_stats as
select
  slug,
  count(*) filter (where event_type = 'comparison_view')  as views,
  count(*) filter (where event_type = 'cta_click')        as cta_clicks,
  count(*) filter (where event_type = 'tool_click')       as tool_clicks,
  round(
    count(*) filter (where event_type = 'cta_click')::numeric
    / nullif(count(*) filter (where event_type = 'comparison_view'), 0) * 100,
    2
  )                                                        as ctr_pct,
  max(created_at)                                          as last_seen
from events
where slug is not null
group by slug
order by views desc;


-- Trending comparisons — last 7 days (used at build time to boost rankings)
create or replace view trending_comparisons as
select
  slug,
  count(*) as views_7d
from events
where
  event_type = 'comparison_view'
  and created_at >= now() - interval '7 days'
group by slug
order by views_7d desc
limit 20;


-- Per-tool click-through rate (useful for tool detail pages)
create or replace view tool_ctr as
select
  tool_a                                                      as tool_id,
  count(*) filter (where event_type = 'comparison_view')      as comparison_views,
  count(*) filter (where event_type = 'tool_click')           as tool_clicks,
  round(
    count(*) filter (where event_type = 'tool_click')::numeric
    / nullif(count(*) filter (where event_type = 'comparison_view'), 0) * 100,
    2
  )                                                           as ctr_pct
from events
where tool_a is not null
group by tool_a
order by comparison_views desc;


-- Feedback per comparison (thumbs up / down)
create or replace view comparison_feedback as
select
  slug,
  count(*) filter (where event_type = 'feedback_up')   as upvotes,
  count(*) filter (where event_type = 'feedback_down') as downvotes,
  coalesce(
    count(*) filter (where event_type = 'feedback_up')::float
    / nullif(count(*) filter (where event_type in ('feedback_up', 'feedback_down')), 0),
    0.5  -- default neutro se nessun voto
  )                                                     as positive_rate
from events
where event_type in ('feedback_up', 'feedback_down')
  and slug is not null
group by slug
order by (upvotes + downvotes) desc;


-- Advisor funnel — popular category + budget + skill combos
create or replace view advisor_funnels as
select
  meta->>'selections'                                  as selections,
  tool_a                                               as top_recommended_tool,
  count(*)                                             as completions
from events
where event_type = 'advisor_complete'
group by meta->>'selections', tool_a
order by completions desc;
