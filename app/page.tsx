'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';

const agents = [
  { id: 'brand', name: 'Brand Guardian', role: 'Brand Guardian Agent', desc: 'Bewaking merkidentiteit, tone-of-voice en corporate messaging.', color: '#6D5DD3', initial: 'BG', quickActions: ['Nieuwsbericht opstellen', 'Tone-of-voice check', 'Corporate statement'] },
  { id: 'lead', name: 'Lead Generation', role: 'Lead Generation Agent', desc: 'Ontwikkelen van campagnes, lead magnets en landingspagina’s.', color: '#C2652E', initial: 'LG', quickActions: ['Landingspagina opzetten', 'E-mailcampagne', 'Lead magnet ideeën'] },
  { id: 'product', name: 'Product Marketing', role: 'Product Marketing Agent', desc: 'Waardepropositie, featurebeschrijvingen en concurrentie-battlecards.', color: '#1B8F8A', initial: 'PM', quickActions: ['Waardepropositie schrijven', 'Feature beschrijving', 'Concurrentievergelijking'] },
  { id: 'tender', name: 'Tender Intelligence', role: 'Tender Intelligence', desc: 'Volgen van Europese aanbestedingen en genereren concept-inschrijvingen.', color: '#9A6A2E', initial: 'TI', quickActions: ['Concept inschrijving', 'Aanbesteding analyse', 'Kansen detecteren'] },
  { id: 'analytics', name: 'Digital Analytics & CRM', role: 'Digital Analytics & CRM Intelligence', desc: 'SEO, SEA, conversiemeting en commerciële groeistrategie.', color: '#2E5AAC', initial: 'DA', quickActions: ['ICP analyse', 'Conversie optimalisatie', 'CRM segmentatie'] },
  { id: 'content', name: 'Content Creation', role: 'Content Creation Agent', desc: 'Contentkalender beheren, autoriteit opbouwen en MQL’s genereren.', color: '#3F8F5F', initial: 'CC', quickActions: ['Social Media post', 'Blogartikel schrijven', 'Contentkalender ideeën'] },
  { id: 'market', name: 'Market Intelligence', role: 'Market Intelligence Agent', desc: 'Markt- en SWOT-analyses per Product Commercial Unit (PCU).', color: '#B5527A', initial: 'MI', quickActions: ['Battlecard genereren', 'SWOT analyse', 'Concurrentieoverzicht'] },
];

const welcomeSentences = [
  "Laten we aan de slag gaan.",
  "Wat gaan we vandaag bouwen?",
  "Klaar om nieuwe resultaten te boeken?",
  "Welke data gaan we vandaag analyseren?",
  "Tijd om knopen door te hakken."
];

interface Session {
  id: string;
  title: string;
  agentId: string;
  messages: Array<{ role: string; content: string }>;
  createdAt: number;
}

