import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, CheckCircle, RotateCcw, Zap, ChevronRight, Trophy, Medal, GitCompare } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { rankTools } from '../lib/recommender';

/** Returns the canonical /confronta slug — same ordering as getStaticPaths */
function comparisonUrl(idA, idB) {
  const order = TOOLS.map(t => t.id);
  const iA = order.indexOf(idA);
  const iB = order.indexOf(idB);
  const [first, second] = iA <= iB ? [idA, idB] : [idB, idA];
  return `/confronta/${first}-vs-${second}`;
}

const FLOW = [
  {
    key: 'category',
    message: 'Ciao! Sono il tuo AI Advisor. Cosa vuoi creare o migliorare?',
    options: [
      { value: 'scrittura',    label: '✍️ Testi & Scrittura' },
      { value: 'immagini',     label: '🎨 Immagini & Design' },
      { value: 'video',        label: '🎬 Video & Animazioni' },
      { value: 'produttivita', label: '⚡ Produttività' },
      { value: 'audio',        label: '🎙️ Audio & Voce' },
      { value: 'coding',       label: '💻 Coding & Dev' },
    ],
  },
  {
    key: 'budget',
    message: 'Perfetto. Qual è il tuo budget mensile per gli strumenti AI?',
    options: [
      { value: 'free', label: '🆓 Solo gratuiti / Freemium' },
      { value: 'paid', label: '💎 Sono disposto a pagare' },
    ],
  },
  {
    key: 'skill',
    message: 'Ultimo step: come ti definiresti in ambito AI?',
    options: [
      { value: 'beginner', label: '🐣 Sto iniziando ora' },
      { value: 'pro',      label: '🔥 Uso già strumenti AI' },
    ],
  },
];

const TYPING_DELAY = 1100;
const RESULT_DELAY = 1800;

const RANK_CONFIG = [
  { icon: Trophy, color: '#f59e0b', label: '#1', bg: 'rgba(245,158,11,0.12)' },
  { icon: Medal,  color: '#94a3b8', label: '#2', bg: 'rgba(148,163,184,0.10)' },
  { icon: Medal,  color: '#b45309', label: '#3', bg: 'rgba(180,83,9,0.10)' },
];

/* ─── Sub-components ─────────────────────────────────────────── */

