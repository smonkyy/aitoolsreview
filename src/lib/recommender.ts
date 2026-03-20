import type { AITool, ToolCategory } from '../data/tools';

// ─── Input/Output Types ────────────────────────────────────────────────────────

export interface UserSelections {
  category: ToolCategory;
  budget: 'free' | 'paid';
  skill: 'beginner' | 'pro';
}

export interface RankedTool {
  tool: AITool;
  score: number;            // 0–100, calcolato
  scoreBreakdown: {
    categoryMatch: number;  // 0–1
    quality: number;        // 0–1
    budgetFit: number;      // 0–1
    skillFit: number;       // 0–1
  };
  explanations: string[];   // 2–3 bullet "perché è consigliato"
  tradeoffs: string[];      // 1–2 punti di attenzione
}

// ─── Weights ────────────────────────────────────────────────────────────────────
// Modificabili senza toccare la logica. Devono sommare a 1.
const W = {
  categoryMatch: 0.40,
  quality:       0.25,
  budgetFit:     0.20,
  skillFit:      0.15,
} as const;

// ─── Scoring Functions ──────────────────────────────────────────────────────────

/**
 * Quanto il tool è rilevante per la categoria selezionata dall'utente.
 * Primaria = 1.0, secondaria = 0.55, nessuna = 0.
 */
function getCategoryScore(tool: AITool, category: ToolCategory): number {
  if (tool.category === category) return 1.0;
  if (tool.secondaryCategories?.includes(category)) return 0.55;
  return 0;
}

/**
 * Score qualità normalizzato dalla media dei rating dell'utente.
 * Non usiamo solo "overall" per evitare che un numero gonfiato distorca tutto.
 */
function getQualityScore(tool: AITool): number {
  const { overall, easeOfUse, outputQuality, valueForMoney } = tool.ratings;
  const avg = (overall + outputQuality + easeOfUse * 0.5 + valueForMoney * 0.5) / 3;
  return Math.min(avg / 5, 1);
}

/**
 * Quanto il pricing del tool si allinea con la preferenza dell'utente.
 * - Utente vuole free: premiamo tool free/freemium, penalizziamo paid
 * - Utente è OK con paid: tutti accettabili, bonus per free option
 */
function getBudgetScore(tool: AITool, budget: 'free' | 'paid'): number {
  const { hasFreeOption, priceRange } = tool.pricing;

  if (budget === 'free') {
    if (priceRange === 'free') return 1.0;
    if (hasFreeOption) return 0.75;   // freemium: piano free esiste
    if (priceRange === 'low') return 0.30;  // paid ma economico
    return 0.10;  // paid senza free — fortemente penalizzato
  }

  // budget === 'paid': l'utente è disposto a pagare
  if (hasFreeOption) return 1.0;   // bonus: ha anche free
  if (priceRange === 'low') return 0.95;
  if (priceRange === 'mid') return 0.80;
  if (priceRange === 'high') return 0.65;
  return 0.50;
}

/**
 * Quanto il livello dell'utente corrisponde al target user del tool.
 * beginner → cerca tool adatti a beginner/creator
 * pro → cerca tool per intermediate/advanced/developer/business
 */
function getSkillScore(tool: AITool, skill: 'beginner' | 'pro'): number {
  const { targetUsers } = tool;

  if (skill === 'beginner') {
    if (targetUsers.includes('beginner')) return 1.0;
    if (targetUsers.includes('intermediate') || targetUsers.includes('creator')) return 0.65;
    // Solo advanced/developer → non adatto a beginner
    return 0.25;
  }

  // pro
  if (targetUsers.includes('advanced') || targetUsers.includes('developer')) return 1.0;
  if (targetUsers.includes('intermediate') || targetUsers.includes('business')) return 0.85;
  if (targetUsers.includes('creator')) return 0.70;
  return 0.50;
}

// ─── Explanation Generator ─────────────────────────────────────────────────────

/**
 * Genera bullet point leggibili basati sui dati reali del tool + selezioni utente.
 * Non usiamo stringhe hardcoded per singolo tool — si scala automaticamente.
 */
