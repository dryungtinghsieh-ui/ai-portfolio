'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { contextFor } from '@/lib/agent-context.mjs';

type ToolTrace = { id: string; name: string; arguments: unknown; result: unknown; status: string; duration_ms: number };
type Message = { role: 'user' | 'assistant'; content: string; tools?: ToolTrace[] };
const endpoint = process.env.NEXT_PUBLIC_AGENT_ENDPOINT || 'https://personal-ai-agent.dr-yungting-hsieh.workers.dev/api/agent';
const suggestions = [
  { tag: 'RESEARCH', title: 'Explore the research', text: 'Find Dr. Hsieh’s research on low-power neural networks and summarize the key ideas with sources.' },
  { tag: 'CALCULATE', title: 'Work through the numbers', text: 'Use the calculator to find the mean of 12.5, 18.2, 21.8, and 15.5. Explain the result.' },
  { tag: 'TIME', title: 'Try a tool call', text: 'What is the current UTC date and time? Use the time tool.' },
];

function parseTraces(value: unknown): ToolTrace[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).filter((t): t is ToolTrace => Boolean(t && typeof t === 'object' &&
    typeof t.id === 'string' && typeof t.name === 'string' && typeof t.status === 'string' &&
    typeof t.duration_ms === 'number'));
}

function linkedText(text: string) {
  return text.split(/(https:\/\/[^\s<>\[\]()]+[^\s<>\[\]().,;])/g).map((part, i) =>
    part.startsWith('https://')
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
      : part.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g).map((piece, j) =>
        piece.startsWith('**') && piece.endsWith('**') ? <strong key={`${i}-${j}`}>{piece.slice(2, -2)}</strong>
          : piece.startsWith('`') && piece.endsWith('`') ? <code key={`${i}-${j}`}>{piece.slice(1, -1)}</code> : piece));
}

