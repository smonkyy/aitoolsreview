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
  category: ToolCategory;
  budget: 'free' | 'paid';
  skill: 'beginner' | 'pro';
}> = [
  // Scrittura
  { label: 'Uso quotidiano senza spendere',   category: 'scrittura',    budget: 'free',  skill: 'beginner' },
  { label: 'Copywriting e marketing',         category: 'scrittura',    budget: 'paid',  skill: 'pro' },
  { label: 'Articoli SEO a lungo termine',    category: 'scrittura',    budget: 'paid',  skill: 'pro' },
  { label: 'Iniziare con l\'AI per scrivere', category: 'scrittura',    budget: 'free',  skill: 'beginner' },
  // Immagini
  { label: 'Generare immagini gratis',        category: 'immagini',     budget: 'free',  skill: 'beginner' },
  { label: 'Produzione visiva professionale', category: 'immagini',     budget: 'paid',  skill: 'pro' },
  { label: 'Design per social e marketing',   category: 'immagini',     budget: 'paid',  skill: 'beginner' },
  // Video
  { label: 'Video brevi gratis',              category: 'video',        budget: 'free',  skill: 'beginner' },
  { label: 'Video professionali a pagamento', category: 'video',        budget: 'paid',  skill: 'pro' },
  // Audio
  { label: 'Text-to-speech gratuito',         category: 'audio',        budget: 'free',  skill: 'beginner' },
  { label: 'Produzione audio professionale',  category: 'audio',        budget: 'paid',  skill: 'pro' },
  // Produttività
  { label: 'Automazioni senza tecnica',       category: 'produttivita', budget: 'free',  skill: 'beginner' },
  { label: 'Workflow aziendali complessi',    category: 'produttivita', budget: 'paid',  skill: 'pro' },
  // Coding
  { label: 'Imparare a programmare con AI',   category: 'coding',       budget: 'free',  skill: 'beginner' },
  { label: 'Sviluppo professionale avanzato', category: 'coding',       budget: 'paid',  skill: 'pro' },
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
      useCase: uc.label,
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
  // Pick top 2 use-case verdicts (already sorted by margin descending)
  const bestForUseCases = verdicts
    .slice(0, 2)
    .map(v => ({ label: v.useCase, tool: v.winner }));

  return {
    bestOverall: overallWinner,
    bestForUseCases,
    bestValue: toolA.ratings.valueForMoney >= toolB.ratings.valueForMoney ? toolA : toolB,
  };
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

  // Line 1: primary user profile — specific, not generic
  if (tool.targetUsers.includes('beginner') && tool.ratings.easeOfUse >= 4.5)
    lines.push(`Chi inizia con l'AI e vuole risultati subito, senza curva di apprendimento`);
  else if (tool.targetUsers.includes('developer'))
    lines.push(`Developer e team tecnici che integrano AI nel proprio workflow`);
  else if (tool.targetUsers.includes('business') && !tool.targetUsers.includes('beginner'))
    lines.push(`Team aziendali che lavorano con ${CATEGORY_LABEL[tool.category]} su scala`);
  else if (tool.targetUsers.includes('creator'))
    lines.push(`Creator e freelance che producono contenuti in ${CATEGORY_LABEL[tool.category]}`);
  else if (tool.targetUsers.includes('advanced'))
    lines.push(`Utenti avanzati che vogliono il massimo controllo e flessibilità`);
  else
    lines.push(`Chi lavora regolarmente con ${CATEGORY_LABEL[tool.category]}`);

  // Line 2: pricing or quality advantage over the other tool
  if (tool.pricing.hasFreeOption && !other.pricing.hasFreeOption)
    lines.push(`Chi vuole testare prima di pagare — il piano gratuito è realmente funzionale`);
  else if (tool.pricing.priceRange === 'free')
    lines.push(`Chi vuole zero costi permanenti (open source, auto-ospitabile)`);
  else if (tool.ratings.valueForMoney - other.ratings.valueForMoney >= 0.4)
    lines.push(`Chi ha un budget limitato e cerca il miglior rapporto qualità/prezzo`);
  else if (tool.ratings.outputQuality - other.ratings.outputQuality >= 0.4)
    lines.push(`Chi non accetta compromessi sulla qualità dell'output`);

  // Line 3: taken directly from the tool's first concrete strength
  if (tool.strengths[0])
    lines.push(tool.strengths[0]);

  return lines.slice(0, 3);
}

// ─── Final recommendation ──────────────────────────────────────────────────────

function buildFinalRecommendation(
  toolA: AITool,
  toolB: AITool,
  overallWinner: AITool | null,
  tldr: { chooseA: string; chooseB: string },
): FinalRecommendation {
  // Strip the imperative opener to get a subordinate clause for CTA lines
  const clauseA = tldr.chooseA.replace(`Scegli ${toolA.name} se `, '').replace(`Scegli ${toolA.name} `, '');
  const clauseB = tldr.chooseB.replace(`Scegli ${toolB.name} se `, '').replace(`Scegli ${toolB.name} `, '');

  const ctaA = `Usa ${toolA.name} se ${clauseA}`;
  const ctaB = `Prova ${toolB.name} se ${clauseB}`;

  if (overallWinner) {
    const loser  = overallWinner.id === toolA.id ? toolB : toolA;
    const clause = loser.id === toolA.id ? clauseA : clauseB;
    return {
      summary: `${overallWinner.name} vince su più scenari concreti — è la scelta sicura per la maggior parte degli utenti. ${loser.name} rimane però la risposta giusta se ${clause}.`,
      ctaA,
      ctaB,
    };
  }

  // Tie: no clear winner
  return {
    summary: `Nessun vincitore assoluto: i due tool eccellono in contesti diversi. Identifica il profilo che ti rappresenta tra i verdetti sopra e scegli di conseguenza.`,
    ctaA,
    ctaB,
    ctaC: `Non sei sicuro? Usa l'AI Tool Advisor: 3 domande, 1 risposta precisa →`,
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
    finalRecommendation: buildFinalRecommendation(toolA, toolB, overallWinner, tldr),
    ratingDiff: {
      overall:       toolA.ratings.overall       - toolB.ratings.overall,
      easeOfUse:     toolA.ratings.easeOfUse     - toolB.ratings.easeOfUse,
      outputQuality: toolA.ratings.outputQuality - toolB.ratings.outputQuality,
      valueForMoney: toolA.ratings.valueForMoney - toolB.ratings.valueForMoney,
    },
  };
}
