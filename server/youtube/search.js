import { youtubeRequest } from './client.js';
export const queries = [
  ['english pronunciation shorts', 'PRONUNCIATION'],
  ['english conversation shorts', 'SCENE'],
  ['english phrases shorts', 'LESSON'],
  ['english speaking shorts', 'LESSON'],
  ['english listening shorts', 'LISTENING'],
  ['learn english animation', 'LESSON'],
  ['english sitcom phrases', 'SCENE'],
];
export async function searchCandidates(date, options) {
  const results = await Promise.allSettled(queries.map(async ([q, contentType]) => {
    const data = await youtubeRequest('search', {
      part: 'snippet', type: 'video', videoDuration: 'short', videoEmbeddable: 'true',
      videoSyndicated: 'true', relevanceLanguage: 'en', safeSearch: 'moderate',
      maxResults: '20', order: 'relevance', publishedBefore: `${date}T00:00:00Z`, q,
    }, options);
    return (data.items || []).filter(item => /^[\w-]{11}$/.test(item.id?.videoId)).map(item => ({ id: item.id.videoId, contentType }));
  }));
  const candidates = new Map();
  for (const result of results) if (result.status === 'fulfilled') for (const video of result.value) if (!candidates.has(video.id)) candidates.set(video.id, video);
  if (!candidates.size) { const failure = results.find(r => r.status === 'rejected'); if (failure) throw failure.reason; }
  return [...candidates.values()];
}