function buildExplanations(
  tool: AITool,
  selections: UserSelections,
  breakdown: RankedTool['scoreBreakdown'],
): string[] {
  const bullets: string[] = [];

  // Rilevanza categoria
  if (breakdown.categoryMatch === 1.0) {
    bullets.push(`Progettato specificamente per ${categoryLabel(selections.category)}`);
  } else if (breakdown.categoryMatch > 0.5) {
    bullets.push(`Supporta anche ${categoryLabel(selections.category)} come funzionalità chiave`);
  }

  // Budget
  if (selections.budget === 'free' && tool.pricing.hasFreeOption) {
    bullets.push('Piano gratuito disponibile senza carta di credito');
  } else if (selections.budget === 'free' && tool.pricing.priceRange === 'free') {
    bullets.push('Completamente gratuito e open source');
  } else if (selections.budget === 'paid' && tool.pricing.hasFreeOption) {
    bullets.push(`Prova gratuita inclusa, poi da $${tool.pricing.startingPriceUsd}/mese`);
  }

  // Qualità output
  if (tool.ratings.outputQuality >= 4.7) {
    bullets.push('Qualità dell\'output tra le più alte nella categoria');
  } else if (tool.ratings.outputQuality >= 4.2) {
    bullets.push('Output di qualità elevata e affidabile');
  }

  // Facilità d'uso per beginner
  if (selections.skill === 'beginner' && tool.ratings.easeOfUse >= 4.5) {
    bullets.push('Interfaccia intuitiva, nessuna competenza tecnica richiesta');
  }

  // Punti di forza specifici (primo strength rilevante)
  const relevantStrength = tool.strengths.find(s =>
    !bullets.some(b => b.toLowerCase().includes(s.toLowerCase().slice(0, 15)))
  );
  if (relevantStrength && bullets.length < 3) {
    bullets.push(relevantStrength);
  }

  return bullets.slice(0, 3);
}

function buildTradeoffs(tool: AITool, selections: UserSelections): string[] {
  const t: string[] = [];

  // Avvisi budget specifici
  if (selections.budget === 'free' && !tool.pricing.hasFreeOption) {
    t.push(`Nessun piano gratuito — parte da $${tool.pricing.startingPriceUsd}/mese`);
  }

  // Avvisi skill
  if (selections.skill === 'beginner' && tool.ratings.easeOfUse < 3.5) {
    t.push('Richiede competenze tecniche: non ideale per iniziare');
  }

  // Weakness più rilevante non già coperta
  const relevantWeakness = tool.weaknesses[0];
  if (relevantWeakness && t.length < 2) {
    t.push(relevantWeakness);
  }

  return t.slice(0, 2);
}

function categoryLabel(cat: ToolCategory): string {
  const labels: Record<ToolCategory, string> = {
    scrittura: 'scrittura e testi',
    immagini: 'generazione immagini',
    video: 'generazione video',
    audio: 'audio e voce',
    produttivita: 'produttività e automazioni',
    coding: 'scrittura e analisi codice',
  };
  return labels[cat];
}

// ─── Main Ranking Function ─────────────────────────────────────────────────────

/**
 * Prende tutti i tool e le selezioni dell'utente.
 * Restituisce i top N tool con score calcolato, breakdown e spiegazioni.
 * L'affiliazione non è mai letta qui — principio anti-bias garantito.
 */
export function rankTools(
  tools: AITool[],
  selections: UserSelections,
  topN = 3,
): RankedTool[] {
  const results: RankedTool[] = [];

  for (const tool of tools) {
    const categoryMatch = getCategoryScore(tool, selections.category);

    // Escludiamo completamente i tool non rilevanti per la categoria
    if (categoryMatch === 0) continue;

    const quality  = getQualityScore(tool);
    const budgetFit = getBudgetScore(tool, selections.budget);
    const skillFit  = getSkillScore(tool, selections.skill);

    const rawScore =
      W.categoryMatch * categoryMatch +
      W.quality       * quality +
      W.budgetFit     * budgetFit +
      W.skillFit      * skillFit;

    const score = Math.round(rawScore * 100);

    const breakdown = { categoryMatch, quality, budgetFit, skillFit };

    results.push({
      tool,
      score,
      scoreBreakdown: breakdown,
      explanations: buildExplanations(tool, selections, breakdown),
      tradeoffs: buildTradeoffs(tool, selections),
    });
  }

  // Sort decrescente per score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topN);
}
