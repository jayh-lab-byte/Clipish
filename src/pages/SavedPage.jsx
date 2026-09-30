import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import YouTubePlayer from '../components/YouTubePlayer.jsx';
import { Actions, Metadata } from '../components/ClipCard.jsx';
import { duration, views, relativeDate } from '../utils/format.js';
export default function SavedPage({ saved, toggleSaved, share }) {
  const videos = Object.values(saved).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);
  return <main className="saved-page"><div className="saved-heading"><div><div className="title-row"><h1>Saved</h1><span className="badge">{videos.length} Clips</span></div><p>Clips you saved to watch again.</p></div><span className="sort-label">↓ Recent</span></div>
    {!videos.length ? <div className="empty-state"><Icon name="bookmark"/><h2>Nothing saved yet.</h2><p>Save clips you want to watch again.</p><Link className="button" to="/">Watch Today’s Clips</Link></div> : <><div className="saved-grid">{videos.map(video => <article className="saved-card" key={video.id}><button className="thumbnail-button" onClick={() => setSelected(video)} aria-label={`Watch ${video.title}`}><img src={video.thumbnailUrl} alt="" loading="lazy"/><span className="badge">{video.contentType} · {duration(video.durationSeconds)}</span></button><div className="saved-content"><button className="title-button" onClick={() => setSelected(video)}><h2>{video.title}</h2></button><p>{video.channelTitle}<br/><span>{views(video.viewCount)} · {relativeDate(video.publishedAt)}</span></p><button className="saved remove-button" onClick={() => toggleSaved(video)} aria-label={`Remove ${video.title} from saved`}><Icon name="bookmark" filled/>Saved</button></div></article>)}</div><p className="device-note"><i/>Saved on this device</p></>}
    {selected && <dialog ref={dialog} className="watch-dialog" onCancel={() => setSelected(null)} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}><div className="dialog-header"><span>Saved clip</span><button aria-label="Close player" onClick={() => setSelected(null)}><Icon name="close"/></button></div><YouTubePlayer video={selected}/><div className="metadata"><Metadata video={selected}/><Actions video={selected} saved={Boolean(saved[selected.id])} toggleSaved={toggleSaved} share={share}/></div></dialog>}
  </main>;
}
