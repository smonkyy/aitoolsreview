import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, CheckCircle, ExternalLink, RotateCcw, Zap } from 'lucide-react';

const TOOLS_DB = [
  {
    id: 1,
    name: 'Claude 4',
    category: 'scrittura',
    budget: 'free',
    skill: 'pro',
    link: '/blog/claude-4',
    desc: 'Il re della scrittura creativa e del codice. Ragionamento profondo, risposte precise.',
    match: 98,
    badge: 'Top Pick',
  },
  {
    id: 2,
    name: 'ChatGPT-4o',
    category: 'scrittura',
    budget: 'paid',
    skill: 'beginner',
    link: '/blog/chatgpt-vs-claude',
    desc: "L'assistente tuttofare più versatile. Interfaccia semplice, risultati affidabili.",
    match: 95,
    badge: 'Più Usato',
  },
  {
    id: 3,
    name: 'Midjourney',
    category: 'immagini',
    budget: 'paid',
    skill: 'pro',
    link: '/blog/midjourney-recensione',
    desc: 'Qualità cinematografica imbattibile. Lo standard del settore per i professionisti.',
    match: 97,
    badge: 'Qualità Pro',
  },
  {
    id: 4,
    name: 'Leonardo.ai',
    category: 'immagini',
    budget: 'free',
    skill: 'beginner',
    link: '/strumenti#immagini',
    desc: 'Ottimo compromesso tra potenza e facilità. Crediti gratuiti generosi.',
    match: 94,
    badge: 'Best Free',
  },
  {
    id: 5,
    name: 'Runway Gen-3',
    category: 'video',
    budget: 'paid',
    skill: 'pro',
    link: '/blog/video-ai',
    desc: 'Il futuro del cinema generativo. Qualità Hollywood a portata di click.',
    match: 96,
    badge: 'Innovativo',
  },
  {
    id: 6,
    name: 'Canva Magic Edit',
    category: 'immagini',
    budget: 'free',
    skill: 'beginner',
    link: '/strumenti',
    desc: 'Perfetto per grafiche veloci senza stress. Curva di apprendimento quasi nulla.',
    match: 91,
    badge: 'Facile',
  },
  {
    id: 7,
    name: 'Kling AI',
    category: 'video',
    budget: 'free',
    skill: 'beginner',
    link: '/strumenti#video',
    desc: 'La sorpresa cinese che sfida Runway. Piano gratuito generoso per iniziare.',
    match: 89,
    badge: 'Rising Star',
  },
  {
    id: 8,
    name: 'Notion AI',
    category: 'produttività',
    budget: 'paid',
    skill: 'beginner',
    link: '/strumenti#produttivita',
    desc: 'AI integrata nel tuo workspace. Riassunti, brainstorming e organizzazione.',
    match: 92,
    badge: 'All-in-One',
  },
  {
    id: 9,
    name: 'Perplexity AI',
    category: 'produttività',
    budget: 'free',
    skill: 'pro',
    link: '/strumenti#produttivita',
    desc: 'Il motore di ricerca AI per professionisti. Fonti citate, zero allucinazioni.',
    match: 93,
    badge: 'Research',
  },
];

const FLOW = [
  {
    key: 'category',
    message: 'Ciao! Sono il tuo AI Advisor. Cosa vuoi creare o migliorare?',
    options: [
      { value: 'scrittura', label: '✍️ Testi & Scrittura' },
      { value: 'immagini', label: '🎨 Immagini & Design' },
      { value: 'video', label: '🎬 Video & Animazioni' },
      { value: 'produttività', label: '⚡ Produttività' },
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
      { value: 'pro', label: '🔥 Uso già strumenti AI' },
    ],
  },
];

const TYPING_DELAY = 1100;
const RESULT_DELAY = 2000;

