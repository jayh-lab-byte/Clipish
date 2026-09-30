export class ApiError extends Error {
  constructor(code, message, status = 503) { super(message); this.code = code; this.status = status; }
}
export async function youtubeRequest(resource, params, { apiKey, fetchImpl = fetch }) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  url.search = new URLSearchParams({ ...params, key: apiKey }).toString();
  let response;
  try { response = await fetchImpl(url, { signal: AbortSignal.timeout(10000) }); }
  catch { throw new ApiError('YOUTUBE_UNREACHABLE', 'YouTube could not be reached. Please try again shortly.'); }
  let data;
  try { data = await response.json(); } catch { throw new ApiError('YOUTUBE_RESPONSE_INVALID', 'YouTube returned an invalid response.'); }
  if (!response.ok) {
    const quota = data.error?.errors?.some(e => ['quotaExceeded', 'dailyLimitExceeded'].includes(e.reason));
    throw new ApiError(quota ? 'YOUTUBE_QUOTA_EXCEEDED' : 'YOUTUBE_REQUEST_FAILED', quota ? 'Today’s clips are temporarily unavailable. Please try again later.' : 'The video service is unavailable. Please try again later.');
  }
  return data;
}
