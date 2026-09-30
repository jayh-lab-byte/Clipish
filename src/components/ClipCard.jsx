import React from 'react';
import YouTubePlayer from './YouTubePlayer.jsx';
import Icon from './Icon.jsx';
import { duration, views, relativeDate } from '../utils/format.js';
export function Metadata({ video }) {
  return <><span className="badge">{video.contentType} · {duration(video.durationSeconds)}</span><h1>{video.title}</h1><div className="channel"><span className="channel-avatar" aria-hidden="true">{video.channelTitle.split(' ').map(w => w[0]).slice(0, 2).join('')}</span><div><span className="channel-name">{video.channelTitle}</span><p>{views(video.viewCount)} · {relativeDate(video.publishedAt)}</p></div></div></>;
}
export function Actions({ video, saved, toggleSaved, share }) {
  return <div className="actions"><button className={saved ? 'save saved' : 'save'} onClick={() => toggleSaved(video)} aria-pressed={saved}><Icon name="heart" filled={saved}/>{saved ? 'Saved' : 'Save Clip'}</button><button onClick={() => share(video)}><Icon name="share"/>Share</button></div>;
}
export default function ClipCard({ video, index, active, saved, toggleSaved, share, next }) {
  return <div className="clip-layout"><YouTubePlayer video={video} active={active} onNext={next}/><section className="metadata"><Metadata video={video}/><Actions video={video} saved={saved} toggleSaved={toggleSaved} share={share}/><button className="next-cue" onClick={next}><Icon name="down"/><span>{index === 9 ? 'Finish today’s clips' : <><span className="mobile-cue">Swipe for next clip</span><span className="desktop-cue">Press ↓ or scroll for next clip</span><span className="remaining"> · {9 - index} remaining</span></>}</span></button></section></div>;
}
