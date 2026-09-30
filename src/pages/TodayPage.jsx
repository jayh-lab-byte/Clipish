import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ClipCard from '../components/ClipCard.jsx';
import ProgressIndicator from '../components/ProgressIndicator.jsx';
import Icon from '../components/Icon.jsx';
import { getProgress, write, PROGRESS_KEY } from '../storage/local.js';
export default function TodayPage({ feed, loading, error, retry, saved, toggleSaved, share, notify }) {
  if (loading) return <main className="loading-page" aria-busy="true" aria-label="Loading today's clips"><div className="skeleton bar"/><div className="clip-layout"><div className="player skeleton"/><div className="metadata"><div className="skeleton line"/><div className="skeleton line wide"/><div className="skeleton line"/></div></div></main>;
  if (error || !feed) return <main className="empty-state"><Icon name="play"/><h1>Today’s clips aren’t available right now.</h1><p>{error || 'Please try again in a moment.'}</p><button onClick={retry}>Try Again</button><Link to="/saved">View Saved Clips</Link></main>;
  return <DailyFeed key={feed.date} {...{ feed, saved, toggleSaved, share, notify }}/>;
}
function DailyFeed({ feed, saved, toggleSaved, share, notify }) {
  const initial = useRef(getProgress(feed.date));
  const [index, setIndex] = useState(initial.current.completed ? 10 : initial.current.currentIndex);
  const root = useRef(null);
  const sections = useRef([]);
  const restored = useRef(false);
  useLayoutEffect(() => {
    const container = root.current;
    const restore = () => { container.scrollTop = sections.current[index]?.offsetTop - container.offsetTop || 0; restored.current = true; };
    restore();
    const resize = new ResizeObserver(() => { container.scrollTop = sections.current[index]?.offsetTop - container.offsetTop || 0; });
    resize.observe(container);
    return () => resize.disconnect();
  }, [index]);
  useEffect(() => {
    if (!write(PROGRESS_KEY, { date: feed.date, currentIndex: Math.min(index, 9), completed: index === 10 })) notify('Progress could not be saved on this device.');
  }, [index, feed.date, notify]);
  const go = next => {
    const target = Math.max(0, Math.min(10, next));
    sections.current[target]?.scrollIntoView({ block: 'start', behavior: 'instant' });
    setIndex(target);
  };
  function onScroll() {
    if (!restored.current) return;
    const container = root.current;
    const target = sections.current.reduce((best, section, i) => {
      const distance = Math.abs(section.offsetTop - container.offsetTop - container.scrollTop);
      return distance < best.distance ? { i, distance } : best;
    }, { i: 0, distance: Infinity });
    // Update only near the snap boundary, avoiding jumps while reading tall cards.
    if (target.distance < 80) setIndex(target.i);
  }
  return <main className="daily-scroll" ref={root} onScroll={onScroll} tabIndex={0} aria-label="Today's ten clips" onKeyDown={e => {
    if (e.target !== e.currentTarget && /BUTTON|A|INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); go(index + (e.key === 'ArrowDown' ? 1 : -1)); }
  }}>
    <span className="sr-only" aria-live="polite">{index === 10 ? '10 / 10. That’s it today.' : `Clip ${index + 1} / 10`}</span>
    {feed.videos.map((video, i) => <article className="clip-page" key={video.id} ref={el => sections.current[i] = el} aria-label={`Clip ${i + 1} of 10`} inert={i !== index ? true : undefined}>
      <ProgressIndicator index={i}/><ClipCard {...{ video, saved: Boolean(saved[video.id]), toggleSaved, share }} index={i} active={index === i} next={() => go(i + 1)}/>
    </article>)}
    <section className="clip-page completion-page" ref={el => sections.current[10] = el} inert={index !== 10 ? true : undefined}>
      <ProgressIndicator index={9} completed/><div className="completion"><div className="check-ring"><Icon name="check"/></div><span className="badge"><i/>10 / 10 clips completed</span><h1>That’s it today.</h1><p>Ten clips are enough.<br/>Come back tomorrow.</p><Link className="button" to="/saved"><Icon name="bookmark"/>Review Saved Clips</Link></div><div className="pause-note"><Icon name="clock"/><div><strong>Next intake available at midnight UTC</strong><p>There is deliberately no clip #11.</p></div></div>
    </section>
  </main>;
}
