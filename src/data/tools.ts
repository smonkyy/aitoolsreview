// ─── Types ────────────────────────────────────────────────────────────────────

export type ToolCategory = 'scrittura' | 'immagini' | 'video' | 'audio' | 'produttivita' | 'coding';
export type PriceRange = 'free' | 'low' | 'mid' | 'high';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'developer';
export type TargetUser = 'beginner' | 'intermediate' | 'advanced' | 'developer' | 'business' | 'creator';

export interface AITool {
  id: string;
  name: string;
  tagline: string;
  category: ToolCategory;
  secondaryCategories?: ToolCategory[];
  pricing: {
    type: 'free' | 'freemium' | 'paid' | 'open-source';
    hasFreeOption: boolean;
    startingPriceUsd: number | null; // per mese, null = gratis
    priceRange: PriceRange;
  };
  targetUsers: TargetUser[];
  ratings: {
    overall: number;       // 0–5
    easeOfUse: number;     // 0–5
    outputQuality: number; // 0–5
    valueForMoney: number; // 0–5
  };
  strengths: string[];
  weaknesses: string[];
  badge?: string;
  link: string; // link interno (recensione o pagina strumenti)
}

// ─── Tool Database ─────────────────────────────────────────────────────────────

export const TOOLS: AITool[] = [

  // ── SCRITTURA ──────────────────────────────────────────────────────────────

  {
    id: 'claude-4',
    name: 'Claude 4',
    tagline: 'Il migliore per ragionamento profondo e scrittura di qualità',
    category: 'scrittura',
    secondaryCategories: ['coding', 'produttivita'],
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['intermediate', 'advanced', 'developer', 'business', 'creator'],
    ratings: {
      overall: 4.9,
      easeOfUse: 4.6,
      outputQuality: 4.9,
      valueForMoney: 4.7,
    },
    strengths: [
      'Piano gratuito disponibile',
      'Qualità di testo eccezionale, tono naturale',
      'Ragionamento su testi lunghi e complessi',
      'Ottimo per editing, riassunti, blog, email',
    ],
    weaknesses: [
      'Limite messaggi sul piano free',
      'Nessuna generazione immagini nativa',
    ],
    badge: 'Top Pick',
    link: '/blog/claude-ai-recensione',
  },

  {
    id: 'chatgpt-4o',
    name: 'ChatGPT-4o',
    tagline: 'Il più versatile, con accesso internet e generazione immagini',
    category: 'scrittura',
    secondaryCategories: ['immagini', 'coding', 'produttivita'],
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'business', 'creator'],
    ratings: {
      overall: 4.7,
      easeOfUse: 4.8,
      outputQuality: 4.6,
      valueForMoney: 4.5,
    },
    strengths: [
      'Piano gratuito generoso',
      'Interfaccia semplicissima, perfetto per iniziare',
      'Accesso internet e immagini DALL-E integrati',
      'Community enorme, tonnellate di risorse online',
    ],
    weaknesses: [
      'Qualità di testo leggermente inferiore a Claude su testi lunghi',
      'Può "allucinare" informazioni',
    ],
    badge: 'Più Usato',
    link: '/blog/chatgpt-vs-claude',
  },

  {
    id: 'jasper-ai',
    name: 'Jasper AI',
    tagline: 'Pensato per il marketing: copy, landing page, campagne',
    category: 'scrittura',
    pricing: {
      type: 'paid',
      hasFreeOption: false,
      startingPriceUsd: 49,
      priceRange: 'mid',
    },
    targetUsers: ['intermediate', 'business', 'creator'],
    ratings: {
      overall: 4.2,
      easeOfUse: 4.3,
      outputQuality: 4.1,
      valueForMoney: 3.6,
    },
    strengths: [
      'Template specifici per marketing e copywriting',
      'Brand voice configurabile',
      'Integrazione con SurferSEO per ottimizzazione',
    ],
    weaknesses: [
      'Costoso: parte da $49/mese',
      'Output a volte ripetitivo senza prompt curati',
      'Overkill per uso personale',
    ],
    badge: 'Marketing',
    link: '/blog/migliori-tool-ai-scrittura',
  },

  {
    id: 'copy-ai',
    name: 'Copy.ai',
    tagline: 'Veloce per headline, post social, varianti di testo',
    category: 'scrittura',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 49,
      priceRange: 'mid',
    },
    targetUsers: ['beginner', 'creator', 'business'],
    ratings: {
      overall: 4.0,
      easeOfUse: 4.5,
      outputQuality: 3.9,
      valueForMoney: 3.8,
    },
    strengths: [
      'Piano gratuito con 2.000 parole/mese',
      'Interfaccia intuitiva, ideale per principianti',
      'Veloce per generare varianti di copy breve',
    ],
    weaknesses: [
      'Qualità inferiore su testi lunghi',
      'Piano free molto limitato',
    ],
    badge: 'Facile',
    link: '/blog/migliori-tool-ai-scrittura',
  },

  {
    id: 'writesonic',
    name: 'Writesonic',
    tagline: 'Ottimizzato per SEO, integra ricerca keyword e generazione',
    category: 'scrittura',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['intermediate', 'business', 'creator'],
    ratings: {
      overall: 4.1,
      easeOfUse: 4.2,
      outputQuality: 4.0,
      valueForMoney: 4.1,
    },
    strengths: [
      'Funzionalità SEO integrate (ottimizzazione articoli)',
      'Prezzi accessibili rispetto a Jasper',
      'Chatbot con accesso internet incluso',
    ],
    weaknesses: [
      'Meno creativo di Claude su testi narrativi',
      'UI un po\' dispersiva',
    ],
    badge: 'SEO',
    link: '/blog/migliori-tool-ai-scrittura',
  },

  {
    id: 'perplexity-ai',
    name: 'Perplexity AI',
    tagline: 'Motore di ricerca AI con fonti citate in tempo reale',
    category: 'produttivita',
    secondaryCategories: ['scrittura'],
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['intermediate', 'advanced', 'business'],
    ratings: {
      overall: 4.5,
      easeOfUse: 4.6,
      outputQuality: 4.4,
      valueForMoney: 4.5,
    },
    strengths: [
      'Risponde con fonti citate, riducendo le allucinazioni',
      'Ottimo per ricerca e fact-checking rapido',
      'Piano gratuito generoso',
    ],
    weaknesses: [
      'Non adatto per scrittura creativa',
      'Output meno elaborato rispetto a Claude/ChatGPT',
    ],
    badge: 'Research',
    link: '/strumenti#produttivita',
  },

  // ── IMMAGINI ───────────────────────────────────────────────────────────────

  {
    id: 'midjourney',
    name: 'Midjourney',
    tagline: 'La qualità cinematografica più alta disponibile oggi',
    category: 'immagini',
    pricing: {
      type: 'paid',
      hasFreeOption: false,
      startingPriceUsd: 10,
      priceRange: 'low',
    },
    targetUsers: ['intermediate', 'advanced', 'creator', 'business'],
    ratings: {
      overall: 4.9,
      easeOfUse: 3.8,
      outputQuality: 5.0,
      valueForMoney: 4.6,
    },
    strengths: [
      'Qualità visiva imbattibile, lo standard del settore',
      'Stile artistico e coerenza estetica superiori',
      'Ottimo rapporto qualità/prezzo a $10/mese',
    ],
    weaknesses: [
      'Nessun piano gratuito',
      'Curva di apprendimento per i prompt',
      'Solo via Discord (nessuna app dedicata)',
    ],
    badge: 'Qualità Pro',
    link: '/blog/midjourney-recensione',
  },

  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    tagline: 'AI generativa integrata in Photoshop e Creative Cloud',
    category: 'immagini',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 5,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'creator', 'business'],
    ratings: {
      overall: 4.3,
      easeOfUse: 4.6,
      outputQuality: 4.2,
      valueForMoney: 4.3,
    },
    strengths: [
      'Perfettamente integrato in Photoshop e Illustrator',
      'Addestrato su immagini con licenza — zero problemi copyright',
      'Crediti gratuiti mensili disponibili',
    ],
    weaknesses: [
      'Qualità inferiore a Midjourney su fotorealismo',
      'Richiede abbonamento Adobe per uso avanzato',
    ],
    badge: 'Adobe',
    link: '/strumenti#immagini',
  },

  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    tagline: 'Generazione immagini integrata in ChatGPT Plus',
    category: 'immagini',
    pricing: {
      type: 'paid',
      hasFreeOption: false,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'creator'],
    ratings: {
      overall: 4.1,
      easeOfUse: 4.9,
      outputQuality: 4.0,
      valueForMoney: 4.0,
    },
    strengths: [
      'Facilissimo: basta scrivere in italiano in ChatGPT',
      'Incluso nel piano ChatGPT Plus ($20/mo)',
      'Ottimo per illustrazioni e immagini concettuali',
    ],
    weaknesses: [
      'Qualità inferiore a Midjourney su fotorealismo e arte',
      'Nessun controllo fine sullo stile',
    ],
    badge: 'Facile',
    link: '/strumenti#immagini',
  },

  {
    id: 'leonardo-ai',
    name: 'Leonardo.ai',
    tagline: 'Ottimo compromesso tra potenza e facilità, crediti gratuiti generosi',
    category: 'immagini',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 12,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'creator'],
    ratings: {
      overall: 4.3,
      easeOfUse: 4.4,
      outputQuality: 4.2,
      valueForMoney: 4.5,
    },
    strengths: [
      'Piano gratuito con 150 token/giorno',
      'Modelli specializzati per gaming, concept art, prodotti',
      'Interfaccia web semplice, nessun Discord richiesto',
    ],
    weaknesses: [
      'Qualità inferiore a Midjourney su fotorealismo estremo',
      'Curva di apprendimento per i modelli avanzati',
    ],
    badge: 'Best Free',
    link: '/strumenti#immagini',
  },

  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    tagline: 'Open source, gratuito, controllo totale — se sai cosa fai',
    category: 'immagini',
    pricing: {
      type: 'open-source',
      hasFreeOption: true,
      startingPriceUsd: 0,
      priceRange: 'free',
    },
    targetUsers: ['advanced', 'developer'],
    ratings: {
      overall: 4.2,
      easeOfUse: 2.5,
      outputQuality: 4.4,
      valueForMoney: 5.0,
    },
    strengths: [
      'Completamente gratuito, gira in locale',
      'Massima flessibilità: modelli, LoRA, ControlNet',
      'Nessun limite di generazione',
    ],
    weaknesses: [
      'Setup complesso, richiede GPU dedicata',
      'Non adatto a principianti',
      'Nessun supporto ufficiale',
    ],
    badge: 'Open Source',
    link: '/strumenti#immagini',
  },

  // ── VIDEO ──────────────────────────────────────────────────────────────────

  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    tagline: 'Il riferimento professionale per la generazione video AI',
    category: 'video',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 15,
      priceRange: 'low',
    },
    targetUsers: ['intermediate', 'advanced', 'creator', 'business'],
    ratings: {
      overall: 4.7,
      easeOfUse: 4.1,
      outputQuality: 4.8,
      valueForMoney: 4.2,
    },
    strengths: [
      'Qualità video più alta disponibile oggi',
      'Controllo avanzato su motion, camera, stile',
      'Usato in produzioni professionali reali',
    ],
    weaknesses: [
      'Costo elevato per uso intenso (crediti)',
      'Genera video brevi (max ~10 secondi)',
    ],
    badge: 'Innovativo',
    link: '/strumenti#video',
  },

  {
    id: 'kling-ai',
    name: 'Kling AI',
    tagline: 'La sorpresa cinese che sfida Runway a prezzo molto più basso',
    category: 'video',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 10,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'creator'],
    ratings: {
      overall: 4.4,
      easeOfUse: 4.3,
      outputQuality: 4.4,
      valueForMoney: 4.7,
    },
    strengths: [
      'Piano gratuito con crediti giornalieri',
      'Qualità paragonabile a Runway a metà prezzo',
      'Genera video fino a 2 minuti (raro nel settore)',
    ],
    weaknesses: [
      'Tempi di generazione a volte lunghi sul free',
      'Community e documentazione più limitate',
    ],
    badge: 'Rising Star',
    link: '/strumenti#video',
  },

  {
    id: 'heygen',
    name: 'HeyGen',
    tagline: 'Avatar AI per video presentazioni, corporate, e-learning',
    category: 'video',
    pricing: {
      type: 'paid',
      hasFreeOption: false,
      startingPriceUsd: 29,
      priceRange: 'mid',
    },
    targetUsers: ['business', 'creator', 'intermediate'],
    ratings: {
      overall: 4.5,
      easeOfUse: 4.6,
      outputQuality: 4.4,
      valueForMoney: 4.1,
    },
    strengths: [
      'Avatar realistici che parlano il tuo script',
      'Traduzione automatica video in 40+ lingue',
      'Perfetto per onboarding aziendale e corsi online',
    ],
    weaknesses: [
      'Nessun piano gratuito',
      'Limitato a video con avatar (non generativo)',
    ],
    badge: 'Business',
    link: '/strumenti#video',
  },

  // ── AUDIO ──────────────────────────────────────────────────────────────────

  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    tagline: 'La voce AI più realistica esistente — impressionante',
    category: 'audio',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 22,
      priceRange: 'mid',
    },
    targetUsers: ['intermediate', 'creator', 'business', 'developer'],
    ratings: {
      overall: 4.8,
      easeOfUse: 4.5,
      outputQuality: 5.0,
      valueForMoney: 4.3,
    },
    strengths: [
      '10.000 caratteri gratuiti/mese sul free',
      'Clonazione vocale da pochi secondi di audio',
      'Qualità emozioni e intonazione imbattibile',
    ],
    weaknesses: [
      'Può essere costoso per volumi alti',
      'Clonazione vocale richiede piano a pagamento',
    ],
    badge: 'Best in Class',
    link: '/strumenti#audio',
  },

  {
    id: 'whisper',
    name: 'Whisper (OpenAI)',
    tagline: 'Trascrizione audio precisa e gratuita di OpenAI',
    category: 'audio',
    pricing: {
      type: 'open-source',
      hasFreeOption: true,
      startingPriceUsd: 0,
      priceRange: 'free',
    },
    targetUsers: ['developer', 'intermediate', 'advanced'],
    ratings: {
      overall: 4.6,
      easeOfUse: 3.2,
      outputQuality: 4.7,
      valueForMoney: 5.0,
    },
    strengths: [
      'Completamente gratuito (open source)',
      'Altissima precisione su accenti e lingue diverse',
      'Supporta l\'italiano nativamente',
    ],
    weaknesses: [
      'Richiede competenze tecniche per l\'installazione',
      'Nessuna interfaccia grafica nativa',
    ],
    badge: 'Gratuito',
    link: '/strumenti#audio',
  },

  // ── PRODUTTIVITÀ ───────────────────────────────────────────────────────────

  {
    id: 'notion-ai',
    name: 'Notion AI',
    tagline: 'AI integrata nel tuo workspace per note, riassunti, brainstorming',
    category: 'produttivita',
    pricing: {
      type: 'paid',
      hasFreeOption: false,
      startingPriceUsd: 10,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'business'],
    ratings: {
      overall: 4.3,
      easeOfUse: 4.7,
      outputQuality: 4.1,
      valueForMoney: 4.2,
    },
    strengths: [
      'Perfettamente integrato in Notion (zero switching)',
      'Ottimo per riassumere documenti, generare task, brainstorming',
      'Nessuna curva di apprendimento se usi già Notion',
    ],
    weaknesses: [
      'Utile solo se già usi Notion',
      'Qualità AI inferiore a Claude/ChatGPT standalone',
    ],
    badge: 'All-in-One',
    link: '/strumenti#produttivita',
  },

  {
    id: 'make',
    name: 'Make (ex Integromat)',
    tagline: 'Automazioni potenti no-code, il migliore per workflow complessi',
    category: 'produttivita',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 9,
      priceRange: 'low',
    },
    targetUsers: ['intermediate', 'advanced', 'business', 'developer'],
    ratings: {
      overall: 4.6,
      easeOfUse: 3.9,
      outputQuality: 4.5,
      valueForMoney: 4.7,
    },
    strengths: [
      'Piano gratuito con 1.000 operazioni/mese',
      'Molto più potente di Zapier per workflow complessi',
      'Visuale e flessibile, migliaia di integrazioni AI',
    ],
    weaknesses: [
      'Curva di apprendimento più alta di Zapier',
      'Documentazione migliorabile',
    ],
    badge: 'Potente',
    link: '/strumenti#produttivita',
  },

  {
    id: 'zapier',
    name: 'Zapier AI',
    tagline: 'Connette tutto con tutto — il più semplice da usare',
    category: 'produttivita',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'intermediate', 'business'],
    ratings: {
      overall: 4.3,
      easeOfUse: 4.8,
      outputQuality: 4.1,
      valueForMoney: 3.9,
    },
    strengths: [
      'Facilissimo da configurare, anche senza tecnici',
      '6.000+ integrazioni disponibili',
      'Piano gratuito per workflow semplici',
    ],
    weaknesses: [
      'Più costoso di Make per volumi alti',
      'Meno flessibile su logiche complesse',
    ],
    badge: 'Facile',
    link: '/strumenti#produttivita',
  },

  // ── CODING ─────────────────────────────────────────────────────────────────

  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    tagline: 'Il riferimento per autocompletamento intelligente nel codice',
    category: 'coding',
    pricing: {
      type: 'paid',
      hasFreeOption: false,
      startingPriceUsd: 10,
      priceRange: 'low',
    },
    targetUsers: ['developer', 'intermediate', 'advanced'],
    ratings: {
      overall: 4.5,
      easeOfUse: 4.7,
      outputQuality: 4.4,
      valueForMoney: 4.5,
    },
    strengths: [
      'Integrazione nativa in VS Code e JetBrains',
      'Suggerimenti inline in tempo reale',
      'Ottimo su linguaggi comuni (Python, JS, TypeScript)',
    ],
    weaknesses: [
      'Nessun piano gratuito (eccetto studenti)',
      'Meno utile per spiegare e debuggare logica complessa',
    ],
    badge: 'Standard Dev',
    link: '/strumenti#coding',
  },

  {
    id: 'cursor',
    name: 'Cursor',
    tagline: "L'editor AI che molti dev stanno adottando nel 2026",
    category: 'coding',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['developer', 'intermediate', 'advanced'],
    ratings: {
      overall: 4.7,
      easeOfUse: 4.5,
      outputQuality: 4.8,
      valueForMoney: 4.4,
    },
    strengths: [
      'Piano gratuito disponibile',
      'Modifica intere porzioni di codice con un prompt',
      'Chat contestuale sul progetto intero (non solo file)',
      'Supporta Claude 4 e GPT-4o come backend',
    ],
    weaknesses: [
      'Editor separato — devi migrare da VS Code',
      'Alcune funzionalità avanzate solo su Pro',
    ],
    badge: 'Editor AI',
    link: '/strumenti#coding',
  },

  {
    id: 'replit-ai',
    name: 'Replit AI',
    tagline: 'Ambiente completo nel browser per imparare a programmare',
    category: 'coding',
    pricing: {
      type: 'freemium',
      hasFreeOption: true,
      startingPriceUsd: 20,
      priceRange: 'low',
    },
    targetUsers: ['beginner', 'developer'],
    ratings: {
      overall: 4.1,
      easeOfUse: 4.8,
      outputQuality: 4.0,
      valueForMoney: 4.2,
    },
    strengths: [
      'Tutto nel browser, zero configurazione',
      'Perfetto per imparare a programmare con AI',
      'Deploy automatico incluso',
    ],
    weaknesses: [
      'Meno potente di Cursor/Copilot per progetti grandi',
      'Performance limitate sul piano free',
    ],
    badge: 'Per Imparare',
    link: '/strumenti#coding',
  },
];
