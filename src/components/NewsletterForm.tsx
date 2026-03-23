/**
 * NewsletterForm — client-side React component
 *
 * Submits email to Supabase `newsletter_subscribers` table using the public
 * anon key (same pattern as analytics.ts). Supabase RLS must allow INSERT
 * with the anon role and block everything else.
 *
 * Supabase setup (run once in SQL editor):
 * ─────────────────────────────────────────
 * create table if not exists newsletter_subscribers (
 *   id            uuid primary key default gen_random_uuid(),
 *   email         text not null unique,
 *   subscribed_at timestamptz not null default now()
 * );
 *
 * alter table newsletter_subscribers enable row level security;
 *
 * create policy "allow anon insert"
 *   on newsletter_subscribers for insert
 *   to anon with check (true);
 * ─────────────────────────────────────────
 *
 * Resend connection (no code needed):
 *   Supabase Dashboard → Database → Webhooks → New webhook
 *   Table: newsletter_subscribers · Event: INSERT
 *   URL: https://api.resend.com/audiences/{AUDIENCE_ID}/contacts
 *   Headers: Authorization: Bearer {RESEND_API_KEY}
 *   Payload: { "email": "{{record.email}}" }
 */

import { useState } from 'react';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

type State = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === 'loading') return;

    setState('loading');

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setState('error');
      return;
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok || res.status === 201) {
        setState('success');
        setEmail('');
      } else if (res.status === 409 || res.status === 422) {
        // 409 = unique violation (already subscribed)
        setState('duplicate');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="mt-12 p-6 rounded-2xl border text-center
        bg-gradient-to-br from-ai-green/10 to-transparent border-ai-green/30">
        <p className="font-bold text-ai-green text-base mb-1">Iscrizione confermata.</p>
        <p className="text-sm text-ai-muted">
          Ti avviseremo quando pubblichiamo nuove recensioni o guide.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 p-6 sm:p-8 rounded-2xl border
      bg-light-card dark:bg-ai-card border-light-border dark:border-ai-border">

      <p className="text-xs font-semibold uppercase tracking-widest text-ai-purple mb-2">
        Newsletter
      </p>
      <h2 className="text-xl font-extrabold text-light-text dark:text-ai-text mb-1">
        Nuove recensioni, direttamente in inbox
      </h2>
      <p className="text-sm text-light-muted dark:text-ai-muted mb-5 leading-relaxed">
        Niente spam. Solo quando esce qualcosa che vale la pena leggere.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="la-tua@email.it"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state === 'loading'}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm
            bg-light-bg dark:bg-ai-bg
            border-light-border dark:border-ai-border
            text-light-text dark:text-ai-text
            placeholder:text-light-faint dark:placeholder:text-ai-faint
            focus:outline-none focus:ring-2 focus:ring-ai-purple/50
            disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-5 py-2.5 rounded-xl bg-ai-purple hover:bg-ai-purple-dark
            text-white font-bold text-sm transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {state === 'loading' ? 'Iscrizione...' : 'Iscriviti'}
        </button>
      </form>

      {state === 'duplicate' && (
        <p className="mt-3 text-xs text-amber-400">
          Questa email e' gia' iscritta.
        </p>
      )}
      {state === 'error' && (
        <p className="mt-3 text-xs text-red-400">
          Qualcosa e' andato storto. Riprova tra qualche secondo.
        </p>
      )}
    </div>
  );
}
