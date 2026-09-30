import { today } from '../utils/format.js';
import { read, write, FEED_KEY } from '../storage/local.js';
export function validFeed(data) {
  return data && /^\d{4}-\d{2}-\d{2}$/.test(data.date) && data.count === 10 && data.videos?.length === 10
    && new Set(data.videos.map(v => v.id)).size === 10
    && data.videos.every(v => typeof v.id === 'string' && typeof v.title === 'string' && typeof v.channelTitle === 'string');
}
export async function fetchFeed({ force = false, signal } = {}) {
  const cached = read(FEED_KEY, null);
  if (!force && validFeed(cached) && cached.date === today() && cached.source !== 'mock') return cached;
  const response = await fetch('/api/feed/today', { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Please try again in a moment.');
  if (data.source === 'mock' && !import.meta.env.DEV) throw new Error('The video service needs configuration.');
  if (!validFeed(data)) throw new Error('The daily feed is incomplete. Please try again.');
  write(FEED_KEY, data);
  return data;
}
