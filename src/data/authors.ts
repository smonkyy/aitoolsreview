// ─── Author database ──────────────────────────────────────────────────────────
// Used to populate the AuthorBox component and Article/Review JSON-LD schema.
// All data is public-facing and contributes to Google's E-E-A-T signals.

export interface Author {
  id: string
  name: string
  role: string
  bio: string
  /** Area di expertise — shown as chips */
  expertise: string[]
  /** Numero di tool recensiti — E-E-A-T quantitative signal */
  toolsReviewed: number
  /** Anni di esperienza nel settore AI */
  yearsExp: number
  /** Iniziale per l'avatar (default: prima lettera del nome) */
  initial?: string
  /** Colore avatar (Tailwind gradient classes) */
  avatarGradient?: string
  /** Link profilo opzionali */
  social?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  /** Schema.org Person @id */
  schemaId: string
  /** knowsAbout per Schema.org — inglese per compatibilità */
  knowsAbout: string[]
}

export const AUTHORS: Record<string, Author> = {
  redazione: {
    id: 'redazione',
    name: 'Redazione AI Tools Review',
    role: 'Team editoriale',
    bio: 'Il nostro team seleziona e testa tool AI ogni settimana. Ogni recensione include prove pratiche su task reali, confronto diretto con i concorrenti e aggiornamenti periodici quando il prodotto cambia. Nessun endorsement: scriviamo solo quello che abbiamo usato davvero.',
    expertise: ['LLM', 'Scrittura AI', 'Generazione Immagini', 'Coding AI', 'Automazione', 'Audio AI'],
    toolsReviewed: 47,
    yearsExp: 3,
    initial: 'AI',
    avatarGradient: 'from-ai-purple to-blue-500',
    schemaId: 'https://aitoolsreview.it/#redazione',
    knowsAbout: [
      'Artificial Intelligence',
      'Large Language Models',
      'AI Content Tools',
      'Machine Learning Applications',
      'Software as a Service',
    ],
  },
  davide: {
    id: 'davide',
    name: 'Davide R.',
    role: 'AI Reviewer & Developer',
    bio: 'Sviluppatore con 8 anni di esperienza e 4 anni a testare tool AI per il coding. Usa Cursor e Claude ogni giorno nel suo lavoro. Specializzato nella valutazione di IDE AI, assistenti per il codice e strumenti di automazione per sviluppatori.',
    expertise: ['Coding AI', 'Developer Tools', 'LLM API', 'VS Code Ecosystem', 'Automazione'],
    toolsReviewed: 23,
    yearsExp: 4,
    initial: 'D',
    avatarGradient: 'from-blue-500 to-ai-green',
    schemaId: 'https://aitoolsreview.it/#davide',
    knowsAbout: [
      'Software Development',
      'AI Coding Assistants',
      'Developer Productivity',
      'Large Language Models',
      'Code Generation',
    ],
  },
  sara: {
    id: 'sara',
    name: 'Sara M.',
    role: 'Content Strategist & AI Writer',
    bio: 'Content strategist con 6 anni di esperienza nel content marketing. Specializzata nei tool AI per la scrittura, il copywriting e la produzione multimediale. Recensisce tool dal punto di vista di chi li usa ogni giorno per produrre contenuti a scala.',
    expertise: ['Scrittura AI', 'Copywriting', 'SEO AI', 'Produttività', 'Social Media AI'],
    toolsReviewed: 31,
    yearsExp: 3,
    initial: 'S',
    avatarGradient: 'from-pink-500 to-purple-500',
    schemaId: 'https://aitoolsreview.it/#sara',
    knowsAbout: [
      'AI Writing Tools',
      'Content Marketing',
      'SEO',
      'Copywriting',
      'Digital Marketing',
    ],
  },
  marco: {
    id: 'marco',
    name: 'Marco T.',
    role: 'Visual AI Specialist',
    bio: 'Graphic designer e fotografo con 10 anni di carriera. Da 3 anni testa sistematicamente i generatori di immagini AI, confrontando qualità visiva, aderenza al prompt e stile artistico. Specializzato in Midjourney, Stable Diffusion e strumenti Adobe AI.',
    expertise: ['Generazione Immagini', 'Midjourney', 'Stable Diffusion', 'Adobe AI', 'Design'],
    toolsReviewed: 18,
    yearsExp: 3,
    initial: 'M',
    avatarGradient: 'from-pink-500 to-red-400',
    schemaId: 'https://aitoolsreview.it/#marco',
    knowsAbout: [
      'AI Image Generation',
      'Generative Art',
      'Graphic Design',
      'Prompt Engineering',
      'Computer Vision',
    ],
  },
}

/** Restituisce l'autore per ID, fallback alla redazione */
export function getAuthor(id?: string): Author {
  return AUTHORS[id ?? 'redazione'] ?? AUTHORS.redazione
}
