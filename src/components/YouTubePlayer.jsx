import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
let apiPromise;
function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Player could not load')), 15000);
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); resolve(window.YT); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('Player could not load')); };
    document.head.append(script);
  }).catch(error => { apiPromise = undefined; throw error; });
  return apiPromise;
}
export default function YouTubePlayer({ video, active = true, onNext }) {
  const host = useRef(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setError(false); setReady(false);
    if (!active || video.mock) return;
    let cancelled = false, player;
    const mount = document.createElement('div');
    host.current.replaceChildren(mount);
    loadYouTube().then(YT => {
      if (cancelled) return;
      player = new YT.Player(mount, {
        videoId: video.id, width: '100%', height: '100%',
        playerVars: { playsinline: 1, autoplay: 0, rel: 0, origin: window.location.origin },
        events: {
          onReady: e => { e.target.getIframe().title = video.title; setReady(true); },
          onError: () => setError(true),
        },
      });
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; player?.destroy(); };
  }, [video.id, active, retry, video.mock, video.title]);
  if (video.mock || !active) return <div className="player poster"><img src={video.thumbnailUrl} alt={video.mock ? 'Stitch design preview — development sample' : ''}/>{video.mock && active && <span className="demo-player-note">Design preview · connect YouTube API to play</span>}</div>;
  return <div className="player">
    <div ref={host} className="youtube-host" hidden={error}/>
    {!ready && !error && <span className="player-loading">Loading YouTube player…</span>}
    {error && <div className="player-error"><Icon name="play"/><p>This clip is no longer available.</p><small>It may also be blocked by your network or browser.</small><div className="actions"><button onClick={() => setRetry(n => n + 1)}>Retry player</button>{onNext && <button onClick={onNext}>Next Clip</button>}</div><a href={video.youtubeUrl} target="_blank" rel="noreferrer">Watch on YouTube ↗</a></div>}
  </div>;
}