function Sparkline({ values, second = false }: { values: number[]; second?: boolean }) {
  if (!values || values.length === 0) values = [0, 0];
  const max = Math.max(...values, 1), min = Math.min(...values);
  const rangeSpan = max - min === 0 ? 1 : max - min;
  const points = values.map((v, i) => `${(i / (values.length - 1 || 1)) * 100},${88 - ((v - min) / rangeSpan) * 68}`).join(' ');
  return <svg className="spark" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={second ? 'var(--muted)' : 'var(--accent)'} strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

function MessageContent({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, bIdx) => {
        const lines = block.split('\n').filter(l => l.trim().length > 0);
        const isList = lines.length > 0 && lines.every(l => /^[-•]\s+/.test(l.trim()));
        if (isList) {
          return (
            <ul key={bIdx} className="msg-list">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.trim().replace(/^[-•]\s+/, ''), `${bIdx}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bIdx} className="msg-para">
            {lines.map((l, i) => (
              <span key={i}>
                {renderInline(l, `${bIdx}-${i}`)}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="typing-dots">
      <span /><span /><span />
    </span>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function UserIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Overzicht');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const [range, setRange] = useState('30 dagen');
  const [chatInput, setChatInput] = useState('');
  const [welcomeSentence, setWelcomeSentence] = useState(welcomeSentences[0]);

  const [sessions, setSessions] = useState<Session[]>([
    { id: 'sess-1', title: 'Nieuwsbericht opstellen', agentId: 'brand', messages: [], createdAt: Date.now() }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-1');

  const [loadingAgents, setLoadingAgents] = useState<Record<string, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Volledige localStorage initialisatie na mount en voorkom hydratatieverschillen
  useEffect(() => {
    setIsMounted(true);
    
    const savedTab = localStorage.getItem('dentadmin_active_tab');
    if (savedTab) setActiveTab(savedTab);

    const savedAgentId = localStorage.getItem('dentadmin_selected_agent');
    if (savedAgentId) {
      const found = agents.find(a => a.id === savedAgentId);
      if (found) setSelectedAgent(found);
    }

    const savedSessions = localStorage.getItem('dentadmin_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) setSessions(parsed);
      } catch (e) { /* ignore */ }
    }

    const savedSessionId = localStorage.getItem('dentadmin_active_session_id');
    if (savedSessionId) setActiveSessionId(savedSessionId);
  }, []);

  // Sla actieve tab direct op in localStorage bij wijziging
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('dentadmin_active_tab', activeTab);
  }, [activeTab, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (selectedAgent) {
      localStorage.setItem('dentadmin_selected_agent', selectedAgent.id);
    } else {
      localStorage.removeItem('dentadmin_selected_agent');
    }
  }, [selectedAgent, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('dentadmin_chat_sessions', JSON.stringify(sessions));
  }, [sessions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('dentadmin_active_session_id', activeSessionId);
  }, [activeSessionId, isMounted]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  const handleSelectAgent = (agent: typeof agents[0] | null) => {
    setSelectedAgent(agent);
    const agentSessions = sessions.filter(s => s.agentId === (agent ? agent.id : 'general'));
    if (agentSessions.length > 0) {
      setActiveSessionId(agentSessions[0].id);
    } else {
      const newId = 'sess-' + Date.now();
      const newSess: Session = {
        id: newId,
        title: agent ? `Nieuwe ${agent.name} chat` : 'Algemene chat',
        agentId: agent ? agent.id : 'general',
        messages: [],
        createdAt: Date.now()
      };
      setSessions(prev => [newSess, ...prev]);
      setActiveSessionId(newId);
    }
  };

  const createNewSession = () => {
    const agentId = selectedAgent ? selectedAgent.id : 'general';
    const newId = 'sess-' + Date.now();
    const newSess: Session = {
      id: newId,
      title: selectedAgent ? `Sessie ${sessions.filter(s => s.agentId === agentId).length + 1}` : 'Nieuwe sessie',
      agentId: agentId,
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newId);
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== sessionId);
    if (remaining.length === 0) {
      const fallbackId = 'sess-' + Date.now();
      setSessions([{ id: fallbackId, title: 'Nieuwe sessie', agentId: selectedAgent ? selectedAgent.id : 'general', messages: [], createdAt: Date.now() }]);
      setActiveSessionId(fallbackId);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
        const targetAgent = agents.find(a => a.id === remaining[0].agentId);
        if (remaining[0].agentId === 'general') setSelectedAgent(null);
        else if (targetAgent) setSelectedAgent(targetAgent);
      }
    }
  };

  useEffect(() => {
    const randomSentence = welcomeSentences[Math.floor(Math.random() * welcomeSentences.length)];
    setWelcomeSentence(randomSentence);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || { id: 'default', title: 'Nieuwe sessie', agentId: 'general', messages: [] };
  const currentMessages = activeSession.messages || [];
  const isCurrentLoading = loadingAgents[activeSessionId] || false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'Agents') {
      scrollToBottom();
    }
  }, [currentMessages, activeTab, selectedAgent, isCurrentLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [chatInput]);

  const [gaMetrics, setGaMetrics] = useState({ activeUsers: 'Laden...', screenPageViews: 'Laden...', userChange: '+12.4%', viewChange: '+8.1%' });
  const [trafficTrend, setTrafficTrend] = useState<number[]>([]);
  const [viewTrend, setViewTrend] = useState<number[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<any[]>([]);
  const [seoError, setSeoError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        const json = await res.json();
        if (json.success && json.totals?.rows?.[0]) {
          const metricValues = json.totals.rows[0].metricValues;
          setGaMetrics({
            activeUsers: Number(metricValues[0].value).toLocaleString('nl-NL'),
            screenPageViews: Number(metricValues[1].value).toLocaleString('nl-NL'),
            userChange: '+12.4%',
            viewChange: '+8.1%',
          });
          if (json.trend?.rows) {
            setTrafficTrend(json.trend.rows.map((row: any) => Number(row.metricValues[0].value)));
            setViewTrend(json.trend.rows.map((row: any) => Number(row.metricValues[1].value)));
          }
          if (json.pages?.rows) {
            setTopPages(json.pages.rows.map((row: any) => [row.dimensionValues[0].value, row.dimensionValues[1].value, Number(row.metricValues[0].value).toLocaleString('nl-NL'), 'views']));
          }
        }
      } catch (err) { console.error(err); }
    }
    loadAnalytics();
  }, [range]);

  useEffect(() => {
    async function loadSeo() {
      try {
        setSeoError(null);
        const res = await fetch(`/api/seo?range=${range}`);
        const json = await res.json();
        if (json.success && json.rows) {
          setSeoKeywords(json.rows.map((row: any) => [row.keys[0], `positie ${Math.round(row.position)}`, row.clicks.toLocaleString('nl-NL'), `+${Math.round(row.ctr * 100)}%`]));
        } else if (!json.success) { setSeoError(json.error); }
      } catch (err) { setSeoError('NETWERK_FOUT'); }
    }
    loadSeo();
  }, [range]);

  const metrics = [
    { label: 'Actieve gebruikers', value: gaMetrics.activeUsers, change: gaMetrics.userChange, icon: 'chart' },
    { label: 'Paginaweergaves', value: gaMetrics.screenPageViews, change: gaMetrics.viewChange, icon: 'grid' },
    { label: 'Conversieratio', value: '3.2%', change: '+0.4%', icon: 'bot' },
  ];

  async function generateWithRetry(params: any, retries = 3, delay = 2000): Promise<any> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Server error');
        if (retries > 0 && (res.status === 429 || res.status === 503 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('503') || errorMsg.includes('high demand'))) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return generateWithRetry(params, retries - 1, delay * 2);
        }
        throw new Error(errorMsg);
      }
      return data;
    } catch (err: any) {
      if (retries > 0 && (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('503'))) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateWithRetry(params, retries - 1, delay * 2);
      }
      throw err;
    }
  }

  const handleAgentSend = async (e: React.FormEvent | null, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || chatInput;
    if (!promptToSend.trim() || isCurrentLoading) return;

    const userMsg = { role: 'user', content: promptToSend };
    const updatedMessages = [...currentMessages, userMsg];

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const title = s.messages.length === 0 ? (promptToSend.length > 28 ? promptToSend.substring(0, 28) + '...' : promptToSend) : s.title;
        return { ...s, title, messages: updatedMessages };
      }
      return s;
    }));

    if (!customPrompt) setChatInput('');
    setLoadingAgents(prev => ({ ...prev, [activeSessionId]: true }));

    try {
      const payload = selectedAgent ? {
        messages: updatedMessages,
        agentRole: selectedAgent.role,
        agentContext: selectedAgent.desc
      } : {
        messages: updatedMessages,
        agentRole: 'Dentadmin AI Assistant',
        agentContext: 'Algemene assistent voor het Dentadmin platform.'
      };

      const data = await generateWithRetry(payload);
      const finalReply = data.reply;

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...updatedMessages, { role: 'assistant', content: finalReply }] };
        }
        return s;
      }));
    } catch (err: any) {
      let friendlyMessage = err.message || 'Onbekende fout';
      if (friendlyMessage.includes('429') || friendlyMessage.includes('RESOURCE_EXHAUSTED') || friendlyMessage.includes('quota')) {
        friendlyMessage = 'De API-limiet (quota) voor de gratis laag is tijdelijk bereikt (429 Too Many Requests). Wacht even een minuutje of upgrade je Gemini API-plan.';
      }
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...updatedMessages, { role: 'assistant', content: `⚠️ Kan verzoek niet voltooien: ${friendlyMessage}` }] };
        }
        return s;
      }));
    } finally {
      setLoadingAgents(prev => ({ ...prev, [activeSessionId]: false }));
    }
  };

  const deleteMessage = (index: number) => {
    const updated = [...currentMessages];
    updated.splice(index, 1);
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updated } : s));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAgentSend(null);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentAgentId = selectedAgent ? selectedAgent.id : 'general';
  const filteredSessions = sessions.filter(s => s.agentId === currentAgentId);

  // Voorkom server/client mismatch tijdens de initiële render door pas te tonen zodra gemonteerd
  if (!isMounted) {
    return <div className="shell" />;
  }

  return (
    <div className="shell">
      <style>{`        
        .workspace { border-radius: 12px !important; overflow: hidden; }
      `}</style>
      <aside className={mobileNavOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brand-mark" style={{borderRadius: '8px'}}>D</div>
          <div><strong>Dentadmin</strong><span>AI Growth Hub</span></div>
        </div>
        <nav>
          <button className={activeTab === 'Overzicht' ? 'nav-item active' : 'nav-item'} onClick={() => handleTabChange('Overzicht')}><Icon name="grid"/><span>Overzicht</span></button>
          <button className={activeTab === 'Website' ? 'nav-item active' : 'nav-item'} onClick={() => handleTabChange('Website')}><Icon name="chart"/><span>Website & Data</span></button>
          <button className={activeTab === 'SEO' ? 'nav-item active' : 'nav-item'} onClick={() => handleTabChange('SEO')}><Icon name="search"/><span>SEO & Search</span></button>
          <button className={activeTab === 'Agents' ? 'nav-item active' : 'nav-item'} onClick={() => handleTabChange('Agents')}><Icon name="bot"/><span>AI Agents Hub</span> <span className="pill" style={{marginLeft: 'auto', fontSize: '10px', background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: '4px'}}>7</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="connection"><span className="dot"/>Databronnen verbonden<span>3/3</span></div>
        </div>
      </aside>
      <div className={mobileNavOpen ? 'nav-overlay open' : 'nav-overlay'} onClick={() => setMobileNavOpen(false)} />

      <main className="main">
        <header className="topbar">
          <div>
            <button className="mobile-menu-btn" onClick={() => setMobileNavOpen(true)} title="Menu" aria-label="Open menu">
              <MenuIcon />
            </button>
            <div>
              <div className="eyebrow">CGM Performance Platform</div>
              <h1>{activeTab === 'Agents' ? 'Executive AI Agents Workspace' : activeTab === 'Website' ? 'Website & Analytics' : activeTab === 'SEO' ? 'SEO & Search Console' : activeTab}</h1>
            </div>
          </div>
          <div className="top-actions">
            {activeTab !== 'Agents' && (
              <select value={range} onChange={e => setRange(e.target.value)} style={{background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#374151', cursor: 'pointer', outline: 'none'}}>
                <option>7 dagen</option><option>30 dagen</option><option>3 maanden</option>
              </select>
            )}
            <button className="avatar" title="Profiel" style={{borderRadius: '50%'}}><UserIcon size={16}/></button>
          </div>
        </header>

        <section className="content">
          {activeTab === 'Overzicht' && (
            <>
              <div className="hero-row">
                <div><p className="muted">Dentadmin · Alle kanalen · {range}</p><h2>Live prestatie-inzichten</h2></div>
                <div className="updated"><span className="live-dot"/>Live GA4 & Search Console verbonden <span>·</span> {new Date().toLocaleDateString()}</div>
              </div>

              <div className="quicklinks-grid" style={{marginBottom: '24px'}}>
                <div onClick={() => handleTabChange('Agents')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0', transition: 'background 0.2s ease'}}>
                  <div style={{background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '6px'}}><Icon name="bot" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>AI Agents Hub</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Start geautomatiseerde taken</p></div>
                </div>
                <div onClick={() => handleTabChange('SEO')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0', transition: 'background 0.2s ease'}}>
                  <div style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '6px'}}><Icon name="search" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>SEO & Search Console</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Bekijk zoekwoord posities</p></div>
                </div>
                <div onClick={() => handleTabChange('Website')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0', transition: 'background 0.2s ease'}}>
                  <div style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '6px'}}><Icon name="chart" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>Website & Analytics</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Live bezoekers & conversies</p></div>
                </div>
              </div>

              <div className="metric-grid">
                {metrics.map(m => (
                  <div className="metric" key={m.label} style={{borderRadius: '8px'}}>
                    <div className="metric-top"><span>{m.label}</span><Icon name={m.icon}/></div>
                    <strong>{m.value}</strong>
                    <div className="change"><span>↗ {m.change}</span><small>vs. vorige periode</small></div>
                  </div>
                ))}
              </div>

              <div className="grid-2">
                <section className="card chart-card" style={{borderRadius: '8px'}}>
                  <div className="card-head">
                    <div><h3>Website performance</h3><p>Live gebruikers & paginaweergaves trend</p></div>
                    <div className="legend"><span><i/>Gebruikers</span><span><i className="gray"/>Paginaweergaves</span></div>
                  </div>
                  <div className="chart">
                    <div className="ylabels"><span>Max</span><span>75%</span><span>50%</span><span>25%</span><span>Min</span></div>
                    <div className="chart-lines">
                      <div/><div/><div/><div/><div/>
                      <Sparkline values={trafficTrend.length > 0 ? trafficTrend : [0]} />
                      <Sparkline values={viewTrend.length > 0 ? viewTrend : [0]} second />
                    </div>
                  </div>
                </section>

                <section className="card ai-card" style={{cursor: 'pointer', borderRadius: '8px'}} onClick={() => handleTabChange('Agents')}>
                  <div className="ai-head">
                    <div className="ai-icon" style={{borderRadius: '6px'}}><Icon name="bot" size={20}/></div>
                    <div><h3>AI-Model Integratie</h3><p>Schakel over naar Agents</p></div>
                    <span className="pill" style={{borderRadius: '6px'}}>Open Hub →</span>
                  </div>
                  <div className="insight critical" style={{marginTop: '12px', borderRadius: '6px'}}>
                    <span className="insight-icon">!</span>
                    <div>
                      <strong>Proactieve optimalisatiekansen</strong>
                      <p>De live GA4-prestatiedata voedt direct de marketing agents voor gerichte conversieverbetering.</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid-2 lower">
                <section className="card" style={{borderRadius: '8px'}}>
                  <div className="card-head"><div><h3>Top pagina&apos;s</h3><p>Rechtstreeks uit GA4</p></div></div>
                  <div className="table">
                    {topPages.length > 0 ? topPages.map((p, idx) => (
                      <div className="row" key={`${p[1]}-${idx}`}>
                        <div><strong>{p[0]}</strong><span>{p[1]}</span></div>
                        <b>{p[2]}</b>
                        <small style={{color: '#10b981', fontWeight: 600}}>{p[3]}</small>
                      </div>
                    )) : <div style={{padding: '16px', color: '#6b7280', fontSize: '13px'}}>Top pagina&apos;s laden...</div>}
                  </div>
                </section>

                <section className="card" style={{borderRadius: '8px'}}>
                  <div className="card-head"><div><h3>SEO zoekwoorden</h3><p>Rechtstreeks uit Search Console</p></div></div>
                  {seoError === 'GEEN_TOEGANG_SEARCH_CONSOLE' || seoKeywords.length === 0 ? (
                    <div style={{padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px'}}>
                      <div style={{background: '#f1f5f9', color: '#64748b', padding: '10px', borderRadius: '6px', marginBottom: '12px'}}><Icon name="search" size={20}/></div>
                      <h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '4px'}}>Binnenkort beschikbaar</h4>
                      <p style={{fontSize: '12px', color: '#6b7280', maxWidth: '280px', lineHeight: '1.4'}}>De koppeling met Search Console wordt op een later moment toegevoegd.</p>
                    </div>
                  ) : (
                    <div className="table">
                      {seoKeywords.map((k, idx) => (
                        <div className="row keyword" key={`${k[0]}-${idx}`}>
                          <div><strong>{k[0]}</strong><span>{k[1]}</span></div>
                          <b>{k[2]}</b>
                          <small style={{color: '#2563eb', fontWeight: 600}}>{k[3]} ctr</small>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {activeTab === 'Website' && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
              <div className="hero-row">
                <div><p className="muted">Google Analytics 4 · Uitgebreid · {range}</p><h2>Website Traffic & Conversie Analyse</h2></div>
                <div className="updated"><span className="live-dot"/>Live GA4 Verbonden</div>
              </div>

              <div className="quicklinks-grid">
                <div onClick={() => handleTabChange('Agents')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0'}}>
                  <div style={{background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '6px'}}><Icon name="bot" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>AI Agents Hub</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Start geautomatiseerde taken</p></div>
                </div>
                <div onClick={() => handleTabChange('SEO')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0'}}>
                  <div style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '6px'}}><Icon name="search" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>SEO & Search Console</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Bekijk zoekwoord posities</p></div>
                </div>
                <div onClick={() => handleTabChange('Website')} style={{background: '#fff', borderRadius: '8px', borderTop: '3px solid #2563eb', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0'}}>
                  <div style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '6px'}}><Icon name="chart" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>Website & Analytics</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Actief bekeken tab</p></div>
                </div>
              </div>

              <div className="metric-grid">
                {metrics.map(m => (
                  <div className="metric" key={m.label} style={{borderRadius: '8px'}}>
                    <div className="metric-top"><span>{m.label}</span><Icon name={m.icon}/></div>
                    <strong>{m.value}</strong>
                    <div className="change"><span>↗ {m.change}</span><small>vs. vorige periode</small></div>
                  </div>
                ))}
              </div>
              <section className="card chart-card" style={{padding: '24px', borderRadius: '8px'}}>
                <div className="card-head">
                  <div><h3>Verkeerstrend</h3><p>Verloop van actieve gebruikers en paginaweergaves</p></div>
                  <div className="legend"><span><i/>Gebruikers</span><span><i className="gray"/>Paginaweergaves</span></div>
                </div>
                <div className="chart" style={{height: '240px', marginTop: '16px'}}>
                  <div className="ylabels"><span>Max</span><span>75%</span><span>50%</span><span>25%</span><span>Min</span></div>
                  <div className="chart-lines">
                    <div/><div/><div/><div/><div/>
                    <Sparkline values={trafficTrend.length > 0 ? trafficTrend : [0]} />
                    <Sparkline values={viewTrend.length > 0 ? viewTrend : [0]} second />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'SEO' && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
              <div className="hero-row">
                <div><p className="muted">Google Search Console · Zoekwoordprestaties · {range}</p><h2>SEO Zoekwoorden & Posities</h2></div>
                <div className="updated"><span className="live-dot" style={{ background: '#94a3b8' }}/>Binnenkort beschikbaar</div>
              </div>

              <div className="quicklinks-grid">
                <div onClick={() => handleTabChange('Agents')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0'}}>
                  <div style={{background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '10px', borderRadius: '6px'}}><Icon name="bot" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>AI Agents Hub</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Start geautomatiseerde taken</p></div>
                </div>
                <div onClick={() => handleTabChange('SEO')} style={{background: '#fff', borderRadius: '8px', borderTop: '3px solid #10b981', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0'}}>
                  <div style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '6px'}}><Icon name="search" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>SEO & Search Console</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Actief bekeken tab</p></div>
                </div>
                <div onClick={() => handleTabChange('Website')} style={{background: '#fff', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #e2e8f0'}}>
                  <div style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '6px'}}><Icon name="chart" size={20}/></div>
                  <div><h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px'}}>Website & Analytics</h4><p style={{fontSize: '12px', color: '#6b7280'}}>Live bezoekers & conversies</p></div>
                </div>
              </div>

              <section className="card" style={{padding: '24px', borderRadius: '8px'}}>
                <div className="card-head"><div><h3>Zoekwoorden Overzicht</h3><p>Live rankings, klikken en CTR</p></div></div>
                {seoError === 'GEEN_TOEGANG_SEARCH_CONSOLE' || seoKeywords.length === 0 ? (
                  <div style={{padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px'}}>
                    <div style={{background: '#f1f5f9', color: '#64748b', padding: '10px', borderRadius: '6px', marginBottom: '12px'}}><Icon name="search" size={20}/></div>
                    <h4 style={{fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '4px'}}>Binnenkort beschikbaar</h4>
                    <p style={{fontSize: '12px', color: '#6b7280', maxWidth: '280px', lineHeight: '1.4'}}>De koppeling met Search Console wordt op een later moment toegevoegd.</p>
                  </div>
                ) : (
                  <div className="table" style={{marginTop: '16px'}}>
                    {seoKeywords.map((k, idx) => (
                      <div className="row keyword" key={`${k[0]}-${idx}`}>
                        <div><strong>{k[0]}</strong><span>{k[1]}</span></div>
                        <b>{k[2]} klikken</b>
                        <small style={{color: '#2563eb', fontWeight: 600}}>{k[3]} CTR</small>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'Agents' && (
            <div className="workspace" style={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
              <style>{`
                .workspace { display: flex; flex-direction: column; height: 84vh; background: #fff; overflow: hidden; }
                
                .agent-tabs-bar { background: #0B1220; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; flex-shrink: 0; width: 100%; border-top-left-radius: 12px; border-top-right-radius: 12px; overflow: hidden; }
                .agent-tab-item { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 10px; cursor: pointer; border: none; background: transparent; text-align: left; min-width: 0; border-bottom: 3px solid transparent; transition: background 0.15s, border-color 0.15s; }
                .agent-tab-item:hover { background: rgba(255,255,255,0.05); }
                .agent-tab-item.active { background: rgba(255,255,255,0.1); border-bottom-color: var(--tab-color, #2563eb); }
                .agent-tab-avatar { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; border-radius: 6px; }
                .agent-tab-info { min-width: 0; flex: 1; overflow: hidden; }
                .agent-tab-info strong { display: block; font-size: 11.5px; color: #F8FAFC; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .agent-tab-info span { display: block; font-size: 10px; color: #94A3B8; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .workspace-body { display: flex; flex: 1; overflow: hidden; }

                /* Rechter sessie sidebar */
                .session-sidebar { width: 240px; background: #F8FAFC; border-left: 1px solid #E2E8F0; display: flex; flex-direction: column; flex-shrink: 0; }
                .session-sidebar-header { padding: 14px 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; }
                .session-sidebar-header h4 { font-size: 12.5px; font-weight: 700; color: #334155; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
                .new-session-btn { background: #0F172A; color: #fff; border: none; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.15s; }
                .new-session-btn:hover { background: #1E293B; }
                .session-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
                .session-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; border-radius: 6px; cursor: pointer; border: 1px solid transparent; background: transparent; transition: all 0.15s; text-align: left; width: 100%; }
                .session-item:hover { background: #F1F5F9; border-color: #E2E8F0; }
                .session-item.active { background: #fff; border-color: #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
                .session-title { font-size: 12.5px; font-weight: 600; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; margin-right: 8px; }
                .session-item.active .session-title { color: #0F172A; }
                .session-del { background: none; border: none; color: #94A3B8; cursor: pointer; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
                .session-del:hover { color: #DC2626; background: #FEE2E2; }

                .chatpane { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #fff; overflow: hidden; }
                .chat-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 26px; border-bottom: 1px solid #EDF2F7; background: #FAFBFC; }
                .chat-header h3 { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 2px; display: flex; align-items: center; gap: 8px; }
                .chat-header p { font-size: 12px; color: #64748B; margin: 0; }
                .model-badge { font-size: 11.5px; color: #475569; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; padding: 5px 12px; font-weight: 600; }

                .quickbar { display: flex; gap: 8px; padding: 10px 26px; border-bottom: 1px solid #EDF2F7; flex-wrap: wrap; align-items: center; background: #fff; }
                .quickbar span.label { font-size: 11.5px; color: #94A3B8; margin-right: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .chip { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 5px 12px; font-size: 12px; color: #334155; cursor: pointer; font-weight: 500; transition: all 0.15s; }
                .chip:hover { border-color: #94A3B8; color: #0F172A; background: #F1F5F9; }

                .messages { flex: 1; overflow-y: auto; padding: 24px 26px; display: flex; flex-direction: column; gap: 18px; background: linear-gradient(180deg, #F8FAFC 0%, #EDF2F7 100%); }
                .empty-chat { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: #64748B; gap: 8px; }
                .empty-chat h2 { font-size: 22px; font-weight: 600; color: #0F172A; margin: 0; }
                .empty-chat p { font-size: 13.5px; max-width: 360px; margin: 0; line-height: 1.5; }

                .msg-row { display: flex; gap: 12px; align-items: flex-start; max-width: 82%; animation: msgIn 0.25s ease; position: relative; }
                .msg-row.user { align-self: flex-end; flex-direction: row-reverse; }
                .msg-row.assistant { align-self: flex-start; }
                .msg-avatar { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; border-radius: 50%; }
                .bubble { padding: 13px 17px; font-size: 14px; line-height: 1.6; position: relative; border-radius: 12px; }
                
                .bubble.user { background: #E2E8F0; color: #1E293B; border-top-right-radius: 2px; }
                .bubble.assistant { background: #fff; border: 1px solid #E7EBF0; border-left: 3px solid var(--agent-color, #2563eb); border-top-left-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .msg-para { margin: 0 0 8px; }
                .msg-para:last-child { margin-bottom: 0; }
                .msg-list { margin: 0 0 8px; padding-left: 18px; }
                .msg-list:last-child { margin-bottom: 0; }
                .msg-meta { margin-top: 12px; padding-top: 9px; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
                .msg-meta span { font-size: 11px; color: #94A3B8; font-weight: 500; }
                .msg-actions { display: flex; align-items: center; gap: 8px; }
                .copy-btn, .delete-btn { background: none; border: none; color: #94A3B8; font-size: 11.5px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 4px; transition: color 0.15s, background 0.15s; }
                .copy-btn:hover { color: #334155; background: #F1F5F9; }
                .copy-btn.copied { color: #16A34A; }
                .delete-btn:hover { color: #DC2626; background: #FEF2F2; }

                .typing-dots { display: inline-flex; gap: 3px; align-items: center; }
                .typing-dots span { width: 5px; height: 5px; background: #94A3B8; border-radius: 50%; animation: dotPulse 1.2s infinite ease-in-out; }
                .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
                .typing-dots span:nth-child(3) { animation-delay: 0.3s; }

                .composer { display: flex; gap: 10px; padding: 16px 26px; background: #fff; border-top: 1px solid #E2E8F0; align-items: flex-end; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
                .composer textarea { flex: 1; resize: none; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 11px 16px; color: #0F172A; font-size: 14px; font-family: inherit; outline: none; line-height: 1.5; max-height: 160px; transition: border-color 0.15s; }
                .composer textarea:focus { border-color: #94A3B8; }
                .send-btn { background: #0F172A; color: #fff; border: none; border-radius: 8px; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
                .send-btn:hover:not(:disabled) { background: #1E293B; }
                .send-btn:disabled { background: #CBD5E1; cursor: not-allowed; }

                @keyframes msgIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes dotPulse { 0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); } 30% { opacity: 1; transform: scale(1); } }

                @media (max-width: 700px) {
                  .workspace { height: calc(100vh - 150px); border-radius: 8px !important; }
                  .workspace-body { flex-direction: column; }
                  .session-sidebar { width: 100%; height: 140px; border-left: none; border-top: 1px solid #E2E8F0; order: 2; }
                  .session-list { flex-direction: row; overflow-x: auto; overflow-y: hidden; }
                  .session-item { flex: 0 0 auto; min-width: 140px; }
                  .chatpane { order: 1; min-height: 0; }
                  .chat-header { padding: 12px 16px; }
                  .chat-header p { display: none; }
                  .quickbar { padding: 8px 16px; }
                  .messages { padding: 16px; }
                  .composer { padding: 12px 16px; }
                  .msg-row { max-width: 92%; }
                }
              `}</style>

              <div className="agent-tabs-bar">
                <button
                  className={!selectedAgent ? 'agent-tab-item active' : 'agent-tab-item'}
                  style={{ ['--tab-color' as any]: '#2563eb' }}
                  onClick={() => handleSelectAgent(null)}
                >
                  <div className="agent-tab-avatar" style={{ background: '#2563eb' }}>D</div>
                  <div className="agent-tab-info">
                    <strong>Algemeen</strong>
                    <span>Dentadmin AI</span>
                  </div>
                </button>

                {agents.map(ag => {
                  const isSelected = selectedAgent?.id === ag.id;
                  const isBusy = sessions.some(s => s.agentId === ag.id && loadingAgents[s.id]);
                  return (
                    <button
                      key={ag.id}
                      className={isSelected ? 'agent-tab-item active' : 'agent-tab-item'}
                      style={{ ['--tab-color' as any]: ag.color }}
                      onClick={() => handleSelectAgent(ag)}
                    >
                      <div className="agent-tab-avatar" style={{ background: ag.color }}>{ag.initial}</div>
                      <div className="agent-tab-info">
                        <strong>{ag.name}</strong>
                        <span>{isBusy ? 'Bezig...' : ag.role.replace(' Agent', '')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="workspace-body">
                <div className="chatpane">
                  <div className="chat-header">
                    <div>
                      <h3>
                        <span style={{width: '10px', height: '10px', background: selectedAgent ? selectedAgent.color : '#2563eb', display: 'inline-block', borderRadius: '2px'}}></span>
                        {selectedAgent ? selectedAgent.role : 'Dentadmin Central AI Workspace'}
                      </h3>
                      <p>{selectedAgent ? selectedAgent.desc : 'Stel direct je vragen aan de centrale assistent zonder actieve agent.'}</p>
                    </div>
                    <span className="model-badge">Gemini 3.6 Flash</span>
                  </div>

                  {selectedAgent && (
                    <div className="quickbar">
                      <span className="label">Snelle acties:</span>
                      {selectedAgent.quickActions.map(qa => (
                        <button key={qa} className="chip" onClick={() => handleAgentSend(null, `Voer als ${selectedAgent.role} de volgende taak uit: ${qa}.`)}>⚡ {qa}</button>
                      ))}
                    </div>
                  )}

                  <div className="messages">
                    {currentMessages.length === 0 && !isCurrentLoading ? (
                      <div className="empty-chat">
                        <h2>{selectedAgent ? welcomeSentence : "Waar kan ik je vandaag mee helpen?"}</h2>
                        <p>{selectedAgent ? `Selecteer hierboven een snelle actie of typ hieronder direct je opdracht in voor ${selectedAgent.name}.` : "Typ hieronder je vraag of instructie en de AI assistent staat direct voor je klaar."}</p>
                      </div>
                    ) : (
                      currentMessages.map((msg, idx) => (
                        <div key={idx} className={`msg-row ${msg.role}`}>
                          <div
                            className="msg-avatar"
                            style={{ background: msg.role === 'user' ? '#0F172A' : (selectedAgent ? selectedAgent.color : '#2563eb') }}
                          >
                            {msg.role === 'user' ? <UserIcon size={14}/> : (selectedAgent ? selectedAgent.initial : 'D')}
                          </div>

                          <div className={`bubble ${msg.role}`} style={msg.role === 'assistant' ? ({ ['--agent-color' as any]: selectedAgent ? selectedAgent.color : '#2563eb' }) : undefined}>
                            <MessageContent text={msg.content} />

                            <div className="msg-meta">
                              <span>{msg.role === 'user' ? 'Jij' : (selectedAgent ? selectedAgent.name : 'Dentadmin AI')}</span>
                              <div className="msg-actions">
                                {msg.role === 'assistant' && (
                                  <button
                                    className={copiedIndex === idx ? 'copy-btn copied' : 'copy-btn'}
                                    onClick={() => copyToClipboard(msg.content, idx)}
                                  >
                                    {copiedIndex === idx ? <><CheckIcon /> Gekopieerd</> : <><CopyIcon /> Kopieer</>}
                                  </button>
                                )}
                                <button className="delete-btn" onClick={() => deleteMessage(idx)} title="Verwijder bericht">
                                  <TrashIcon /> Wis bericht
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {isCurrentLoading && (
                      <div className="msg-row assistant">
                        <div className="msg-avatar" style={{ background: selectedAgent ? selectedAgent.color : '#2563eb' }}>{selectedAgent ? selectedAgent.initial : 'D'}</div>
                        <div className="bubble assistant" style={{ ['--agent-color' as any]: selectedAgent ? selectedAgent.color : '#2563eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <TypingDots />
                          <span style={{ color: '#64748B', fontSize: '13px' }}>{selectedAgent ? `${selectedAgent.name} is aan het formuleren…` : 'Dentadmin AI denkt na…'}</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form className="composer" onSubmit={e => handleAgentSend(e)}>
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder={selectedAgent ? `Typ een strategische opdracht voor ${selectedAgent.name}… (Enter om te versturen)` : `Typ je vraag voor Dentadmin AI… (Enter om te versturen)`}
                    />
                    <button type="submit" className="send-btn" disabled={isCurrentLoading || !chatInput.trim()} title="Versturen">
                      <SendIcon />
                    </button>
                  </form>
                </div>

                <div className="session-sidebar">
                  <div className="session-sidebar-header">
                    <h4>Sessies</h4>
                    <button className="new-session-btn" onClick={createNewSession} title="Nieuwe sessie starten">
                      <PlusIcon /> Nieuw
                    </button>
                  </div>
                  <div className="session-list">
                    {filteredSessions.map(sess => (
                      <div
                        key={sess.id}
                        className={sess.id === activeSessionId ? 'session-item active' : 'session-item'}
                        onClick={() => setActiveSessionId(sess.id)}
                      >
                        <span className="session-title" title={sess.title}>{sess.title}</span>
                        <button className="session-del" onClick={e => deleteSession(e, sess.id)} title="Verwijder sessie">
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}