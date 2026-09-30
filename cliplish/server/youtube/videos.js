import { youtubeRequest } from './client.js';
export function parseDuration(value) {
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(value || '');
  return match ? Number(match[1] || 0) * 86400 + Number(match[2] || 0) * 3600 + Number(match[3] || 0) * 60 + Number(match[4] || 0) : 0;
}
export function normalizeVideo(video, contentType) {
  const snippet = video.snippet || {}, details = video.contentDetails || {};
  const seconds = parseDuration(details.duration);
  const language = snippet.defaultAudioLanguage || snippet.defaultLanguage;
  if (!video.status?.embeddable || video.status.privacyStatus !== 'public' || video.status.uploadStatus !== 'processed'
    || seconds < 15 || seconds >= 240 || snippet.liveBroadcastContent === 'live' || snippet.liveBroadcastContent === 'upcoming'
    || (language && !/^en(?:-|$)/i.test(language)) || !snippet.title || !snippet.channelId) return null;
  return {
    id: video.id, title: snippet.title, channelId: snippet.channelId, channelTitle: snippet.channelTitle,
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    publishedAt: snippet.publishedAt, durationSeconds: seconds,
    viewCount: video.statistics?.viewCount == null ? null : Number(video.statistics.viewCount),
    youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`, embeddable: true, contentType,
  };
}
export async function fetchVideos(candidates, options) {
  const types = new Map(candidates.map(v => [v.id, v.contentType]));
  const batches = [];
  for (let i = 0; i < candidates.length; i += 50) batches.push(candidates.slice(i, i + 50));
  const responses = await Promise.all(batches.map(batch => youtubeRequest('videos', {
    part: 'snippet,statistics,contentDetails,status', id: batch.map(v => v.id).join(','),
  }, options)));
  return responses.flatMap(data => data.items || []).map(video => normalizeVideo(video, types.get(video.id) || 'LESSON')).filter(Boolean);
}
