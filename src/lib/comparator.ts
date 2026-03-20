import type { AITool, ToolCategory } from '../data/tools';
import type { FeatureValue, ToolFeature } from '../data/features';
import { COMMON_FEATURES, CATEGORY_FEATURES, TOOL_FEATURES } from '../data/features';

// ─── Output types ─────────────────────────────────────────────────────────────

export interface FeatureRow {
  feature: ToolFeature;
  valueA: FeatureValue;
  valueB: FeatureValue;
  winner: 'a' | 'b' | 'tie' | null; // null = entrambi null, non comparabile
}

export interface UseCaseVerdict {
  useCase: string;
  /** Concrete real-world task — makes the verdict actionable, not theoretical */
  example: string;
  category: ToolCategory;
  winner: AITool;
  reason: string;
  margin: 'netto' | 'lieve'; // netto = diff >= 10 punti
}

export interface QuickVerdict {
  /** Vincitore su più scenari con margine netto, o null se pari merito */
  bestOverall: AITool | null;
  /** Top 2 verdetti use-case: "{label}" → tool vincitore */
  bestForUseCases: Array<{ label: string; tool: AITool }>;
  /** Tool con il punteggio valueForMoney più alto */
  bestValue: AITool;
}

export interface WhoShouldUse {
  /** 2–3 profili specifici per ogni tool */
  a: string[];
  b: string[];
}

export interface FinalRecommendation {
  /** 1–2 frasi di verdetto diretto, senza fluff */
  summary: string;
  /** CTA naturale per toolA */
  ctaA: string;
  /** CTA naturale per toolB */
  ctaB: string;
  /** CTA di fallback per il caso pari merito */
  ctaC?: string;
}

export interface ToolComparison {
  toolA: AITool;
  toolB: AITool;
  slug: string;
  sameCategory: boolean;
  featureMatrix: FeatureRow[];
  useCaseVerdicts: UseCaseVerdict[];
  whyNotUse: { a: string[]; b: string[] };
  whoShouldUse: WhoShouldUse;
  quickVerdict: QuickVerdict;
  overallWinner: AITool | null;
  tldr: { chooseA: string; chooseB: string };
  finalRecommendation: FinalRecommendation;
  ratingDiff: {
    overall: number;      // toolA - toolB
    easeOfUse: number;
    outputQuality: number;
    valueForMoney: number;
  };
}

// ─── Use case definitions ─────────────────────────────────────────────────────
// Questi sono i contesti concreti in cui gli utenti scelgono tra due tool.

