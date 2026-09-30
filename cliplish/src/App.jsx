import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import Icon from './components/Icon.jsx';
import TodayPage from './pages/TodayPage.jsx';
import SavedPage from './pages/SavedPage.jsx';
import { fetchFeed } from './services/api.js';
import { getSaved, write, SAVED_KEY } from './storage/local.js';
import { today } from './utils/format.js';
function Navigation({ bottom = false }) {
  return <nav className={bottom ? 'bottom-nav' : 'top-nav'} aria-label={bottom ? 'Mobile navigation' : 'Main navigation'}><NavLink to="/" end><Icon name="play"/><span>Today</span></NavLink><NavLink to="/saved"><Icon name="bookmark"/><span>Saved</span></NavLink></nav>;
}
export default function App() {
  const [feed, setFeed] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [saved, setSaved] = useState(getSaved), [message, setMessage] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const controller = useRef(null), toastTimer = useRef(null), feedRef = useRef(null);
  const notify = useCallback(text => { setMessage(text); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setMessage(''), 4500); }, []);
  const load = useCallback(async (force = false) => {
    controller.current?.abort(); controller.current = new AbortController();
    setLoading(true); setError('');
    try { const data = await fetchFeed({ force, signal: controller.current.signal }); feedRef.current = data; setFeed(data); }
    catch (err) { if (err.name === 'AbortError') return; setError(err.message); }
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
    const status = () => { setOnline(navigator.onLine); if (navigator.onLine && feedRef.current?.date !== today()) load(); };
    const dayCheck = () => { if (document.visibilityState === 'visible' && feedRef.current && feedRef.current.date !== today()) load(true); };
    const sync = e => { if (e.key === SAVED_KEY) setSaved(getSaved()); };
    window.addEventListener('online', status); window.addEventListener('offline', status); window.addEventListener('storage', sync);
    document.addEventListener('visibilitychange', dayCheck);
    const timer = setInterval(dayCheck, 30000);
    return () => { controller.current?.abort(); clearTimeout(toastTimer.current); clearInterval(timer); window.removeEventListener('online', status); window.removeEventListener('offline', status); window.removeEventListener('storage', sync); document.removeEventListener('visibilitychange', dayCheck); };
  }, [load]);
  function toggleSaved(video) {
    const next = { ...saved };
    if (next[video.id]) delete next[video.id];
    else next[video.id] = { ...video, savedAt: new Date().toISOString() };
    setSaved(next);
    const stored = write(SAVED_KEY, { videos: next });
    notify(stored ? (next[video.id] ? 'Clip saved' : 'Clip removed') : 'Storage unavailable. Changes will last for this session only.');
  }
  async function share(video) {
    if (!video.youtubeUrl) { notify('This is a design sample. Live clips share their original YouTube link.'); return; }
    try {
      if (navigator.share) { await navigator.share({ title: video.title, url: video.youtubeUrl }); notify('Link shared'); }
      else { await navigator.clipboard.writeText(video.youtubeUrl); notify('Link copied'); }
    } catch (err) { if (err.name !== 'AbortError') notify('Could not share the link. Please try again.'); }
  }
  return <BrowserRouter><a className="skip-link" href="#content">Skip to content</a><header className="app-header"><div><Link className="brand" to="/" aria-label="Cliplish Today"><img src="/assets/cliplish.svg" alt=""/><span>Cliplish</span></Link>{feed?.source === 'mock' && <span className="demo-label">Demo data</span>}<Navigation/></div></header>
    {!online && <div className="offline-notice" role="status">You’re offline. Saved details are available; videos need a connection.</div>}
    <div id="content"><Routes><Route path="/" element={<TodayPage {...{ feed, loading, error, saved, toggleSaved, share, notify }} retry={() => load(true)}/>}/><Route path="/saved" element={<SavedPage {...{ saved, toggleSaved, share }}/>}/><Route path="*" element={<main className="empty-state"><h1>Page not found</h1><Link to="/">Back to Today</Link></main>}/></Routes></div>
    <footer className="app-footer"><div><span>© Cliplish. Focus on what is spoken.</span><span>10 DAILY CLIPS</span></div></footer><Navigation bottom/><div className={`toast ${message ? 'visible' : ''}`} role="status" aria-live="polite">{message}</div>
  </BrowserRouter>;
}
