import { useState, useEffect, useRef, useCallback } from 'react'
import { getSearchIndex, expandQuery, oramaSearch, TOOLS } from '../lib/search-index'
import type { AITool } from '../data/tools'

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'scrittura',    icon: '✍️',  label: 'Scrittura',     border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'immagini',     icon: '🎨',  label: 'Immagini',      border: 'border-pink-500/40',   text: 'text-pink-400',   bg: 'bg-pink-500/10' },
  { id: 'video',        icon: '🎬',  label: 'Video',         border: 'border-red-500/40',    text: 'text-red-400',    bg: 'bg-red-500/10' },
  { id: 'audio',        icon: '🎙️', label: 'Audio',         border: 'border-amber-500/40',  text: 'text-amber-400',  bg: 'bg-amber-500/10' },
  { id: 'produttivita', icon: '⚡',  label: 'Produttività',  border: 'border-green-500/40',  text: 'text-green-400',  bg: 'bg-green-500/10' },
  { id: 'coding',       icon: '💻',  label: 'Coding',        border: 'border-blue-500/40',   text: 'text-blue-400',   bg: 'bg-blue-500/10' },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, typeof CATEGORIES[number]>

const PRICE_FILTERS = [
  { id: 'free',         label: '🆓 Solo free',    activeClass: 'bg-green-500 text-white border-green-500' },
  { id: 'freemium',     label: '↑ Freemium',      activeClass: 'bg-ai-purple text-white border-ai-purple' },
  { id: 'paid',         label: '💳 A pagamento',  activeClass: 'bg-ai-purple text-white border-ai-purple' },
  { id: 'open-source',  label: '🔓 Open Source',  activeClass: 'bg-amber-500 text-white border-amber-500' },
] as const

// ─── Pill button helper ───────────────────────────────────────────────────────

function Pill({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean
  activeClass: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap
        ${active
          ? activeClass
          : 'text-light-muted dark:text-ai-muted border-light-border dark:border-ai-border hover:border-ai-purple hover:text-ai-purple dark:hover:border-ai-purple dark:hover:text-ai-purple'
        }`}
    >
      {children}
    </button>
  )
}

// ─── Tool card ────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: AITool }) {
  const cat = CAT_MAP[tool.category as CategoryId]
  const priceLabel =
    tool.pricing.type === 'free'        ? 'Gratuito'
    : tool.pricing.type === 'freemium'  ? `Gratis + €${tool.pricing.startingPriceEur}/mese`
    : tool.pricing.type === 'open-source' ? 'Open Source'
    : tool.pricing.startingPriceEur     ? `Da €${tool.pricing.startingPriceEur}/mese`
    : 'A pagamento'

  const stars = Math.round(tool.ratings.overall * 2) / 2

  return (
    <a
      href={tool.affiliateUrl ?? tool.link}
      target={tool.affiliateUrl ? '_blank' : undefined}
      rel={tool.affiliateUrl ? 'noopener noreferrer' : undefined}
      className={`group flex flex-col p-5 rounded-xl border transition-all duration-150 no-underline
        bg-light-card dark:bg-ai-card
        ${cat ? cat.border : 'border-light-border dark:border-ai-border'}
        hover:shadow-lg hover:-translate-y-0.5`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <strong className="block font-bold text-light-text dark:text-ai-text group-hover:text-ai-purple transition-colors duration-150 truncate">
            {tool.name}
          </strong>
          {cat && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${cat.text}`}>
              {cat.icon} {cat.label}
            </span>
          )}
        </div>
        {tool.badge && (
          <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full border font-semibold
            ${cat ? `${cat.bg} ${cat.text} ${cat.border}` : 'bg-ai-purple/10 text-ai-purple border-ai-purple/20'}`}>
            {tool.badge}
          </span>
        )}
      </div>

      {/* Tagline */}
      <p className="text-sm text-light-muted dark:text-ai-muted leading-relaxed flex-1 mb-3">
        {tool.tagline}
      </p>

      {/* Footer row: rating + price */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-light-border dark:border-ai-border">
        <span className="text-amber-400 text-sm font-semibold tabular-nums">
          {'★'.repeat(Math.floor(stars))}{'☆'.repeat(5 - Math.floor(stars))}
          {' '}<span className="text-light-muted dark:text-ai-muted font-normal">{tool.ratings.overall.toFixed(1)}</span>
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${tool.pricing.hasFreeOption
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-light-bg2 dark:bg-ai-bg2 text-light-muted dark:text-ai-muted border border-light-border dark:border-ai-border'
          }`}>
          {priceLabel}
        </span>
      </div>

      <div className="mt-2 text-xs text-ai-purple font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {tool.affiliateUrl ? 'Visita il sito →' : 'Leggi la recensione →'}
      </div>
    </a>
  )
}

// ─── Grouped results (default view) ──────────────────────────────────────────