const USE_CASES: Array<{
  label: string;
  /** Concrete task a real user would actually do — 1 sentence, no fluff */
  example: string;
  category: ToolCategory;
  budget: 'free' | 'paid';
  skill: 'beginner' | 'pro';
}> = [
  // Scrittura
  {
    label:    'Uso quotidiano senza spendere',
    example:  'Riassumere un PDF di 20 pagine, rispondere a un\'email difficile, generare 10 idee per un post',
    category: 'scrittura', budget: 'free', skill: 'beginner',
  },
  {
    label:    'Copywriting e marketing',
    example:  'Scrivere 5 varianti di headline per una landing page SaaS e una sequenza di 3 email di onboarding',
    category: 'scrittura', budget: 'paid', skill: 'pro',
  },
  {
    label:    'Articoli SEO a lungo termine',
    example:  'Un articolo da 2.000 parole su "migliori CRM per PMI" ottimizzato per una keyword specifica',
    category: 'scrittura', budget: 'paid', skill: 'pro',
  },
  {
    label:    'Iniziare con l\'AI per scrivere',
    example:  'Scrivere il primo post su LinkedIn professionale e una bio per il sito personale',
    category: 'scrittura', budget: 'free', skill: 'beginner',
  },
  // Immagini
  {
    label:    'Generare immagini gratis',
    example:  'Thumbnail per un video YouTube e un banner promozionale per Instagram Stories',
    category: 'immagini', budget: 'free', skill: 'beginner',
  },
  {
    label:    'Produzione visiva professionale',
    example:  'Hero image per una campagna Meta Ads e pack shot di prodotto su sfondo neutro',
    category: 'immagini', budget: 'paid', skill: 'pro',
  },
  {
    label:    'Design per social e marketing',
    example:  'Carousel di 6 slide per Instagram e 3 varianti di creative per A/B test su Facebook Ads',
    category: 'immagini', budget: 'paid', skill: 'beginner',
  },
  // Video
  {
    label:    'Video brevi gratis',
    example:  'Reel di 15 secondi da uno script di testo e clip breve per TikTok con transizioni',
    category: 'video', budget: 'free', skill: 'beginner',
  },
  {
    label:    'Video professionali a pagamento',
    example:  'Video esplicativo di 60 secondi per homepage SaaS e trailer per un evento aziendale',
    category: 'video', budget: 'paid', skill: 'pro',
  },
  // Audio
  {
    label:    'Text-to-speech gratuito',
    example:  'Narrazione di un tutorial su YouTube e voce per le slide di una presentazione',
    category: 'audio', budget: 'free', skill: 'beginner',
  },
  {
    label:    'Produzione audio professionale',
    example:  'Voiceover per uno spot radio di 30 secondi e clonazione della propria voce per audiolibro',
    category: 'audio', budget: 'paid', skill: 'pro',
  },
  // Produttività
  {
    label:    'Automazioni senza tecnica',
    example:  'Salvare automaticamente gli allegati Gmail in Drive e inviare notifica Slack quando arriva un lead',
    category: 'produttivita', budget: 'free', skill: 'beginner',
  },
  {
    label:    'Workflow aziendali complessi',
    example:  'Pipeline completa: form → CRM → email di benvenuto → assegnazione commerciale → notifica team',
    category: 'produttivita', budget: 'paid', skill: 'pro',
  },
  // Coding
  {
    label:    'Imparare a programmare con AI',
    example:  'Capire un errore TypeScript, scrivere il primo componente React e farsi spiegare la differenza tra async/await e Promise',
    category: 'coding', budget: 'free', skill: 'beginner',
  },
  {
    label:    'Sviluppo professionale avanzato',
    example:  'Refactoring di una codebase legacy in Python, ottimizzazione di query SQL lente e code review automatizzata',
    category: 'coding', budget: 'paid', skill: 'pro',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toolCategoryRelevance(tool: AITool, category: ToolCategory): number {
  if (tool.category === category) return 1.0;
  if (tool.secondaryCategories?.includes(category)) return 0.55;
  return 0;
}

/**
 * Score diretto di un singolo tool per un use case specifico.
 * Versione semplificata che non richiede il full rankTools engine
 * per evitare dipendenze circolari e overhead di filtraggio.
 */
function scoreToolForUseCase(
  tool: AITool,
  category: ToolCategory,
  budget: 'free' | 'paid',
  skill: 'beginner' | 'pro',
): number {
  const catScore    = toolCategoryRelevance(tool, category);
  const qualScore   = Math.min((tool.ratings.overall * 0.6 + tool.ratings.outputQuality * 0.4) / 5, 1);
  const budgetScore = getBudgetScore(tool, budget);
  const skillScore  = getSkillScore(tool, skill);
  return Math.round((catScore * 0.40 + qualScore * 0.25 + budgetScore * 0.20 + skillScore * 0.15) * 100);
}

function getBudgetScore(tool: AITool, budget: 'free' | 'paid'): number {
  const { hasFreeOption, priceRange } = tool.pricing;
  if (budget === 'free') {
    if (priceRange === 'free') return 1.0;
    if (hasFreeOption) return 0.75;
    if (priceRange === 'low') return 0.30;
    return 0.10;
  }
  if (hasFreeOption) return 1.0;
  if (priceRange === 'low') return 0.95;
  if (priceRange === 'mid') return 0.80;
  return 0.65;
}

function getSkillScore(tool: AITool, skill: 'beginner' | 'pro'): number {
  const { targetUsers } = tool;
  if (skill === 'beginner') {
    if (targetUsers.includes('beginner')) return 1.0;
    if (targetUsers.includes('intermediate') || targetUsers.includes('creator')) return 0.65;
    return 0.25;
  }
  if (targetUsers.includes('advanced') || targetUsers.includes('developer')) return 1.0;
  if (targetUsers.includes('intermediate') || targetUsers.includes('business')) return 0.85;
  return 0.60;
}

// ─── Feature matrix ────────────────────────────────────────────────────────────

function featureWinner(a: FeatureValue, b: FeatureValue): 'a' | 'b' | 'tie' | null {
  if (a === null && b === null) return null;
  const rank = (v: FeatureValue): number => {
    if (v === true) return 3;
    if (typeof v === 'string' && v !== 'partial') return 2; // stringa descrittiva = presente
    if (v === 'partial') return 1;
    if (v === false) return 0;
    return -1; // null
  };
  const rA = rank(a), rB = rank(b);
  if (rA === rB) return 'tie';
  return rA > rB ? 'a' : 'b';
}

function buildFeatureMatrix(toolA: AITool, toolB: AITool): FeatureRow[] {
  const fA = TOOL_FEATURES[toolA.id] ?? {};
  const fB = TOOL_FEATURES[toolB.id] ?? {};

  // Feature di categoria: mostriamo quella condivisa, altrimenti nessuna
  const sharedCategory = toolA.category === toolB.category ? toolA.category : null;
  const catFeatures = sharedCategory ? (CATEGORY_FEATURES[sharedCategory] ?? []) : [];

  return [...COMMON_FEATURES, ...catFeatures].map(feature => ({
    feature,
    valueA: fA[feature.id] ?? null,
    valueB: fB[feature.id] ?? null,
    winner: featureWinner(fA[feature.id] ?? null, fB[feature.id] ?? null),
  }));
}

// ─── Use case verdicts ─────────────────────────────────────────────────────────

function buildUseCaseVerdicts(toolA: AITool, toolB: AITool): UseCaseVerdict[] {
  // Solo use case dove entrambi i tool hanno almeno rilevanza parziale
  const relevant = USE_CASES.filter(uc =>
    toolCategoryRelevance(toolA, uc.category) > 0 &&
    toolCategoryRelevance(toolB, uc.category) > 0,
  );

  // Limit: max 4 verdetti, i più significativi (quelli con margine maggiore)
  const verdicts = relevant.map(uc => {
    const sA = scoreToolForUseCase(toolA, uc.category, uc.budget, uc.skill);
    const sB = scoreToolForUseCase(toolB, uc.category, uc.budget, uc.skill);
    const winner = sA >= sB ? toolA : toolB;
    const loser  = sA >= sB ? toolB : toolA;
    const diff   = Math.abs(sA - sB);

    return {
      useCase:  uc.label,
      example:  uc.example,
      category: uc.category,
      winner,
      reason: buildUseCaseReason(winner, loser, uc.budget, uc.skill),
      margin: (diff >= 10 ? 'netto' : 'lieve') as 'netto' | 'lieve',
      _diff: diff, // usato solo per sorting, non esposto nel tipo finale
    };
  });

  // Ordina per margine decrescente, prendi i top 4
  verdicts.sort((a, b) => b._diff - a._diff);

  return verdicts.slice(0, 4).map(({ _diff: _, ...rest }) => rest);
}

function buildUseCaseReason(
  winner: AITool,
  loser: AITool,
  budget: 'free' | 'paid',
  skill: 'beginner' | 'pro',
): string {
  if (budget === 'free' && winner.pricing.hasFreeOption && !loser.pricing.hasFreeOption)
    return `${winner.name} ha un piano gratuito, ${loser.name} no`;

  if (budget === 'free' && winner.pricing.priceRange === 'free' && loser.pricing.priceRange !== 'free')
    return `${winner.name} è completamente gratuito`;

  if (skill === 'beginner' && winner.ratings.easeOfUse - loser.ratings.easeOfUse >= 0.6)
    return `${winner.name} è significativamente più semplice da usare`;

  if (winner.ratings.outputQuality - loser.ratings.outputQuality >= 0.4)
    return `${winner.name} produce output di qualità superiore (${winner.ratings.outputQuality} vs ${loser.ratings.outputQuality} / 5)`;

  if (winner.ratings.valueForMoney - loser.ratings.valueForMoney >= 0.5)
    return `${winner.name} offre un miglior rapporto qualità/prezzo`;

  return `${winner.name} ottiene uno score più alto su questo profilo`;
}

// ─── "When NOT to use" ─────────────────────────────────────────────────────────

function buildWhyNotUse(tool: AITool, other: AITool): string[] {
  const bullets: string[] = [];

  if (!tool.pricing.hasFreeOption)
    bullets.push(`Non hai un budget mensile — ${other.name} ha un piano gratuito`);

  if (tool.ratings.easeOfUse < 3.5)
    bullets.push(`Stai iniziando: la curva di apprendimento è ripida`);

  if (tool.category !== other.category && (other.secondaryCategories ?? []).includes(tool.category))
    bullets.push(`${other.name} copre la stessa funzionalità ed è più versatile`);

  // Prima weakness rilevante
  if (tool.weaknesses[0]) bullets.push(tool.weaknesses[0]);

  return bullets.slice(0, 3);
}

// ─── TL;DR ─────────────────────────────────────────────────────────────────────

function buildTldr(toolA: AITool, toolB: AITool): ToolComparison['tldr'] {
  const qualityDiff  = toolA.ratings.outputQuality - toolB.ratings.outputQuality;
  const easeDiff     = toolA.ratings.easeOfUse - toolB.ratings.easeOfUse;
  const valueDiff    = toolA.ratings.valueForMoney - toolB.ratings.valueForMoney;
  const aHasFree     = toolA.pricing.hasFreeOption;
  const bHasFree     = toolB.pricing.hasFreeOption;

  const chooseA = qualityDiff >= 0.3
    ? `Scegli ${toolA.name} se vuoi la massima qualità dell'output`
    : easeDiff >= 0.5
    ? `Scegli ${toolA.name} se preferisci uno strumento più semplice da usare`
    : aHasFree && !bHasFree
    ? `Scegli ${toolA.name} se vuoi iniziare senza costi`
    : valueDiff >= 0.4
    ? `Scegli ${toolA.name} per il miglior rapporto qualità/prezzo`
    : `Scegli ${toolA.name} se ${toolA.strengths[0].toLowerCase()}`;

  const chooseB = qualityDiff <= -0.3
    ? `Scegli ${toolB.name} se vuoi la massima qualità dell'output`
    : easeDiff <= -0.5
    ? `Scegli ${toolB.name} se preferisci uno strumento più semplice da usare`
    : !aHasFree && bHasFree
    ? `Scegli ${toolB.name} se vuoi iniziare senza costi`
    : valueDiff <= -0.4
    ? `Scegli ${toolB.name} per il miglior rapporto qualità/prezzo`
    : `Scegli ${toolB.name} se ${toolB.strengths[0].toLowerCase()}`;

  return { chooseA, chooseB };
}

// ─── Quick verdict ─────────────────────────────────────────────────────────────

function buildQuickVerdict(
  toolA: AITool,
  toolB: AITool,
  overallWinner: AITool | null,
  verdicts: UseCaseVerdict[],
): QuickVerdict {
  // Prefer verdicts with distinct winners — two badges for the same tool are redundant
  const withDistinctWinners: UseCaseVerdict[] = [];
  const seenWinners = new Set<string>();
  for (const v of verdicts) {
    if (withDistinctWinners.length >= 2) break;
    if (!seenWinners.has(v.winner.id)) {
      withDistinctWinners.push(v);
      seenWinners.add(v.winner.id);
    }
  }
  // Fall back to top 2 if all verdicts have the same winner (one tool dominates)
  const bestForUseCases = (withDistinctWinners.length >= 1 ? withDistinctWinners : verdicts.slice(0, 2))
    .map(v => ({ label: v.useCase, tool: v.winner }));

  // bestValue only meaningful if the gap is real (>= 0.3); otherwise show overallWinner
  const valueDiff = toolA.ratings.valueForMoney - toolB.ratings.valueForMoney;
  const bestValue = Math.abs(valueDiff) >= 0.3
    ? (valueDiff > 0 ? toolA : toolB)
    : (overallWinner ?? toolA);

  return { bestOverall: overallWinner, bestForUseCases, bestValue };
}

// ─── Who should use ────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  scrittura:    'scrittura e testi',
  immagini:     'immagini e grafica',
  video:        'creazione video',
  audio:        'audio e voce',
  produttivita: 'produttività e automazioni',
  coding:       'sviluppo software',
};

function buildWhoShouldUse(tool: AITool, other: AITool): string[] {
  const lines: string[] = [];
  const qualDiff  = tool.ratings.outputQuality - other.ratings.outputQuality;
  const easeDiff  = tool.ratings.easeOfUse     - other.ratings.easeOfUse;
  const isOpenSrc = tool.pricing.priceRange === 'free';
  const hasFreeAdvantage = tool.pricing.hasFreeOption && !other.pricing.hasFreeOption;

  // Line 1: role + what THIS tool does better than the competitor in that role
  if (isOpenSrc && tool.targetUsers.includes('developer'))
    lines.push(`Developer che vogliono girare il modello in locale: zero rate limit, zero costi, controllo totale`);
  else if (tool.targetUsers.includes('developer') && qualDiff >= 0.3)
    lines.push(`Developer che integrano AI nel codice e non accettano output di qualità inferiore (${tool.ratings.outputQuality}/5 vs ${other.ratings.outputQuality}/5)`);
  else if (tool.targetUsers.includes('developer'))
    lines.push(`Developer e team tecnici — ${tool.name} copre ${CATEGORY_LABEL[tool.category]} meglio di ${other.name} per casi d'uso tecnici avanzati`);
  else if (tool.targetUsers.includes('beginner') && easeDiff >= 0.5)
    lines.push(`Chi usa un AI tool per la prima volta: ${tool.name} è significativamente più semplice (${tool.ratings.easeOfUse}/5 vs ${other.ratings.easeOfUse}/5 su facilità d'uso)`);
  else if (tool.targetUsers.includes('beginner'))
    lines.push(`Principianti e utenti non tecnici che vogliono risultati senza configurazione`);
  else if (tool.targetUsers.includes('business') && tool.targetUsers.includes('creator'))
    lines.push(`Team di marketing e creator che producono ${CATEGORY_LABEL[tool.category]} su volumi elevati`);
  else if (tool.targetUsers.includes('business'))
    lines.push(`Aziende che integrano ${CATEGORY_LABEL[tool.category]} in processi ripetibili e scalabili`);
  else if (tool.targetUsers.includes('creator'))
    lines.push(`Creator indipendenti che vivono di ${CATEGORY_LABEL[tool.category]} e non possono permettersi output mediocri`);
  else if (tool.targetUsers.includes('advanced'))
    lines.push(`Utenti esperti che vogliono accesso a parametri avanzati che ${other.name} non espone`);
  else
    lines.push(`Chi lavora su ${CATEGORY_LABEL[tool.category]} con continuità e ha bisogno di uno strumento affidabile`);

  // Line 2: the single strongest quantified advantage over the competitor
  if (hasFreeAdvantage)
    lines.push(`Chi vuole testare prima di pagare: ${tool.name} ha un piano gratuito, ${other.name} parte da $${other.pricing.startingPriceUsd}/mese`);
  else if (isOpenSrc)
    lines.push(`Chi ha zero budget: completamente gratuito, open source, auto-ospitabile su GPU propria`);
  else if (qualDiff >= 0.4)
    lines.push(`Chi prioritizza la qualità dell'output: ${tool.ratings.outputQuality}/5 vs ${other.ratings.outputQuality}/5 — differenza netta, non marginale`);
  else if (easeDiff >= 0.6)
    lines.push(`Chi ha poco tempo: ${tool.ratings.easeOfUse}/5 vs ${other.ratings.easeOfUse}/5 su facilità d'uso — curva di apprendimento incomparabile`);
  else if (tool.ratings.valueForMoney - other.ratings.valueForMoney >= 0.4)
    lines.push(`Chi ottimizza il budget: ${tool.ratings.valueForMoney}/5 vs ${other.ratings.valueForMoney}/5 su valore/prezzo`);

  // Line 3: concrete scenario — derived from category + user profile combination,
  // NOT a raw strengths bullet (which describes the tool, not the user's situation)
  if (tool.category === 'coding' || tool.secondaryCategories?.includes('coding'))
    lines.push(`Completamento di codice, code review e debug quotidiano in un editor reale`);
  else if (tool.category === 'immagini' && !tool.targetUsers.includes('beginner'))
    lines.push(`Campagne visive, copertine, concept art dove il rework su Photoshop deve essere zero`);
  else if (tool.category === 'immagini' && tool.targetUsers.includes('beginner'))
    lines.push(`Post social e materiali marketing che servono in pochi minuti, non in pochi giorni`);
  else if (tool.category === 'scrittura' && tool.targetUsers.includes('business'))
    lines.push(`Copy per landing page, email e campagne: output direttamente pubblicabile, senza riscrittura`);
  else if (tool.category === 'scrittura')
    lines.push(`Blog, newsletter, post: bozza pubblicabile al primo tentativo con revisione minima`);
  else if (tool.category === 'produttivita')
    lines.push(`Automatizzare task ripetitivi — ricerca, report, sintesi — senza scrivere una riga di codice`);
  else if (tool.category === 'video')
    lines.push(`Produzione video senza budget per riprese: dall'idea al clip pronto in meno di 10 minuti`);
  else if (tool.category === 'audio')
    lines.push(`Voiceover, doppiaggio e podcast senza studio: qualità broadcast, costo quasi zero`);
  else
    lines.push(`Scenari dove ${other.name} non è sufficiente e serve uno strumento con più potenza o flessibilità`);

  return lines.slice(0, 3);
}

// ─── Final recommendation ──────────────────────────────────────────────────────

/**
 * Returns a specific CTA clause for a tool vs its competitor.
 * Computed from actual rating diffs — no string parsing of other generated text.
 */
function buildCtaClause(tool: AITool, other: AITool): string {
  const qualDiff  = tool.ratings.outputQuality - other.ratings.outputQuality;
  const easeDiff  = tool.ratings.easeOfUse     - other.ratings.easeOfUse;
  const valDiff   = tool.ratings.valueForMoney - other.ratings.valueForMoney;

  if (qualDiff >= 0.3)
    return `la qualità dell'output è prioritaria (${tool.ratings.outputQuality}/5 vs ${other.ratings.outputQuality}/5)`;
  if (easeDiff >= 0.5)
    return `vuoi lo strumento più immediato da usare (${tool.ratings.easeOfUse}/5 su facilità d'uso)`;
  if (tool.pricing.hasFreeOption && !other.pricing.hasFreeOption)
    return `vuoi testare gratis prima di spendere — ${other.name} non ha piano gratuito`;
  if (tool.pricing.priceRange === 'free')
    return `hai una GPU e vuoi zero costi permanenti`;
  if (valDiff >= 0.4)
    return `stai ottimizzando il budget (${tool.ratings.valueForMoney}/5 vs ${other.ratings.valueForMoney}/5 su valore/prezzo)`;
  // Fallback: the tool's specific primary strength as a concrete condition
  return `hai bisogno di ${tool.strengths[0].toLowerCase().replace(/^[a-z]/, c => c)}`;
}

function buildFinalRecommendation(
  toolA: AITool,
  toolB: AITool,
  overallWinner: AITool | null,
  verdicts: UseCaseVerdict[],
): FinalRecommendation {
  const ctaA = `Usa ${toolA.name} se ${buildCtaClause(toolA, toolB)}`;
  const ctaB = `Prova ${toolB.name} se ${buildCtaClause(toolB, toolA)}`;

  if (overallWinner) {
    const loser     = overallWinner.id === toolA.id ? toolB : toolA;
    const winnerUCs = verdicts.filter(v => v.winner.id === overallWinner.id).map(v => v.useCase);
    const loserUCs  = verdicts.filter(v => v.winner.id === loser.id).map(v => v.useCase);

    const winnerStr = winnerUCs.length > 0
      ? `${overallWinner.name} vince su: ${winnerUCs.join(', ')}.`
      : `${overallWinner.name} ottiene punteggi superiori su più dimensioni.`;

    const exceptionStr = loserUCs.length > 0
      ? `${loser.name} è la scelta corretta se: ${loserUCs.join(' oppure ')}.`
      : `${loser.name} rimane valido se ${buildCtaClause(loser, overallWinner)}.`;

    return { summary: `${winnerStr} ${exceptionStr}`, ctaA, ctaB };
  }

  // Tie: name what each tool specifically wins — not "they're different"
  const aWins = verdicts.filter(v => v.winner.id === toolA.id).map(v => v.useCase);
  const bWins = verdicts.filter(v => v.winner.id === toolB.id).map(v => v.useCase);

  const aSummary = aWins.length
    ? `${toolA.name} vince su: ${aWins.join(', ')}`
    : `${toolA.name} non ha un vantaggio netto in questo confronto`;
  const bSummary = bWins.length
    ? `${toolB.name} vince su: ${bWins.join(', ')}`
    : `${toolB.name} non ha un vantaggio netto in questo confronto`;

  return {
    summary: `${aSummary}. ${bSummary}. Nessun vincitore assoluto: il dato discriminante è il tuo caso d'uso specifico.`,
    ctaA,
    ctaB,
    ctaC: `Non riesci a decidere? Usa l'AI Tool Advisor: 3 domande, 1 risposta precisa →`,
  };
}

// ─── Entry point ───────────────────────────────────────────────────────────────

export function compareTools(toolA: AITool, toolB: AITool): ToolComparison {
  const verdicts = buildUseCaseVerdicts(toolA, toolB);

  const aNetWins = verdicts.filter(v => v.winner.id === toolA.id && v.margin === 'netto').length;
  const bNetWins = verdicts.filter(v => v.winner.id === toolB.id && v.margin === 'netto').length;
  const overallWinner = aNetWins > bNetWins + 1 ? toolA
    : bNetWins > aNetWins + 1 ? toolB
    : null;

  const tldr = buildTldr(toolA, toolB);

  return {
    toolA, toolB,
    slug: `${toolA.id}-vs-${toolB.id}`,
    sameCategory: toolA.category === toolB.category,
    featureMatrix: buildFeatureMatrix(toolA, toolB),
    useCaseVerdicts: verdicts,
    whyNotUse: {
      a: buildWhyNotUse(toolA, toolB),
      b: buildWhyNotUse(toolB, toolA),
    },
    whoShouldUse: {
      a: buildWhoShouldUse(toolA, toolB),
      b: buildWhoShouldUse(toolB, toolA),
    },
    quickVerdict: buildQuickVerdict(toolA, toolB, overallWinner, verdicts),
    overallWinner,
    tldr,
    finalRecommendation: buildFinalRecommendation(toolA, toolB, overallWinner, verdicts),
    ratingDiff: {
      overall:       toolA.ratings.overall       - toolB.ratings.overall,
      easeOfUse:     toolA.ratings.easeOfUse     - toolB.ratings.easeOfUse,
      outputQuality: toolA.ratings.outputQuality - toolB.ratings.outputQuality,
      valueForMoney: toolA.ratings.valueForMoney - toolB.ratings.valueForMoney,
    },
  };
}
