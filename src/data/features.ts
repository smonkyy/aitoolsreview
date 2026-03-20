import type { ToolCategory } from './tools';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeatureValue = boolean | 'partial' | string | null;

export interface ToolFeature {
  id: string;
  label: string;
  category: 'pricing' | 'interface' | 'capability' | 'legal';
  description?: string;
}

// ─── Feature definitions ───────────────────────────────────────────────────────

export const COMMON_FEATURES: ToolFeature[] = [
  { id: 'free_plan',        label: 'Piano gratuito',           category: 'pricing',    description: 'Tier gratuito permanente, non solo trial' },
  { id: 'api_access',       label: 'Accesso API',              category: 'interface',  description: 'API pubblica per sviluppatori e integrazioni custom' },
  { id: 'web_app',          label: 'Interfaccia web',          category: 'interface',  description: 'Usabile da browser senza installazione' },
  { id: 'mobile_app',       label: 'App mobile',               category: 'interface',  description: 'App nativa iOS o Android' },
  { id: 'italian_support',  label: 'Supporto italiano',        category: 'capability', description: 'Comprende e risponde in italiano correttamente' },
  { id: 'no_data_training', label: 'Opt-out dal training',     category: 'legal',      description: "I tuoi dati non vengono usati per addestrare il modello" },
];

export const CATEGORY_FEATURES: Partial<Record<ToolCategory, ToolFeature[]>> = {
  scrittura: [
    { id: 'long_form',    label: 'Testi lunghi (5.000+ parole)',     category: 'capability' },
    { id: 'seo_tools',   label: 'Ottimizzazione SEO integrata',      category: 'capability' },
    { id: 'tone_presets',label: 'Preset tono/stile',                 category: 'capability' },
    { id: 'web_search',  label: 'Ricerca web in tempo reale',        category: 'capability' },
  ],
  immagini: [
    { id: 'img2img',      label: 'Image-to-image',                   category: 'capability' },
    { id: 'upscaling',   label: 'Upscaling AI',                     category: 'capability' },
    { id: 'style_presets',label: 'Modelli / stili preimpostati',     category: 'capability' },
    { id: 'commercial_ok',label: 'Licenza commerciale inclusa',      category: 'legal' },
  ],
  video: [
    { id: 'img2video',   label: 'Image-to-video',                   category: 'capability' },
    { id: 'audio_sync',  label: 'Sincronizzazione audio',           category: 'capability' },
    { id: 'long_video',  label: 'Video lunghi (>30 secondi)',       category: 'capability' },
    { id: 'commercial_ok',label: 'Licenza commerciale inclusa',     category: 'legal' },
  ],
  audio: [
    { id: 'voice_cloning',  label: 'Clonazione vocale',             category: 'capability' },
    { id: 'transcription',  label: 'Trascrizione audio',            category: 'capability' },
    { id: 'multilingual',   label: 'Multilingua (incl. italiano)',  category: 'capability' },
    { id: 'commercial_ok',  label: 'Licenza commerciale inclusa',   category: 'legal' },
  ],
  produttivita: [
    { id: 'workflow_automation', label: 'Automazione workflow',     category: 'capability' },
    { id: 'no_code',            label: 'No-code, zero tecnica',     category: 'capability' },
    { id: 'many_integrations',  label: '100+ integrazioni',         category: 'capability' },
    { id: 'ai_native',          label: 'AI-native (non addon)',     category: 'capability' },
  ],
  coding: [
    { id: 'ide_integration', label: 'Integrazione IDE',            category: 'interface' },
    { id: 'autocomplete',    label: 'Autocomplete intelligente',   category: 'capability' },
    { id: 'code_review',     label: 'Code review / spiegazioni',  category: 'capability' },
    { id: 'multi_language',  label: 'Multi-linguaggio',           category: 'capability' },
  ],
};

// ─── Feature values per tool ───────────────────────────────────────────────────
// toolId → { featureId → FeatureValue }
// Valori: true | false | 'partial' | stringa (per campi descrittivi)

