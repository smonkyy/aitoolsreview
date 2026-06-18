import type { ToolCategory } from './tools';

export interface UseCaseRec {
  task: string;       // cosa sta cercando di fare l'utente
  toolId: string;     // ID del tool consigliato
  reason: string;     // perché questo tool, in una riga
}

export interface UserProfileRec {
  profile: string;    // es. "Principiante"
  description: string;
  toolId: string;
  badge?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CategoryPageData {
  category: ToolCategory;
  slug: string;           // URL segment: /migliore-ai-per/[slug]
  h1: string;
  metaDescription: string;
  intro: string;          // 2-3 frasi, decision-focused
  topToolIds: string[];   // max 3, ordinati per rilevanza
  useCases: UseCaseRec[];
  userProfiles: UserProfileRec[];
  faqs: FAQ[];
}

export const CATEGORY_PAGES: CategoryPageData[] = [

  // ── SCRITTURA ──────────────────────────────────────────────────────────────
  {
    category: 'scrittura',
    slug: 'scrittura',
    h1: 'Miglior AI per Scrivere nel 2026',
    metaDescription: 'Claude 4, ChatGPT-4o o Gemini 2.5 Pro? Guida aggiornata ai migliori tool AI per scrivere in italiano: articoli SEO, copy, email, blog. Confronto onesto con verdetto finale.',
    intro: 'Nel 2026 il mercato si è consolidato attorno a quattro modelli forti: Claude 4 resta il migliore per qualità di testo pura, ChatGPT-4o è il più versatile per chi parte da zero, Gemini 2.5 Pro è la scelta naturale per chi lavora nell\'ecosistema Google, Grok-3 è l\'unico con dati real-time da X. Ecco come orientarsi.',
    topToolIds: ['claude-4', 'chatgpt-4o', 'gemini-2-5-pro'],
    useCases: [
      {
        task: 'Blog post narrativi, editing approfondito, testi tecnici lunghi',
        toolId: 'claude-4',
        reason: 'Qualità di testo superiore su contenuti lunghi e ragionamento complesso',
      },
      {
        task: 'Scrivere email professionali, riassumere PDF, brainstorming quotidiano',
        toolId: 'chatgpt-4o',
        reason: 'Piano free generoso, interfaccia immediata, zero curva di apprendimento',
      },
      {
        task: 'Lavorare su documenti Google Docs, riassumere email Gmail, analisi dati Sheets',
        toolId: 'gemini-2-5-pro',
        reason: 'Integrazione nativa Google Workspace, finestra contesto da 1M token',
      },
      {
        task: 'Ricerche su trend attuali, notizie recenti, argomenti legati a X/Twitter',
        toolId: 'grok-3',
        reason: 'Unico modello con accesso real-time a X — nessun altro ha questa fonte',
      },
      {
        task: 'Scrivere un articolo SEO da 2.000 parole con keyword integrate',
        toolId: 'writesonic',
        reason: 'SEO checker integrato e Surfer SEO nativo nel workflow',
      },
      {
        task: 'Generare headline e copy per landing page in varianti multiple',
        toolId: 'jasper-ai',
        reason: 'Template di marketing specifici + brand voice configurabile',
      },
    ],
    userProfiles: [
      {
        profile: 'Principiante',
        description: 'Prima volta con AI, vuoi solo iniziare a scrivere meglio',
        toolId: 'chatgpt-4o',
        badge: 'Più Usato',
      },
      {
        profile: 'Content creator',
        description: 'Blog, newsletter, social: vuoi qualità senza pagare troppo',
        toolId: 'claude-4',
        badge: 'Top Pick',
      },
      {
        profile: 'Utente Google Workspace',
        description: 'Usi già Docs, Gmail, Drive: vuoi AI integrata senza cambiare tool',
        toolId: 'gemini-2-5-pro',
        badge: 'Google',
      },
      {
        profile: 'Marketer / Agenzia',
        description: 'Produci copy per clienti, hai bisogno di template e brand voice',
        toolId: 'jasper-ai',
        badge: 'Marketing',
      },
    ],
    faqs: [
      {
        question: 'Qual è il miglior AI per scrivere testi in italiano?',
        answer: 'Claude 4 produce il testo più naturale e accurato in italiano, seguito da ChatGPT-4o e Gemini 2.5 Pro. Tutti e tre hanno piano gratuito. Per articoli SEO, Writesonic aggiunge ottimizzazione integrata.',
      },
      {
        question: 'Claude 4, ChatGPT-4o o Gemini 2.5 Pro: quale scegliere?',
        answer: 'Claude 4 vince sulla qualità pura del testo. ChatGPT-4o è il più versatile con generazione immagini e web search. Gemini 2.5 Pro è la scelta ovvia se usi già Google Workspace — si integra direttamente in Docs e Gmail.',
      },
      {
        question: 'Esistono AI gratuiti per scrivere testi?',
        answer: 'Sì: Claude 4, ChatGPT-4o e Gemini 2.5 Pro offrono tutti piani free. Grok-3 è gratuito su grok.com. Copy.ai include 2.000 parole/mese. Per uso professionale intenso serve un piano a pagamento.',
      },
      {
        question: 'Cos\'è Grok-3 e perché è diverso dagli altri?',
        answer: 'Grok-3 è il modello AI di xAI (Elon Musk). Il vantaggio unico è l\'accesso in tempo reale ai dati di X (Twitter): può rispondere su trend del momento, notizie recenti e conversazioni attuali. Gratuito su grok.com, accesso completo con X Premium.',
      },
    ],
  },

  // ── IMMAGINI ───────────────────────────────────────────────────────────────
  {
    category: 'immagini',
    slug: 'immagini',
    h1: 'Miglior AI per Generare Immagini nel 2026',
    metaDescription: 'Midjourney, Leonardo.ai o Adobe Firefly? Guida ai migliori generatori di immagini AI: piani gratuiti, qualità reale e casi d\'uso concreti. Aggiornato 2026.',
    intro: 'Midjourney è ancora il riferimento per la qualità cinematografica, ma non ha piano gratuito. Leonardo.ai offre 150 token/giorno gratis con qualità sorprendente. Adobe Firefly è la scelta ovvia se usi già Photoshop. La differenza conta davvero: ecco quando scegliere cosa.',
    topToolIds: ['midjourney', 'leonardo-ai', 'adobe-firefly'],
    useCases: [
      {
        task: 'Hero image e visual per campagne pubblicitarie professionali',
        toolId: 'midjourney',
        reason: 'Qualità visiva imbattibile, stile cinematografico, lo standard del settore',
      },
      {
        task: 'Thumbnail YouTube e banner social senza spendere nulla',
        toolId: 'leonardo-ai',
        reason: '150 token gratuiti al giorno, interfaccia web semplice, zero Discord richiesto',
      },
      {
        task: 'Editing AI in Photoshop: rimozione oggetti, generative fill',
        toolId: 'adobe-firefly',
        reason: 'Integrazione nativa in Photoshop, addestrato su immagini con licenza',
      },
      {
        task: 'Generazione illimitata con controllo totale sui modelli',
        toolId: 'stable-diffusion',
        reason: 'Open source, gira in locale, nessun limite — richiede GPU e competenze tecniche',
      },
    ],
    userProfiles: [
      {
        profile: 'Principiante',
        description: 'Vuoi generare immagini belle senza imparare prompt complessi',
        toolId: 'dall-e-3',
        badge: 'Facile',
      },
      {
        profile: 'Creator / Social',
        description: 'Thumbnail, banner, grafica social — budget limitato',
        toolId: 'leonardo-ai',
        badge: 'Best Free',
      },
      {
        profile: 'Designer / Art director',
        description: 'Produci immagini per clienti, massima qualità, uso commerciale',
        toolId: 'midjourney',
        badge: 'Qualità Pro',
      },
      {
        profile: 'Developer / Power user',
        description: 'Vuoi controllo totale, LoRA, ControlNet, installazione locale',
        toolId: 'stable-diffusion',
        badge: 'Open Source',
      },
    ],
    faqs: [
      {
        question: 'Midjourney è ancora il miglior generatore di immagini AI?',
        answer: 'Per qualità pura sì — nessun altro tool raggiunge la coerenza estetica e il fotorealismo di Midjourney. Il limite principale è che non ha piano gratuito (parte da $10/mese). Ha ora un\'interfaccia web propria, non più solo Discord.',
      },
      {
        question: 'Quali generatori di immagini AI sono gratuiti?',
        answer: 'Leonardo.ai offre 150 token/giorno gratis (circa 30-50 immagini). Adobe Firefly ha crediti mensili gratuiti. DALL-E 3 è incluso in ChatGPT Plus ma richiede abbonamento a $20/mese. Stable Diffusion è gratuito se hai una GPU.',
      },
      {
        question: 'DALL-E 3 o Midjourney: quale scegliere?',
        answer: 'DALL-E 3 vince su facilità: scrivi in italiano direttamente in ChatGPT. Midjourney vince su qualità artistica e fotorealismo. Se la semplicità conta più della qualità, DALL-E 3. Se vuoi il meglio possibile, Midjourney.',
      },
      {
        question: 'Posso usare le immagini generate per uso commerciale?',
        answer: 'Dipende dal tool. Adobe Firefly è il più sicuro: addestrato su immagini con licenza, uso commerciale garantito. Midjourney lo permette dal piano Standard in su. Stable Diffusion dipende dal modello usato.',
      },
    ],
  },

  // ── VIDEO ──────────────────────────────────────────────────────────────────
  {
    category: 'video',
    slug: 'video',
    h1: 'Miglior AI per Creare Video nel 2026',
    metaDescription: 'Sora, Runway Gen-3 o HeyGen? Confronto aggiornato ai migliori tool AI per creare video: da testo, da immagini, con avatar. Qual è giusto per te?',
    intro: 'Nel 2026 la video AI ha tre anime distinte: Sora e Runway per chi genera scene da prompt o immagini con qualità cinematografica, Kling AI per chi vuole qualità alta a zero costo, HeyGen per chi trasforma uno script in un presentatore virtuale. Il caso d\'uso decide tutto.',
    topToolIds: ['runway-gen3', 'sora', 'heygen'],
    useCases: [
      {
        task: 'Clip creative e transizioni cinematografiche per reel e short film',
        toolId: 'runway-gen3',
        reason: 'Qualità video più alta disponibile, controllo avanzato su motion e camera',
      },
      {
        task: 'Video da testo o immagini già incluso nell\'abbonamento ChatGPT Plus',
        toolId: 'sora',
        reason: 'Incluso a $20/mese in ChatGPT Plus — nessun costo aggiuntivo se lo usi già',
      },
      {
        task: 'Video aziendale con presentatore che parla il tuo script',
        toolId: 'heygen',
        reason: 'Avatar realistici, traduzione automatica in 40+ lingue, perfetto per onboarding',
      },
      {
        task: 'Video da testo o immagini gratis con crediti giornalieri',
        toolId: 'kling-ai',
        reason: 'Piano free con crediti daily, genera fino a 2 minuti — raro nel settore',
      },
    ],
    userProfiles: [
      {
        profile: 'Creator / YouTuber',
        description: 'Reel, clip, b-roll per i tuoi video — vuoi qualità cinematic',
        toolId: 'runway-gen3',
        badge: 'Innovativo',
      },
      {
        profile: 'Già abbonato ChatGPT Plus',
        description: 'Vuoi generare video senza pagare un servizio extra',
        toolId: 'sora',
        badge: 'OpenAI',
      },
      {
        profile: 'Azienda / HR',
        description: 'Video onboarding, corsi e-learning, presentazioni multilingua',
        toolId: 'heygen',
        badge: 'Business',
      },
      {
        profile: 'Principiante / Budget zero',
        description: 'Vuoi sperimentare la video AI senza spendere nulla',
        toolId: 'kling-ai',
        badge: 'Rising Star',
      },
    ],
    faqs: [
      {
        question: 'Qual è il miglior AI per creare video da testo nel 2026?',
        answer: 'Runway Gen-3 produce la qualità più alta su video generativi. Sora (OpenAI) è incluso in ChatGPT Plus e offre ottima qualità senza costi aggiuntivi. Kling AI è la migliore opzione gratuita con crediti giornalieri.',
      },
      {
        question: 'Cos\'è Sora e come si usa?',
        answer: 'Sora è il generatore video di OpenAI, accessibile direttamente da ChatGPT Plus ($20/mese). Descrivi la scena in testo o carica un\'immagine e Sora genera il video. Non richiede abbonamento separato — è incluso nel piano Plus.',
      },
      {
        question: 'HeyGen serve per fare video con presentatori AI?',
        answer: 'Sì, è il leader indiscusso per avatar video. Carica il tuo script, scegli un avatar (o clona il tuo viso) e ottieni un video professionale in minuti. Ideale per corsi, onboarding e video aziendali.',
      },
      {
        question: 'Esistono AI per video completamente gratuiti?',
        answer: 'Kling AI offre crediti gratuiti giornalieri. Runway Gen-3 ha un piano free con crediti limitati. Sora è incluso in ChatGPT Plus ($20/mese). Per uso professionale intenso serve un piano dedicato.',
      },
    ],
  },

  // ── AUDIO ──────────────────────────────────────────────────────────────────
  {
    category: 'audio',
    slug: 'audio',
    h1: 'Miglior AI per l\'Audio nel 2026',
    metaDescription: 'ElevenLabs o Whisper? Guida ai migliori tool AI per audio: text-to-speech, clonazione vocale e trascrizione. Confronto aggiornato con piani gratuiti.',
    intro: 'Il mercato audio AI si divide nettamente: ElevenLabs per generare voci sintetiche realistiche, Whisper per trascrivere audio in testo. Scopi diversi, nessuna sovrapposizione. Ecco tutto quello che devi sapere.',
    topToolIds: ['elevenlabs', 'whisper'],
    useCases: [
      {
        task: 'Voiceover per video YouTube, spot radio, narrazione di audiolibri',
        toolId: 'elevenlabs',
        reason: 'Voci più realistiche esistenti, emozioni e intonazione imbattibili',
      },
      {
        task: 'Trascrivere interviste, podcast, riunioni in testo accurato',
        toolId: 'whisper',
        reason: 'Gratuito, open source, alta precisione su italiano e accenti regionali',
      },
      {
        task: 'Clonare la propria voce per contenuti scalabili',
        toolId: 'elevenlabs',
        reason: 'Voice cloning da pochi secondi di audio — risultati impressionanti',
      },
    ],
    userProfiles: [
      {
        profile: 'Creator / Podcaster',
        description: 'Voiceover per video e contenuti audio senza registrare ogni volta',
        toolId: 'elevenlabs',
        badge: 'Best in Class',
      },
      {
        profile: 'Developer / Ricercatore',
        description: 'Trascrizione batch, integrazione API, uso programmatico',
        toolId: 'whisper',
        badge: 'Gratuito',
      },
      {
        profile: 'Azienda',
        description: 'Materiali di training, video aziendali, supporto multilingua',
        toolId: 'elevenlabs',
        badge: 'Best in Class',
      },
    ],
    faqs: [
      {
        question: 'Qual è il miglior AI per text-to-speech in italiano?',
        answer: 'ElevenLabs è il riferimento assoluto per qualità: voci naturali, emozioni realistiche, supporto italiano nativo. Il piano free include 10.000 caratteri/mese — sufficienti per iniziare.',
      },
      {
        question: 'Whisper è davvero gratuito?',
        answer: 'Sì, Whisper di OpenAI è open source e completamente gratuito. Puoi usarlo via API (con costi minimi) o installarlo in locale. L\'installazione richiede competenze tecniche di base.',
      },
      {
        question: 'Posso clonare la mia voce con l\'AI?',
        answer: 'Sì con ElevenLabs, ma serve il piano a pagamento (da $22/mese). Il risultato è impressionante: bastano 1-2 minuti di audio per creare una copia della tua voce usabile su qualsiasi testo.',
      },
    ],
  },

  // ── PRODUTTIVITÀ ───────────────────────────────────────────────────────────
  {
    category: 'produttivita',
    slug: 'produttivita',
    h1: 'Miglior AI per la Produttività nel 2026',
    metaDescription: 'Make, Zapier o Notion AI? Guida ai migliori tool AI per automatizzare il lavoro: workflow, integrazioni, ricerca e organizzazione. Aggiornato 2026.',
    intro: 'Produttività AI non significa un solo strumento — significa sapere quale problema stai risolvendo. Make e Zapier automatizzano i workflow tra app. Notion AI potenzia il tuo workspace. Perplexity AI accelera la ricerca. Scegli in base al tuo vero collo di bottiglia.',
    topToolIds: ['make', 'zapier', 'notion-ai'],
    useCases: [
      {
        task: 'Workflow complessi: form → CRM → email → notifica Slack in automatico',
        toolId: 'make',
        reason: 'Più potente di Zapier su logiche multi-step, costo inferiore',
      },
      {
        task: 'Prima automazione in 10 minuti: Gmail → Drive, lead → foglio Excel',
        toolId: 'zapier',
        reason: 'Facilissimo da configurare, 6.000+ integrazioni, zero tecnica richiesta',
      },
      {
        task: 'Riassumere documenti, generare action item da meeting notes in Notion',
        toolId: 'notion-ai',
        reason: 'Zero switching: AI direttamente dove già lavori',
      },
      {
        task: 'Ricerca rapida con fonti citate su qualsiasi argomento',
        toolId: 'perplexity-ai',
        reason: 'Risponde con fonti verificate, ideale per fact-checking e ricerca professionale',
      },
    ],
    userProfiles: [
      {
        profile: 'Principiante / No-code',
        description: 'Vuoi automatizzare senza scrivere codice, subito',
        toolId: 'zapier',
        badge: 'Facile',
      },
      {
        profile: 'Power user / PMI',
        description: 'Workflow aziendali complessi, molte app da connettere',
        toolId: 'make',
        badge: 'Potente',
      },
      {
        profile: 'Knowledge worker',
        description: 'Usi Notion, vuoi AI che ti aiuti dentro il workspace',
        toolId: 'notion-ai',
        badge: 'All-in-One',
      },
      {
        profile: 'Ricercatore / Manager',
        description: 'Hai bisogno di risposte rapide con fonti verificate',
        toolId: 'perplexity-ai',
        badge: 'Research',
      },
    ],
    faqs: [
      {
        question: 'Make o Zapier: quale scegliere per le automazioni?',
        answer: 'Zapier se vuoi iniziare subito senza curva di apprendimento. Make se hai workflow complessi con logiche condizionali, filtri avanzati o molte operazioni mensili — costa meno a parità di operazioni.',
      },
      {
        question: 'Notion AI vale i $10/mese aggiuntivi?',
        answer: 'Sì, se usi già Notion intensivamente: riassume documenti, genera task da note, risponde a domande sul tuo database. Se non usi Notion, meglio Claude o ChatGPT standalone.',
      },
      {
        question: 'Perplexity AI è meglio di ChatGPT per la ricerca?',
        answer: 'Per ricerca veloce con fonti citate sì — Perplexity cita sempre le fonti, riducendo le allucinazioni. Per scrittura, ragionamento complesso o task creativi, Claude e ChatGPT sono superiori.',
      },
    ],
  },

  // ── CODING ─────────────────────────────────────────────────────────────────
  {
    category: 'coding',
    slug: 'coding',
    h1: 'Miglior AI per Programmare nel 2026',
    metaDescription: 'Cursor, Windsurf o GitHub Copilot? Confronto aggiornato ai migliori tool AI per sviluppatori: autocompletamento, refactoring, debugging. Quale usare nel 2026.',
    intro: 'Nel 2026 sono tre i player seri per il coding AI: Cursor per chi vuole l\'AI integrata nell\'editor con contesto sull\'intera codebase, Windsurf per chi usa JetBrains o vuole un\'alternativa con piano free generoso, GitHub Copilot per chi vuole rimanere nel proprio editor con il minor attrito possibile — ora con piano gratuito.',
    topToolIds: ['cursor', 'windsurf', 'github-copilot'],
    useCases: [
      {
        task: 'Refactoring di una codebase intera con un singolo prompt',
        toolId: 'cursor',
        reason: 'Chat contestuale sull\'intero progetto, modifica blocchi di codice in un colpo',
      },
      {
        task: 'AI coding su IntelliJ, PyCharm o altri IDE JetBrains',
        toolId: 'windsurf',
        reason: 'Supporto plugin JetBrains nativo — Cursor non lo ha, Copilot è più limitato',
      },
      {
        task: 'Autocompletamento inline gratuito in VS Code senza cambiare editor',
        toolId: 'github-copilot',
        reason: 'Piano free con 2.000 completamenti/mese, integrazione nativa, zero migrazione',
      },
      {
        task: 'Imparare a programmare, spiegare errori, primi progetti nel browser',
        toolId: 'replit-ai',
        reason: 'Zero setup, tutto nel browser, AI che spiega e corregge mentre impari',
      },
    ],
    userProfiles: [
      {
        profile: 'Developer senior (VS Code)',
        description: 'Lavori su codebase grandi, vuoi AI che ragioni sull\'intero progetto',
        toolId: 'cursor',
        badge: 'Editor AI',
      },
      {
        profile: 'Developer su JetBrains',
        description: 'Usi IntelliJ, PyCharm o CLion — non vuoi cambiare IDE',
        toolId: 'windsurf',
        badge: 'Alternativa Cursor',
      },
      {
        profile: 'Developer junior/mid',
        description: 'Vuoi autocompletamento AI gratis senza cambiare nulla del tuo setup',
        toolId: 'github-copilot',
        badge: 'Standard Dev',
      },
      {
        profile: 'Principiante',
        description: 'Stai imparando a programmare, vuoi un ambiente guidato nel browser',
        toolId: 'replit-ai',
        badge: 'Per Imparare',
      },
    ],
    faqs: [
      {
        question: 'Cursor o Windsurf: quale scegliere nel 2026?',
        answer: 'Cursor vince per chi lavora su VS Code e codebase complesse: ha la community più grande e il contesto più profondo. Windsurf vince per chi usa JetBrains (supporto nativo) o vuole un piano free più generoso. Entrambi supportano Claude 4 e GPT-4o come backend.',
      },
      {
        question: 'GitHub Copilot ha ancora senso nel 2026?',
        answer: 'Sì, per due casi specifici: chi non vuole cambiare editor (funziona in VS Code, JetBrains, Neovim) e chi vuole iniziare gratis — il piano free offre 2.000 completamenti/mese. Per chi fa refactoring intenso su codebase grandi, Cursor o Windsurf rimangono superiori.',
      },
      {
        question: 'Cursor ha un piano gratuito?',
        answer: 'Sì, Cursor ha un piano free con un numero limitato di richieste AI al mese. Il piano Pro è $20/mese. Windsurf ha un piano free simile, entrambi permettono di testare prima di pagare.',
      },
      {
        question: 'Qual è il miglior AI per imparare a programmare?',
        answer: 'Replit AI: tutto nel browser, nessun setup, AI che spiega gli errori in linguaggio semplice. Per chi ha già basi, Claude 4 o ChatGPT sono ottimi per farsi spiegare concetti e debuggare da qualsiasi editor.',
      },
    ],
  },
];

export function getCategoryPage(slug: string): CategoryPageData | undefined {
  return CATEGORY_PAGES.find(p => p.slug === slug);
}