export default function AgentClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const cancelled = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => { controller.current?.abort(); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages, pending, error]);

  async function send(text = input) {
    const message = text.trim();
    if (!message || message.length > 4000 || controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    cancelled.current = false;
    setBusy(true); setPending(message); setInput(''); setError('');
    const timer = setTimeout(() => abort.abort(), 45000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', mode: 'cors', credentials: 'omit', signal: abort.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: contextFor(messages, message) }),
      });
      if (!response.ok) {
        const wait = Number(response.headers.get('Retry-After')) || 60;
        if (response.status === 429) throw new Error(`Too many requests. Please wait ${Math.min(wait, 300)} seconds and try again.`);
        if (response.status === 503) throw new Error('The agent is temporarily unavailable. Please try again later.');
        if (response.status === 504) throw new Error('The request timed out. Please try again.');
        throw new Error('The agent could not complete this request. Please try again.');
      }
      const data = await response.json();
      if (typeof data.answer !== 'string' || !data.answer.trim() || data.answer.length > 12000) throw new Error('The agent returned an invalid answer. Please try again.');
      setMessages(previous => [...previous, { role: 'user', content: message },
        { role: 'assistant', content: data.answer, tools: parseTraces(data.tools_used) }]);
    } catch (err) {
      setInput(message);
      setError(abort.signal.aborted
        ? cancelled.current ? 'Request stopped. Your message is ready to send again.' : 'The request timed out. Your message is ready to send again.'
        : err instanceof TypeError ? 'Unable to reach the agent. Check your connection or try again later.'
        : err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      clearTimeout(timer); controller.current = null; setBusy(false); setPending(''); textArea.current?.focus();
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>YT<span>/</span> Dr. Yung-Ting Hsieh</Link>
        <nav aria-label="Agent navigation"><Link href="/research">Research</Link><Link href="/">Back to portfolio ↗</Link></nav>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.eyebrow}>APPLIED AI / LAB</p>
          <h1>A little curiosity.<br /><span>A capable agent.</span></h1>
          <p className={styles.intro}>Explore my research, work through a calculation, or ask a question. The agent chooses a tool when it needs one.</p>
          <div className={styles.tools}>
            <p className={styles.eyebrow}>AVAILABLE TOOLS</p>
            <div><b>01</b><span>Research catalog<small>Projects, papers &amp; source links</small></span></div>
            <div><b>02</b><span>Numeric calculator<small>Arithmetic, averages &amp; powers</small></span></div>
            <div><b>03</b><span>UTC clock<small>The current date &amp; time</small></span></div>
          </div>
          <p className={styles.note}>Research search covers this website’s catalog. AI answers may contain mistakes; check the sources. Messages are sent to Cloudflare and Groq. Please avoid sharing sensitive information.</p>
          <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className={styles.powered}>Powered by Groq ↗</a>
        </aside>
        <section className={styles.workspace} aria-label="AI conversation">
          <div className={styles.toolbar}>
            <div><span className={styles.dot} />AI Agent<span className={styles.model}>GPT-OSS 120B</span></div>
            <button type="button" disabled={busy || !messages.length} onClick={() => { setMessages([]); setError(''); setInput(''); textArea.current?.focus(); }}>New chat +</button>
          </div>
          <div className={styles.conversation} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
            {!messages.length && !pending && <div className={styles.welcome}>
              <div className={styles.glyph} aria-hidden="true">✳</div>
              <p className={styles.eyebrow}>FROM QUESTION TO EXPLORATION</p>
              <h2>What would you like to discover?</h2>
              <p>Start with an idea, or try one of these.</p>
              <div className={styles.suggestions}>{suggestions.map(s => <button key={s.tag} type="button" disabled={busy} onClick={() => send(s.text)}><small>{s.tag}</small><span>{s.title}<b aria-hidden="true">↗</b></span></button>)}</div>
            </div>}
            {messages.map((m, i) => <article key={i} className={m.role === 'user' ? styles.user : styles.assistant}>
              <div className={styles.messageLabel}>{m.role === 'user' ? 'YOU' : 'AI AGENT'}</div>
              <p className={styles.messageText}>{linkedText(m.content)}</p>
              {!!m.tools?.length && <div className={styles.traceGroup}>{m.tools.map((tool, index) => <details className={styles.trace} key={`${tool.id}-${index}`}>
                <summary><span>{tool.status === 'success' ? '✓' : '!'} {tool.name}</span><small>{tool.status} · {Math.round(tool.duration_ms)} ms</small></summary>
                <p>Arguments</p><pre>{JSON.stringify(tool.arguments, null, 2)}</pre>
                <p>Result</p><pre>{JSON.stringify(tool.result, null, 2)}</pre>
              </details>)}</div>}
            </article>)}
            {pending && <><article className={styles.user}><div className={styles.messageLabel}>YOU</div><p className={styles.messageText}>{pending}</p></article><p className={styles.thinking} role="status">Working through your question…</p></>}
            {error && <p role="alert" className={styles.error}>{error}</p>}
            <div ref={bottom} />
          </div>
          <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send(); }}>
            <label htmlFor="agent-message" className={styles.inputLabel}>Your message</label>
            <textarea id="agent-message" ref={textArea} value={input} disabled={busy} maxLength={4000} rows={3}
              placeholder="Ask about research, run a calculation, follow a thought…"
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
            <div className={styles.composerBottom}><small>{input.length}/4000 <span>· Shift + Enter for a new line</span></small>
              {busy ? <button type="button" className={styles.send} onClick={() => { cancelled.current = true; controller.current?.abort(); }}>Stop ■</button>
                : <button type="submit" className={styles.send} disabled={!input.trim()}>Send ↗</button>}
            </div>
          </form>
          <p className={styles.privacy}>Messages are processed by Cloudflare and Groq. Avoid sensitive information.<br />This tab keeps chat in memory; new chat or refresh clears it.</p>
        </section>
      </div>
    </main>
  );
}
