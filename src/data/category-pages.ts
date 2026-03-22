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
    metaDescription: 'Claude 4, ChatGPT-4o o Jasper AI? Guida aggiornata ai migliori tool AI per scrivere in italiano: articoli SEO, copy, email, blog. Confronto onesto con verdetto finale.',
    intro: 'Non esiste un\'unica "miglior AI per scrivere" — dipende da cosa stai scrivendo. Claude 4 produce il testo di qualità più alta su contenuti lunghi e complessi. ChatGPT-4o è il punto di partenza ideale se parti da zero. Jasper AI è costruito per chi fa marketing professionale. Ecco come orientarsi.',
    topToolIds: ['claude-4', 'chatgpt-4o', 'jasper-ai'],
    useCases: [
      {
        task: 'Scrivere un articolo SEO da 2.000 parole con keyword integrate',
        toolId: 'writesonic',
        reason: 'Unico con SEO checker integrato e Surfer SEO nativo nel workflow',
      },
      {
        task: 'Generare 5 varianti di headline e copy per una landing page',
        toolId: 'jasper-ai',
        reason: 'Template di marketing specifici + brand voice configurabile',
      },
      {
        task: 'Scrivere email professionali, riassumere PDF, brainstorming quotidiano',
        toolId: 'chatgpt-4o',
        reason: 'Piano free generoso, interfaccia immediata, zero curva di apprendimento',
      },
      {
        task: 'Blog post narrativi, editing approfondito, testi tecnici lunghi',
        toolId: 'claude-4',
        reason: 'Qualità di testo superiore su contenuti lunghi e ragionamento complesso',
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
        profile: 'Marketer / Agenzia',
        description: 'Produci copy per clienti, hai bisogno di template e brand voice',
        toolId: 'jasper-ai',
        badge: 'Marketing',
      },
      {
        profile: 'SEO specialist',
        description: 'Articoli ottimizzati, keyword research integrata, scalabilità',
        toolId: 'writesonic',
        badge: 'SEO',
      },
    ],
    faqs: [
      {
        question: 'Qual è il miglior AI per scrivere testi in italiano?',
        answer: 'Claude 4 produce il testo più naturale e accurato in italiano, seguito da ChatGPT-4o. Entrambi hanno piano gratuito. Per articoli SEO, Writesonic aggiunge ottimizzazione integrata.',
      },
      {
        question: 'Esistono AI gratuiti per scrivere testi?',
        answer: 'Sì: ChatGPT-4o e Claude 4 offrono entrambi piani free con limitazioni sui messaggi giornalieri. Copy.ai include 2.000 parole/mese gratis. Per uso professionale intenso serve un piano a pagamento.',
      },
      {
        question: 'Claude 4 o ChatGPT-4o: quale scegliere?',
        answer: 'Claude 4 vince sulla qualità del testo — soprattutto su testi lunghi, editing e contenuti che richiedono ragionamento. ChatGPT-4o è più versatile: ha accesso internet, genera immagini ed è più facile per i principianti. Se scrivi tanto, parti da Claude.',
      },
      {
        question: 'Jasper AI vale i $49/mese?',
        answer: 'Solo se fai marketing professionale: copy per campagne, sequenze email, landing page per clienti. Per uso personale o blogging occasionale è eccessivo — Claude 4 a $20/mese fa di più per la maggior parte dei casi.',
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
        answer: 'Per qualità pura sì — nessun altro tool raggiunge la coerenza estetica e il fotorealismo di Midjourney v6. Il limite è che non ha piano gratuito (parte da $10/mese) e funziona solo via Discord.',
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
    metaDescription: 'Runway Gen-3, Kling AI o HeyGen? Confronto aggiornato ai migliori tool AI per creare video: da testo, da immagini, con avatar. Qual è giusto per te?',
    intro: 'I tool video AI si dividono in due categorie: generativi (Runway, Kling) che creano scene da prompt o immagini, e avatar (HeyGen) che trasformano uno script in un presentatore virtuale. Il caso d\'uso decide tutto.',
    topToolIds: ['runway-gen3', 'heygen', 'kling-ai'],
    useCases: [
      {
        task: 'Clip creative e transizioni cinematografiche per reel e short film',
        toolId: 'runway-gen3',
        reason: 'Qualità video più alta disponibile, controllo avanzato su motion e camera',
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
        profile: 'Azienda / HR',
        description: 'Video onboarding, corsi e-learning, presentazioni multilingua',
        toolId: 'heygen',
        badge: 'Business',
      },
      {
        profile: 'Principiante / Budget zero',
        description: 'Vuoi sperimentare la video AI senza spendere',
        toolId: 'kling-ai',
        badge: 'Rising Star',
      },
    ],
    faqs: [
      {
        question: 'Qual è il miglior AI per creare video da testo?',
        answer: 'Runway Gen-3 produce la qualità più alta su video generativi da testo o immagini. Kling AI è l\'alternativa gratuita con risultati sorprendenti per il prezzo (zero).',
      },
      {
        question: 'HeyGen serve per fare video con presentatori AI?',
        answer: 'Sì, è il leader indiscusso per avatar video. Carica il tuo script, scegli un avatar (o clona il tuo viso) e ottieni un video professionale in minuti. Ideale per corsi, onboarding e video aziendali.',
      },
      {
        question: 'Esistono AI per video completamente gratuiti?',
        answer: 'Kling AI offre crediti gratuiti giornalieri. Runway Gen-3 ha un piano free ma con crediti limitati (circa 125/mese). Per uso intenso serve un piano a pagamento.',
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
    metaDescription: 'Cursor, GitHub Copilot o Replit AI? Confronto aggiornato ai migliori tool AI per sviluppatori: autocompletamento, refactoring, debugging. Quale usare nel 2026.',
    intro: 'Cursor sta sostituendo VS Code per molti sviluppatori grazie all\'AI contestuale sull\'intero progetto. GitHub Copilot è ancora il riferimento per chi vuole rimanere nel proprio editor. Replit AI è la scelta giusta per chi sta imparando. Il caso d\'uso decide.',
    topToolIds: ['cursor', 'github-copilot', 'replit-ai'],
    useCases: [
      {
        task: 'Refactoring di una codebase intera con un singolo prompt',
        toolId: 'cursor',
        reason: 'Chat contestuale sull\'intero progetto, modifica blocchi di codice in un colpo',
      },
      {
        task: 'Autocompletamento inline mentre scrivi codice in VS Code o JetBrains',
        toolId: 'github-copilot',
        reason: 'Integrazione nativa negli editor più usati, suggerimenti in tempo reale',
      },
      {
        task: 'Imparare a programmare, spiegare errori, primi progetti nel browser',
        toolId: 'replit-ai',
        reason: 'Zero setup, tutto nel browser, AI che spiega e corregge mentre impari',
      },
      {
        task: 'Debugging di logica complessa e ottimizzazione query SQL lente',
        toolId: 'cursor',
        reason: 'Supporta Claude 4 come backend — il miglior ragionamento disponibile',
      },
    ],
    userProfiles: [
      {
        profile: 'Principiante',
        description: 'Stai imparando a programmare, vuoi un ambiente guidato',
        toolId: 'replit-ai',
        badge: 'Per Imparare',
      },
      {
        profile: 'Developer junior/mid',
        description: 'Usi VS Code o JetBrains, vuoi autocompletamento intelligente',
        toolId: 'github-copilot',
        badge: 'Standard Dev',
      },
      {
        profile: 'Developer senior',
        description: 'Lavori su codebase grandi, vuoi AI che ragioni sull\'intero contesto',
        toolId: 'cursor',
        badge: 'Editor AI',
      },
    ],
    faqs: [
      {
        question: 'Cursor o GitHub Copilot: quale è meglio nel 2026?',
        answer: 'Cursor vince per chi lavora su progetti complessi: ragiona sull\'intera codebase, non solo sul file corrente. Copilot vince per chi non vuole cambiare editor e preferisce l\'integrazione nativa in VS Code o JetBrains.',
      },
      {
        question: 'Cursor ha un piano gratuito?',
        answer: 'Sì, Cursor ha un piano free con un numero limitato di richieste AI al mese. Il piano Pro è $20/mese e rimuove i limiti — lo stesso prezzo di Copilot ma con funzionalità più avanzate.',
      },
      {
        question: 'Qual è il miglior AI per imparare a programmare?',
        answer: 'Replit AI: tutto nel browser, nessun setup, AI che spiega gli errori in linguaggio semplice. Per chi ha già basi, Claude 4 o ChatGPT sono ottimi per farsi spiegare concetti e debuggare.',
      },
    ],
  },
];

export function getCategoryPage(slug: string): CategoryPageData | undefined {
  return CATEGORY_PAGES.find(p => p.slug === slug);
}
