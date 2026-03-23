import { create, insertMultiple, search as oramaSearch } from '@orama/orama'
import { TOOLS, type AITool } from '../data/tools'

// ─── Synonym map (Italian AI domain) ─────────────────────────────────────────
// Each key is an Italian query term; values expand into indexed keywords.
// Placed here so both the index builder and the query expander share the map.

export const SYNONYMS: Record<string, string[]> = {
  // Immagini
  disegno: ['immagini'],
  disegnare: ['immagini'],
  foto: ['immagini'],
  fotografia: ['immagini'],
  illustrazione: ['immagini'],
  arte: ['immagini'],
  render: ['immagini'],
  rendering: ['immagini'],
  grafica: ['immagini'],
  visual: ['immagini'],
  dipinto: ['immagini'],
  'generare immagini': ['immagini'],
  'generazione immagini': ['immagini'],
  'testo in immagine': ['immagini'],
  avatar: ['immagini', 'video'],

  // Video
  animazione: ['video'],
  clip: ['video'],
  filmato: ['video'],
  montaggio: ['video'],
  reels: ['video'],
  shorts: ['video'],
  motion: ['video'],
  cinema: ['video'],
  film: ['video'],
  'text to video': ['video'],

  // Audio
  voce: ['audio'],
  'sintesi vocale': ['audio'],
  tts: ['audio'],
  trascrizione: ['audio'],
  podcast: ['audio'],
  registrazione: ['audio'],
  doppiaggio: ['audio'],
  musica: ['audio'],
  'speech to text': ['audio'],
  'text to speech': ['audio'],

  // Coding
  codice: ['coding'],
  programmazione: ['coding'],
  sviluppo: ['coding'],
  programmare: ['coding'],
  sviluppatore: ['coding'],
  developer: ['coding'],
  software: ['coding'],
  debug: ['coding'],
  github: ['coding'],
  'intelligenza artificiale per codice': ['coding'],
  autocomplete: ['coding'],

  // Scrittura
  testo: ['scrittura'],
  testi: ['scrittura'],
  articolo: ['scrittura'],
  blog: ['scrittura'],
  email: ['scrittura'],
  copywriting: ['scrittura'],
  contenuti: ['scrittura'],
  newsletter: ['scrittura'],
  copy: ['scrittura'],
  seo: ['scrittura'],
  paragrafo: ['scrittura'],

  // Produttività
  automazione: ['produttivita'],
  workflow: ['produttivita'],
  integrazione: ['produttivita'],
  task: ['produttivita'],
  organizzazione: ['produttivita'],
  meeting: ['produttivita'],
  calendario: ['produttivita'],
  'gestione progetti': ['produttivita'],
  'no-code': ['produttivita'],
  nocode: ['produttivita'],
  zapier: ['produttivita'],

  // Prezzo
  gratis: ['free', 'freemium', 'open-source'],
  gratuito: ['free', 'freemium', 'open-source'],
  gratuiti: ['free', 'freemium', 'open-source'],
  free: ['free', 'freemium'],
  economico: ['freemium', 'low'],
  'open source': ['open-source'],
  opensourcе: ['open-source'],
  abbonamento: ['paid', 'freemium'],
  premium: ['paid'],
}

// Keywords appended to each category's documents for synonym matching at index time
const CATEGORY_SYNONYMS: Record<string, string> = {
  immagini: 'disegno foto fotografia illustrazione arte render grafica dipinto visual generare generazione immagini',
  scrittura: 'testo testi articolo blog email copywriting contenuti newsletter copy seo paragrafo',
  video:     'animazione clip filmato montaggio reels shorts motion cinema avatar presentazione',
  audio:     'voce sintesi tts trascrizione podcast registrazione doppiaggio musica speech',
  produttivita: 'automazione workflow integrazione task organizzazione meeting no-code nocode gestione progetti',
  coding:    'codice programmazione sviluppo developer software debug github autocomplete',
}

const PRICE_SYNONYMS: Record<string, string> = {
  free:          'gratis gratuito libero free senza-costo',
  freemium:      'gratis gratuito free piano-gratuito freemium',
  paid:          'pagamento abbonamento premium a-pagamento',
  'open-source': 'open-source open source github gratuito libero community',
}

// ─── Index document shape ────────────────────────────────────────────────────

type SearchDoc = {
  id:            string
  name:          string
  tagline:       string
  keywords:      string
  category:      string
  pricingType:   string
  hasFreeOption: string  // stringified boolean (Orama string filter)
  priceRange:    string
  rating:        number
}

// ─── Singleton index ─────────────────────────────────────────────────────────

type OramaDB = Awaited<ReturnType<typeof create>>
let _db: OramaDB | null = null

export async function getSearchIndex(): Promise<OramaDB> {
  if (_db) return _db

  _db = await create({
    schema: {
      id:            'string',
      name:          'string',
      tagline:       'string',
      keywords:      'string',
      category:      'string',
      pricingType:   'string',
      hasFreeOption: 'string',
      priceRange:    'string',
      rating:        'number',
    } as const,
  })

  const docs: SearchDoc[] = TOOLS.map((tool) => ({
    id:            tool.id,
    name:          tool.name,
    tagline:       tool.tagline,
    keywords:      buildKeywords(tool),
    category:      tool.category,
    pricingType:   tool.pricing.type,
    hasFreeOption: String(tool.pricing.hasFreeOption),
    priceRange:    tool.pricing.priceRange,
    rating:        tool.ratings.overall,
  }))

  await insertMultiple(_db, docs)
  return _db
}

function buildKeywords(tool: AITool): string {
  const parts: string[] = [
    tool.name,
    tool.tagline,
    tool.category,
    CATEGORY_SYNONYMS[tool.category] ?? '',
    PRICE_SYNONYMS[tool.pricing.type] ?? '',
    ...tool.strengths,
    tool.badge ?? '',
    // secondary categories
    ...(tool.secondaryCategories ?? []).map((c) => CATEGORY_SYNONYMS[c] ?? ''),
  ]
  return parts.filter(Boolean).join(' ')
}

// ─── Query expansion ─────────────────────────────────────────────────────────

/** Expands a raw user query with known Italian synonyms before sending to Orama */
export function expandQuery(raw: string): string {
  const tokens = raw.toLowerCase().trim().split(/\s+/)
  const extra: string[] = []
  tokens.forEach((t) => {
    const syns = SYNONYMS[t]
    if (syns) extra.push(...syns)
  })
  return [...tokens, ...extra].join(' ')
}

// Re-export TOOLS so the component only needs one import
export { TOOLS, oramaSearch }
export type { AITool }