function findMatch(sel) {
  return (
    TOOLS_DB.find(
      (t) => t.category === sel.category && t.budget === sel.budget && t.skill === sel.skill,
    ) ||
    TOOLS_DB.find(
      (t) => t.category === sel.category && (t.budget === sel.budget || t.budget === 'free'),
    ) ||
    TOOLS_DB.find((t) => t.category === sel.category) ||
    TOOLS_DB[0]
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function AIBubble({ text, options, stepIndex, onSelect, disabled }) {
  return (
    <div className="flex items-start gap-2.5" style={{ animation: 'chatFadeIn 0.3s ease both' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}
      >
        <Bot size={13} color="white" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 280 }}>
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
    <div style={{ display: 'flex', justifyContent: 'flex-end' }} style={{ animation: 'chatFadeIn 0.3s ease both' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          borderRadius: '18px 18px 4px 18px',
          padding: '10px 16px',
          maxWidth: 240,
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
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
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
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#94a3b8',
                display: 'block',
                animation: `typingDot 1s ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, onReset }) {
  return (
    <div style={{ animation: 'resultReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 60%, #312e81 100%)',
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 20px 40px rgba(37,99,235,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
          color: 'white',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <CheckCircle size={14} color="#6ee7b7" />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a5b4fc' }}>
            Match Trovato
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 700,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '2px 10px',
            }}
          >
            {result.match}% match
          </span>
        </div>

        {/* Badge */}
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: 'rgba(110,231,183,0.2)',
              color: '#6ee7b7',
              padding: '2px 8px',
              borderRadius: 20,
              border: '1px solid rgba(110,231,183,0.3)',
            }}
          >
            {result.badge}
          </span>
        </div>

        {/* Tool name */}
        <h3 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          {result.name}
        </h3>
        <p style={{ fontSize: 13, color: '#c7d2fe', lineHeight: 1.6, margin: '0 0 16px 0' }}>
          {result.desc}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={result.link}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'white',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: 13,
              padding: '10px 16px',
              borderRadius: 12,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
          >
            Vedi Recensione <ExternalLink size={13} />
          </a>
          <button
            onClick={onReset}
            title="Ricomincia"
            style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function AIToolFinder() {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  const addAIMessage = (text, options = null) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), type: 'ai', text, options }]);
  };

  // Boot sequence
  useEffect(() => {
    const t = setTimeout(() => addAIMessage(FLOW[0].message, FLOW[0].options), 500);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  const handleSelect = (stepIndex, option) => {
    if (done) return;

    // Disable options on current AI message, add user bubble
    setMessages((prev) =>
      prev
        .map((m) => (m.options ? { ...m, options: null } : m))
        .concat({ id: Date.now() + Math.random(), type: 'user', text: option.label }),
    );

    const newSelections = {};
    // Reconstruct selections from messages + current choice
    const userMessages = messages.filter((m) => m.type === 'user');
    userMessages.forEach((m, i) => {
      const step = FLOW[i];
      const match = step.options.find((o) => o.label === m.text);
      if (match) newSelections[step.key] = match.value;
    });
    newSelections[FLOW[stepIndex].key] = option.value;

    const nextStep = stepIndex + 1;

    if (nextStep < FLOW.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAIMessage(FLOW[nextStep].message, FLOW[nextStep].options);
        setCurrentStep(nextStep);
      }, TYPING_DELAY);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const result = findMatch(newSelections);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), type: 'result', result },
        ]);
        setDone(true);
      }, RESULT_DELAY);
    }
  };

  const reset = () => {
    setMessages([]);
    setCurrentStep(0);
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
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
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
          font-size: 12px;
          font-weight: 600;
          border-radius: 999px;
          border: 1.5px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .dark .chip-btn {
          border-color: #1e3a5f;
          background: #0f172a;
          color: #93c5fd;
        }
        .chip-btn:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(37,99,235,0.25);
        }
        .chip-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>

      <div
        style={{
          maxWidth: 520,
          margin: '0 auto',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
        className="border-slate-200 dark:border-slate-700"
      >
        {/* ── Header ── */}
        <div
          className="bg-white dark:bg-slate-900"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              }}
            >
              <Bot size={18} color="white" />
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: 1,
                right: 1,
                width: 9,
                height: 9,
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid white',
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
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
            className="text-slate-400"
          >
            <Zap size={11} />
            <span>30+ strumenti</span>
          </div>
        </div>

        {/* ── Chat area ── */}
        <div
          className="chat-scroll bg-slate-50 dark:bg-slate-950"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: '18px 16px',
            minHeight: 260,
            maxHeight: 400,
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
            if (msg.type === 'user') return <UserBubble key={msg.id} text={msg.text} />;
            if (msg.type === 'result')
              return <ResultCard key={msg.id} result={msg.result} onReset={reset} />;
            return null;
          })}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* ── Footer ── */}
        <div
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          style={{
            padding: '10px 18px',
            borderTop: '1px solid',
            textAlign: 'center',
          }}
        >
          <p className="text-slate-400" style={{ fontSize: 11, margin: 0 }}>
            Database aggiornato · {new Date().getFullYear()} · Consigli imparziali
          </p>
        </div>
      </div>
    </>
  );
}