function GroupedResults({ tools }: { tools: AITool[] }) {
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    tools: tools.filter((t) => t.category === cat.id),
  })).filter((g) => g.tools.length > 0)

  return (
    <div className="space-y-12">
      {grouped.map((cat) => (
        <section key={cat.id} id={cat.id}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{cat.icon}</span>
            <h2 className={`text-xl font-extrabold text-light-text dark:text-ai-text`}>
              {cat.label}
              <span className={`ml-2 text-sm font-medium ${cat.text}`}>
                {cat.tools.length} tool
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cat.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ToolSearch() {
  const [query,          setQuery]          = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [activePrice,    setActivePrice]    = useState<string>('')
  const [hasFreeOnly,    setHasFreeOnly]    = useState(false)
  const [minRating,      setMinRating]      = useState<number | null>(null)
  const [results,        setResults]        = useState<AITool[]>(TOOLS)
  const [loading,        setLoading]        = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // ── Restore state from URL on mount ────────────────────────────────────────
  useEffect(() => {
    const p  = new URLSearchParams(window.location.search)
    const q  = p.get('q')      ?? ''
    const c  = p.get('cat')    ?? ''
    const pr = p.get('price')  ?? ''
    const fr = p.get('free')   === '1'
    const rt = p.get('rating') ? Number(p.get('rating')) : null

    if (q)  setQuery(q)
    if (c)  setActiveCategory(c)
    if (pr) setActivePrice(pr)
    if (fr) setHasFreeOnly(fr)
    if (rt) setMinRating(rt)
  }, [])

  // ── Debounced search ────────────────────────────────────────────────────────
  const runSearch = useCallback(async (
    q:    string,
    cat:  string,
    price: string,
    free: boolean,
    rating: number | null,
  ) => {
    setLoading(true)

    // 1. Facet filter on TOOLS (pure JS, instant)
    const pool = TOOLS.filter((t) => {
      if (cat   && t.category        !== cat)   return false
      if (price && t.pricing.type    !== price)  return false
      if (free  && !t.pricing.hasFreeOption)     return false
      if (rating && t.ratings.overall < rating)  return false
      return true
    })

    // 2. If no text query → return grouped pool
    if (!q.trim()) {
      setResults(pool)
      setLoading(false)
      syncURL(q, cat, price, free, rating)
      return
    }

    // 3. Expand query with synonyms, then search with Orama
    const expanded = expandQuery(q)
    const db = await getSearchIndex()

    const { hits } = await oramaSearch(db, {
      term:       expanded,
      properties: ['name', 'tagline', 'keywords'],
      boost:      { name: 3, tagline: 2, keywords: 1 },
      tolerance:  1,
      limit:      50,
    }) as { hits: Array<{ id: string; score: number; document: { id: string } }> }

    const hitIds  = new Set(hits.map((h) => h.document.id))
    const scoreOf = new Map(hits.map((h) => [h.document.id, h.score]))

    const filtered = pool
      .filter((t) => hitIds.has(t.id))
      .sort((a, b) => (scoreOf.get(b.id) ?? 0) - (scoreOf.get(a.id) ?? 0))

    setResults(filtered)
    setLoading(false)
    syncURL(q, cat, price, free, rating)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(
      () => runSearch(query, activeCategory, activePrice, hasFreeOnly, minRating),
      180,
    )
    return () => clearTimeout(debounceRef.current)
  }, [query, activeCategory, activePrice, hasFreeOnly, minRating, runSearch])

  function syncURL(q: string, cat: string, price: string, free: boolean, rating: number | null) {
    const p = new URLSearchParams()
    if (q)      p.set('q',      q)
    if (cat)    p.set('cat',    cat)
    if (price)  p.set('price',  price)
    if (free)   p.set('free',   '1')
    if (rating) p.set('rating', String(rating))
    const url = p.toString() ? `?${p.toString()}` : window.location.pathname
    window.history.replaceState(null, '', url)
  }

  function clearAll() {
    setQuery(''); setActiveCategory(''); setActivePrice('')
    setHasFreeOnly(false); setMinRating(null)
    window.history.replaceState(null, '', window.location.pathname)
  }

  const isFiltered = !!(query || activeCategory || activePrice || hasFreeOnly || minRating)
  const activeFilterCount = [activeCategory, activePrice, hasFreeOnly, minRating].filter(Boolean).length

  // ── Render ──────────────────────────────────────────────────────────────────

  // Problem-based quick queries — first person, maps to synonyms in search index
  const PROBLEMS = [
    { label: '📧 Scrivo email',        query: 'email scrittura testi' },
    { label: '🎬 Faccio video',        query: 'video animazione' },
    { label: '📊 Analizzo dati',       query: 'produttivita workflow analisi' },
    { label: '🎨 Genero immagini',     query: 'immagini grafica disegno' },
    { label: '💻 Scrivo codice',       query: 'coding programmazione sviluppo' },
    { label: '🎙️ Clono la mia voce',  query: 'voce clonazione audio tts' },
  ] as const

  return (
    <div>
      {/* ── Problem chips ──────────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-light-muted dark:text-ai-muted mb-2 uppercase tracking-wide">
          Cosa vuoi fare?
        </p>
        <div className="flex flex-wrap gap-2">
          {PROBLEMS.map((p) => (
            <button
              key={p.query}
              onClick={() => { setQuery(p.query); setActiveCategory(''); setActivePrice(''); setHasFreeOnly(false); setMinRating(null); }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                ${query === p.query
                  ? 'bg-ai-purple text-white border-ai-purple'
                  : 'text-light-muted dark:text-ai-muted border-light-border dark:border-ai-border hover:border-ai-purple hover:text-ai-purple dark:hover:border-ai-purple dark:hover:text-ai-purple bg-light-card dark:bg-ai-card'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="relative mb-5">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-light-muted dark:text-ai-muted"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Oppure scrivi: "scrivo email", "faccio video", "analizzo dati"…'
          aria-label="Cerca strumenti AI"
          className="w-full py-3.5 pl-11 pr-4 rounded-2xl border text-base
            bg-light-card dark:bg-ai-card
            border-light-border dark:border-ai-border
            text-light-text dark:text-ai-text
            placeholder:text-light-faint dark:placeholder:text-ai-faint
            focus:outline-none focus:border-ai-purple focus:ring-2 focus:ring-ai-purple/20
            transition-all duration-150"
        />
        {loading && (
          <div
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2
              w-4 h-4 border-2 border-ai-purple border-t-transparent rounded-full animate-spin"
            aria-label="Ricerca in corso"
          />
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtri">

        {/* Category pills */}
        {CATEGORIES.map((cat) => (
          <Pill
            key={cat.id}
            active={activeCategory === cat.id}
            activeClass={`${cat.bg} ${cat.text} ${cat.border}`}
            onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
          >
            {cat.icon} {cat.label}
          </Pill>
        ))}

        {/* Divider (visual only) */}
        <span className="hidden sm:block self-center h-4 w-px bg-light-border dark:bg-ai-border" aria-hidden="true" />

        {/* Solo gratuiti toggle */}
        <Pill
          active={hasFreeOnly}
          activeClass="bg-green-500 text-white border-green-500"
          onClick={() => setHasFreeOnly(!hasFreeOnly)}
        >
          🆓 Solo gratuiti
        </Pill>

        {/* Price type filters */}
        {PRICE_FILTERS.filter((p) => p.id !== 'free').map((pf) => (
          <Pill
            key={pf.id}
            active={activePrice === pf.id}
            activeClass={pf.activeClass}
            onClick={() => setActivePrice(activePrice === pf.id ? '' : pf.id)}
          >
            {pf.label}
          </Pill>
        ))}

        {/* Min rating */}
        <Pill
          active={minRating === 4.5}
          activeClass="bg-amber-500 text-white border-amber-500"
          onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
        >
          ⭐ 4.5+
        </Pill>

        {/* Clear all */}
        {isFiltered && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-full text-sm font-medium border
              border-red-500/30 text-red-400
              hover:bg-red-500/10 hover:border-red-500/60
              transition-all duration-150"
          >
            ✕ Azzera{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-sm text-light-muted dark:text-ai-muted mb-6">
        {isFiltered
          ? <><strong className="text-light-text dark:text-ai-text">{results.length}</strong> strument{results.length === 1 ? 'o' : 'i'} trovati</>
          : <><strong className="text-light-text dark:text-ai-text">{results.length}</strong> strumenti nel database</>
        }
        {query && !loading && results.length > 0 && (
          <span className="ml-2 text-ai-purple text-xs">
            — ricerca semantica attiva
          </span>
        )}
      </p>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {results.length === 0 ? (
        /* Empty state */
        <div className="py-16 text-center">
          <p className="text-5xl mb-4" aria-hidden="true">🔍</p>
          <p className="font-bold text-light-text dark:text-ai-text mb-2">Nessun risultato trovato</p>
          <p className="text-sm text-light-muted dark:text-ai-muted">
            Prova con un termine diverso oppure{' '}
            <button onClick={clearAll} className="text-ai-purple underline hover:no-underline">
              azzera i filtri
            </button>
            .
          </p>
          {query && (
            <p className="text-xs text-light-faint dark:text-ai-faint mt-3">
              Suggerimento: prova "immagini" invece di "disegno", oppure "coding" invece di "programmazione"
            </p>
          )}
        </div>
      ) : isFiltered && query.trim() ? (
        /* Flat ranked results (text search active) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        /* Grouped by category (default / filter-only view) */
        <GroupedResults tools={results} />
      )}
    </div>
  )
}
