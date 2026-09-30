import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ApiError } from './youtube/client.js';
import { searchCandidates } from './youtube/search.js';
import { fetchVideos } from './youtube/videos.js';
import { mockFeed } from './mock.js';
export function selectDaily(videos, date) {
  const rank = id => createHash('sha256').update(`${date}:${id}`).digest('hex');
  const unique = [...new Map(videos.map(v => [v.id, v])).values()];
  unique.sort((a, b) => Number(a.durationSeconds > 180) - Number(b.durationSeconds > 180) || rank(a.id).localeCompare(rank(b.id)));
  const selected = [], channels = new Map();
  // Prefer 15–180 seconds and at most two per channel, then relax only as needed.
  for (const [maxSeconds, channelLimit] of [[180, 2], [239, 2], [239, 10]]) {
    for (const video of unique) {
      if (selected.length === 10) break;
      if (video.durationSeconds > maxSeconds || selected.some(v => v.id === video.id) || (channels.get(video.channelId) || 0) >= channelLimit) continue;
      selected.push(video); channels.set(video.channelId, (channels.get(video.channelId) || 0) + 1);
    }
  }
  if (selected.length < 10) throw new ApiError('INSUFFICIENT_CLIPS', 'Today’s clips aren’t available right now. Please try again later.');
  return selected.map((video, i) => ({ ...video, position: i + 1 }));
}
export async function discoverFeed(date, options) {
  const candidates = await searchCandidates(date, options);
  const videos = selectDaily(await fetchVideos(candidates, options), date);
  return { date, videos, count: 10, source: 'youtube' };
}
let cache, pending, failedUntil = 0, lastError;
export async function getTodayFeed({ apiKey = process.env.YOUTUBE_API_KEY, development = false } = {}) {
  const date = new Date().toISOString().slice(0, 10);
  if (!apiKey) {
    if (development) return mockFeed(date);
    throw new ApiError('API_NOT_CONFIGURED', 'Today’s clips aren’t available right now. The video service needs configuration.');
  }
  if (cache?.date === date) return cache;
  if (Date.now() < failedUntil) throw lastError;
  if (pending) return pending;
  pending = (async () => {
    const directory = join(tmpdir(), 'cliplish-feed-v1');
    const file = join(directory, `${date}.json`);
    try { const stored = JSON.parse(await readFile(file, 'utf8')); if (stored.date === date && stored.count === 10 && stored.source === 'youtube') { cache = stored; return stored; } } catch { /* Cache is optional. */ }
    const feed = await discoverFeed(date, { apiKey });
    cache = feed;
    try { await mkdir(directory, { recursive: true }); const staging = `${file}.${process.pid}.tmp`; await writeFile(staging, JSON.stringify(feed)); await rename(staging, file); } catch { /* Read-only serverless filesystems may skip persistence. */ }
    return feed;
  })().catch(error => { lastError = error; failedUntil = Date.now() + 30000; throw error; }).finally(() => { pending = null; });
  return pending;
}