export const TOOL_FEATURES: Record<string, Record<string, FeatureValue>> = {

  // ── Scrittura ──────────────────────────────────────────────────────────────

  'claude-4': {
    // common
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: true, no_data_training: 'partial',
    // scrittura
    long_form: true, seo_tools: false, tone_presets: 'partial', web_search: false,
    // coding (secondaria)
    ide_integration: false, autocomplete: false, code_review: true, multi_language: true,
  },

  'chatgpt-4o': {
    free_plan: true, api_access: true, web_app: true, mobile_app: true,
    italian_support: true, no_data_training: 'partial',
    long_form: 'partial', seo_tools: false, tone_presets: false, web_search: true,
    // immagini (secondaria via DALL-E 3)
    img2img: false, upscaling: false, style_presets: false, commercial_ok: true,
  },

  'jasper-ai': {
    free_plan: false, api_access: true, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: 'partial',
    long_form: true, seo_tools: true, tone_presets: true, web_search: false,
  },

  'copy-ai': {
    free_plan: true, api_access: false, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: false,
    long_form: false, seo_tools: false, tone_presets: true, web_search: false,
  },

  'writesonic': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: false,
    long_form: true, seo_tools: true, tone_presets: true, web_search: true,
  },

  'perplexity-ai': {
    free_plan: true, api_access: true, web_app: true, mobile_app: true,
    italian_support: 'partial', no_data_training: false,
    // produttivita (primaria)
    workflow_automation: false, no_code: true, many_integrations: false, ai_native: true,
    // scrittura (secondaria)
    long_form: false, seo_tools: false, tone_presets: false, web_search: true,
  },

  // ── Immagini ───────────────────────────────────────────────────────────────

  'midjourney': {
    free_plan: false, api_access: false, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: false,
    img2img: true, upscaling: true, style_presets: true, commercial_ok: 'partial',
  },

  'adobe-firefly': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: true, no_data_training: true,
    img2img: true, upscaling: true, style_presets: true, commercial_ok: true,
  },

  'dall-e-3': {
    free_plan: false, api_access: true, web_app: true, mobile_app: true,
    italian_support: true, no_data_training: 'partial',
    img2img: false, upscaling: false, style_presets: false, commercial_ok: true,
  },

  'leonardo-ai': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: false,
    img2img: true, upscaling: true, style_presets: true, commercial_ok: 'partial',
  },

  'stable-diffusion': {
    free_plan: true, api_access: true, web_app: false, mobile_app: false,
    italian_support: 'partial', no_data_training: true,
    img2img: true, upscaling: true, style_presets: true, commercial_ok: true,
  },

  // ── Video ──────────────────────────────────────────────────────────────────

  'runway-gen3': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: false,
    img2video: true, audio_sync: false, long_video: false, commercial_ok: 'partial',
  },

  'kling-ai': {
    free_plan: true, api_access: false, web_app: true, mobile_app: false,
    italian_support: false, no_data_training: false,
    img2video: true, audio_sync: 'partial', long_video: true, commercial_ok: false,
  },

  'heygen': {
    free_plan: false, api_access: true, web_app: true, mobile_app: false,
    italian_support: true, no_data_training: false,
    img2video: false, audio_sync: true, long_video: true, commercial_ok: true,
  },

  // ── Audio ──────────────────────────────────────────────────────────────────

  'elevenlabs': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: true, no_data_training: false,
    voice_cloning: 'partial', transcription: false, multilingual: true, commercial_ok: 'partial',
  },

  'whisper': {
    free_plan: true, api_access: true, web_app: false, mobile_app: false,
    italian_support: true, no_data_training: true,
    voice_cloning: false, transcription: true, multilingual: true, commercial_ok: true,
  },

  // ── Produttività ───────────────────────────────────────────────────────────

  'notion-ai': {
    free_plan: false, api_access: false, web_app: true, mobile_app: true,
    italian_support: 'partial', no_data_training: 'partial',
    workflow_automation: false, no_code: true, many_integrations: false, ai_native: false,
  },

  'make': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: true,
    workflow_automation: true, no_code: true, many_integrations: true, ai_native: false,
  },

  'zapier': {
    free_plan: true, api_access: true, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: true,
    workflow_automation: true, no_code: true, many_integrations: true, ai_native: false,
  },

  // ── Coding ─────────────────────────────────────────────────────────────────

  'github-copilot': {
    free_plan: false, api_access: false, web_app: false, mobile_app: false,
    italian_support: true, no_data_training: 'partial',
    ide_integration: true, autocomplete: true, code_review: 'partial', multi_language: true,
  },

  'cursor': {
    free_plan: true, api_access: false, web_app: false, mobile_app: false,
    italian_support: true, no_data_training: 'partial',
    ide_integration: true, autocomplete: true, code_review: true, multi_language: true,
  },

  'replit-ai': {
    free_plan: true, api_access: false, web_app: true, mobile_app: false,
    italian_support: 'partial', no_data_training: false,
    ide_integration: false, autocomplete: true, code_review: false, multi_language: true,
  },
};