function AIBubble({ text, options, stepIndex, onSelect, disabled }) {
  return (
    <div className="flex items-start gap-2.5" style={{ animation: 'chatFadeIn 0.3s ease both' }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 2,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}
      >
        <Bot size={13} color="white" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
        <div className="ai-bubble">
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{text}</p>
        </div>
        {options && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelect(stepIndex, opt)}
                disabled={disabled}
                className="chip-btn"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'chatFadeIn 0.3s ease both' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          borderRadius: '18px 18px 4px 18px',
          padding: '10px 16px', maxWidth: 240,
          boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
        }}
      >
        <p style={{ fontSize: 14, color: 'white', fontWeight: 600, margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5" style={{ animation: 'chatFadeIn 0.25s ease both' }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}
      >
        <Bot size={13} color="white" />
      </div>
      <div className="ai-bubble" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              style={{
                width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', display: 'block',
                animation: `typingDot 1s ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Score bar component */
function ScoreBar({ score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: score >= 80 ? '#6ee7b7' : score >= 65 ? '#fbbf24' : '#94a3b8',
            borderRadius: 2,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', minWidth: 28 }}>
        {score}%
      </span>
    </div>
  );
}

/* Single ranked tool card */
function RankedToolCard({ rankedTool, rank, onReset }) {
  const { tool, score, explanations, tradeoffs } = rankedTool;
  const cfg = RANK_CONFIG[rank];
  const RankIcon = cfg.icon;
  const isFirst = rank === 0;

  return (
    <div
      style={{
        background: isFirst
          ? 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 60%, #312e81 100%)'
          : 'rgba(255,255,255,0.05)',
        border: isFirst ? 'none' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: isFirst ? 18 : 14,
        padding: isFirst ? 18 : 14,
        color: 'white',
        animation: `resultReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) ${rank * 120}ms both`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <RankIcon size={12} color={cfg.color} />
        <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: '0.08em' }}>
          {cfg.label}
        </span>
        {tool.badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
            background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {tool.badge}
          </span>
        )}
        <div style={{ marginLeft: 'auto', flex: isFirst ? '0 0 140px' : '0 0 120px' }}>
          <ScoreBar score={score} />
        </div>
      </div>

      {/* Tool name + tagline */}
      <h3 style={{
        fontSize: isFirst ? 22 : 16,
        fontWeight: 900,
        margin: '0 0 3px 0',
        letterSpacing: '-0.02em',
      }}>
        {tool.name}
      </h3>
      <p style={{
        fontSize: 12,
        color: isFirst ? '#c7d2fe' : 'rgba(255,255,255,0.55)',
        margin: '0 0 10px 0',
        lineHeight: 1.5,
      }}>
        {tool.tagline}
      </p>

      {/* Explanations (solo sul primo o se è il first) */}
      {(isFirst || explanations.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {explanations.slice(0, isFirst ? 3 : 2).map((exp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <CheckCircle size={11} color="#6ee7b7" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: isFirst ? '#e0e7ff' : 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                {exp}
              </span>
            </div>
          ))}
          {tradeoffs.length > 0 && isFirst && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <span style={{ fontSize: 11, color: '#fcd34d', lineHeight: 1.5 }}>
                {tradeoffs[0]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', gap: 7 }}>
        <a
          href={tool.link}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: isFirst ? 'white' : 'rgba(255,255,255,0.12)',
            color: isFirst ? '#1d4ed8' : 'white',
            fontWeight: 700, fontSize: 12,
            padding: isFirst ? '9px 14px' : '7px 12px',
            borderRadius: 10, textDecoration: 'none',
            border: isFirst ? 'none' : '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {isFirst ? 'Vedi Recensione' : 'Scopri di più'} <ChevronRight size={12} />
        </a>
        {isFirst && (
          <button
            onClick={onReset}
            title="Ricomincia"
            style={{
              padding: '9px 11px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: 10,
              cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* Results container */
function ResultsCard({ results, onReset }) {
  const top2Url = results.length >= 2
    ? comparisonUrl(results[0].tool.id, results[1].tool.id)
    : null;

  return (
    <div style={{ animation: 'chatFadeIn 0.3s ease both' }}>
      {/* Intro bubble */}
      <div className="flex items-start gap-2.5" style={{ marginBottom: 10 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          <Sparkles size={13} color="white" />
        </div>
        <div className="ai-bubble">
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Ho analizzato {TOOLS.length}+ tool per te. Ecco i{' '}
            <strong>migliori {results.length}</strong> in base al tuo profilo:
          </p>
        </div>
      </div>

      {/* Ranked cards */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderRadius: 20, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 10,
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {results.map((r, i) => (
          <RankedToolCard key={r.tool.id} rankedTool={r} rank={i} onReset={onReset} />
        ))}

        {/* Compare top 2 CTA */}
        {top2Url && (
          <a
            href={top2Url}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              marginTop: 4, padding: '10px 14px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12, textDecoration: 'none',
              color: '#a5b4fc', fontWeight: 600, fontSize: 12,
              transition: 'background 0.15s',
            }}
          >
            <GitCompare size={13} />
            Indeciso tra #1 e #2? Confronta {results[0].tool.name} vs {results[1].tool.name} →
          </a>
        )}

        {/* Footer note */}
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '4px 0 0' }}>
          Score calcolato su rilevanza, qualità, budget e livello — senza affiliazioni
        </p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function AIToolFinder() {
  const [messages, setMessages]     = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections]   = useState({});
  const [isTyping, setIsTyping]     = useState(false);
  const [done, setDone]             = useState(false);
  const chatScrollRef = useRef(null);

  const addAIMessage = (text, options = null) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), type: 'ai', text, options }]);
  };

  useEffect(() => {
    const t = setTimeout(() => addAIMessage(FLOW[0].message, FLOW[0].options), 500);
    return () => clearTimeout(t);
  }, []);

  // Scroll interno al container chat
  useEffect(() => {
    const t = setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  const handleSelect = (stepIndex, option) => {
    if (done) return;

    const newSelections = { ...selections, [FLOW[stepIndex].key]: option.value };
    setSelections(newSelections);

    // Disabilita opzioni precedenti, aggiungi bolla utente
    setMessages((prev) =>
      prev
        .map((m) => (m.options ? { ...m, options: null } : m))
        .concat({ id: Date.now() + Math.random(), type: 'user', text: option.label }),
    );

    const nextStep = stepIndex + 1;

    if (nextStep < FLOW.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAIMessage(FLOW[nextStep].message, FLOW[nextStep].options);
        setCurrentStep(nextStep);
      }, TYPING_DELAY);
    } else {
      // Tutte le risposte raccolte → calcola ranking reale
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const results = rankTools(TOOLS, {
          category: newSelections.category,
          budget:   newSelections.budget,
          skill:    newSelections.skill,
        }, 3);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), type: 'results', results },
        ]);
        setDone(true);
      }, RESULT_DELAY);
    }
  };

  const reset = () => {
    setMessages([]);
    setCurrentStep(0);
    setSelections({});
    setIsTyping(false);
    setDone(false);
    setTimeout(() => addAIMessage(FLOW[0].message, FLOW[0].options), 500);
  };

  return (
    <>
      <style>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes resultReveal {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ai-bubble {
          background: var(--ai-bubble-bg, white);
          border: 1px solid var(--ai-bubble-border, #e2e8f0);
          border-radius: 18px 18px 18px 4px;
          padding: 10px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          color: var(--ai-bubble-text, #334155);
        }
        .dark .ai-bubble {
          --ai-bubble-bg: #1e293b;
          --ai-bubble-border: #334155;
          --ai-bubble-text: #e2e8f0;
        }
        .chip-btn {
          padding: 6px 12px;
          font-size: 12px; font-weight: 600;
          border-radius: 999px;
          border: 1.5px solid #bfdbfe;
          background: #eff6ff; color: #1d4ed8;
          cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
        }
        .dark .chip-btn {
          border-color: #1e3a5f; background: #0f172a; color: #93c5fd;
        }
        .chip-btn:hover:not(:disabled) {
          background: #2563eb; border-color: #2563eb; color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(37,99,235,0.25);
        }
        .chip-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>

      <div
        style={{ maxWidth: 540, margin: '0 auto', borderRadius: 20, overflow: 'hidden', border: '1px solid', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        className="border-slate-200 dark:border-slate-700"
      >
        {/* ── Header ── */}
        <div
          className="bg-white dark:bg-slate-900"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid' }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              }}
            >
              <Bot size={18} color="white" />
            </div>
            <span
              style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 9, height: 9, background: '#10b981',
                borderRadius: '50%', border: '2px solid white',
              }}
              className="dark:border-slate-900"
            />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
              AI Tool Advisor
            </p>
            <p style={{ fontSize: 11, color: '#10b981', fontWeight: 600, margin: 0 }}>● Online ora</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }} className="text-slate-400">
            <Zap size={11} />
            <span>{TOOLS.length}+ strumenti analizzati</span>
          </div>
        </div>

        {/* ── Chat area ── */}
        <div
          ref={chatScrollRef}
          className="chat-scroll bg-slate-50 dark:bg-slate-950"
          style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            padding: '18px 16px',
            minHeight: 280, maxHeight: 520,
            overflowY: 'auto',
          }}
        >
          {messages.map((msg) => {
            if (msg.type === 'ai')
              return (
                <AIBubble
                  key={msg.id}
                  text={msg.text}
                  options={msg.options}
                  stepIndex={currentStep}
                  onSelect={handleSelect}
                  disabled={done || isTyping}
                />
              );
            if (msg.type === 'user')
              return <UserBubble key={msg.id} text={msg.text} />;
            if (msg.type === 'results')
              return <ResultsCard key={msg.id} results={msg.results} onReset={reset} />;
            return null;
          })}
          {isTyping && <TypingIndicator />}
        </div>

        {/* ── Footer ── */}
        <div
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          style={{ padding: '10px 18px', borderTop: '1px solid', textAlign: 'center' }}
        >
          <p className="text-slate-400" style={{ fontSize: 11, margin: 0 }}>
            Ranking imparziale · Score calcolato in tempo reale · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
