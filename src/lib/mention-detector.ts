import type { AITool } from '../data/tools';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = haystack.indexOf(needle, pos)) !== -1) {
    count++;
    pos += needle.length;
  }
  return count;
}

/**
 * Build a set of search aliases for a tool.
 * E.g. "ChatGPT-4o" → ["chatgpt-4o", "chatgpt"]
 *      "Whisper (OpenAI)" → ["whisper (openai)", "whisper"]
 *      "GitHub Copilot" → ["github copilot"]          ← multi-word kept as-is
 */
function aliases(tool: AITool): string[] {
  const full = tool.name.toLowerCase();
  const list: string[] = [full];

  // Strip parenthetical suffix: "Whisper (OpenAI)" → "whisper"
  const withoutParens = full.replace(/\s*\(.*?\)/, '').trim();
  if (withoutParens && withoutParens !== full) list.push(withoutParens);

  // First word only — only if it's 5+ chars to avoid generic collisions
  const firstWord = full.split(/[\s(-]/)[0];
  if (firstWord.length >= 5 && firstWord !== withoutParens) list.push(firstWord);

  return [...new Set(list)];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MentionResult {
  tool: AITool;
  count: number;
}

/**
 * Scans raw markdown body and returns all tools mentioned,
 * sorted by mention count descending.
 */
export function detectToolMentions(body: string, tools: AITool[]): MentionResult[] {
  const lower = body.toLowerCase();

  return tools
    .map(tool => ({
      tool,
      count: Math.max(...aliases(tool).map(a => countOccurrences(lower, a))),
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns the two most-mentioned tools if ≥2 are found, else null.
 * These are the candidates for the inline comparison CTA.
 */
export function topMentionedPair(body: string, tools: AITool[]): [AITool, AITool] | null {
  const found = detectToolMentions(body, tools);
  if (found.length < 2) return null;
  return [found[0].tool, found[1].tool];
}
