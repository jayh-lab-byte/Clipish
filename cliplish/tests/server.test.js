import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDuration, normalizeVideo } from '../server/youtube/videos.js';
import { selectDaily, discoverFeed, getTodayFeed } from '../server/feed.js';
import { youtubeRequest } from '../server/youtube/client.js';
import { handleApi } from '../server/http.js';
import { getProgress, getSaved, write, PROGRESS_KEY, SAVED_KEY } from '../src/storage/local.js';
const video = (i, seconds = 42) => ({ id: String(i).padStart(11, 'a'), channelId: `channel-${i % 8}`, durationSeconds: seconds });
test('ISO durations handle minutes, hours, fractions and invalid inputs', () => {
  assert.equal(parseDuration('PT42S'), 42); assert.equal(parseDuration('PT3M59S'), 239); assert.equal(parseDuration('PT1H2M3S'), 3723); assert.equal(parseDuration('P1DT1S'), 86401); assert.equal(parseDuration('PT0.5S'), .5); assert.equal(parseDuration('bad'), 0);
});
test('selection is stable, unique, finite and channel diverse', () => {
  const candidates = Array.from({ length: 40 }, (_, i) => video(i));
  const first = selectDaily(candidates, '2026-09-30');
  assert.deepEqual(first, selectDaily([...candidates].reverse(), '2026-09-30'));
  assert.notDeepEqual(first, selectDaily(candidates, '2026-10-01'));
  assert.equal(first.length, 10); assert.equal(new Set(first.map(v => v.id)).size, 10);
  for (const channel of new Set(first.map(v => v.channelId))) assert.ok(first.filter(v => v.channelId === channel).length <= 2);
  assert.equal(first.at(-1).position, 10);
});
test('selection uses longer fallback only if needed, rejects fewer than ten', () => {
  assert.equal(selectDaily(Array.from({ length: 10 }, (_, i) => video(i, i === 9 ? 230 : 42)), '2026-09-30').length, 10);
  assert.throws(() => selectDaily([video(1), video(1)], '2026-09-30'), /available/);
});
const rawVideo = i => ({ id: video(i).id, snippet: { title: `English lesson ${i}`, channelId: `channel-${i % 8}`, channelTitle: 'English lessons', defaultAudioLanguage: 'en-US', publishedAt: '2026-09-01T00:00:00Z' }, status: { embeddable: true, privacyStatus: 'public', uploadStatus: 'processed' }, contentDetails: { duration: 'PT42S' }, statistics: { viewCount: '184000' } });
test('normalization validates availability, duration, language and real metadata', () => {
  assert.equal(normalizeVideo(rawVideo(0), 'LESSON').viewCount, 184000);
  for (const patch of [{status:{embeddable:false}}, {contentDetails:{duration:'PT4M'}}, {contentDetails:{duration:'PT10S'}}, {snippet:{...rawVideo(0).snippet,defaultAudioLanguage:'fr'}}, {status:{embeddable:true,privacyStatus:'private'}}]) assert.equal(normalizeVideo({...rawVideo(0), ...patch}, 'LESSON'), null);
});
test('discovery executes search and batched detail pipeline with deduplication', async () => {
  const requests = [];
  const fetchImpl = async url => {
    requests.push(url);
    if (url.pathname.endsWith('/search')) return { ok: true, json: async () => ({items: Array.from({length:20},(_,i)=>({id:{videoId:video(i).id}}))}) };
    return {ok:true,json:async()=>({items:url.searchParams.get('id').split(',').map(id=>rawVideo(Number(id.replaceAll('a',''))))})};
  };
  const feed = await discoverFeed('2026-09-30', {apiKey:'test-secret',fetchImpl});
  assert.equal(feed.count,10); assert.equal(feed.source,'youtube');
  assert.equal(requests.filter(u=>u.pathname.endsWith('/search')).length,7);
  assert.equal(requests.filter(u=>u.pathname.endsWith('/videos')).length,1);
  assert.ok(!JSON.stringify(feed).includes('test-secret'));
  for (const request of requests.filter(u=>u.pathname.endsWith('/search'))) assert.equal(request.searchParams.get('videoEmbeddable'),'true');
});
test('upstream errors are sanitized and quota errors are distinguishable', async () => {
  await assert.rejects(youtubeRequest('search',{}, {apiKey:'secret',fetchImpl:async()=>({ok:false,json:async()=>({error:{message:'secret',errors:[{reason:'quotaExceeded'}]}})})}), e=>e.code==='YOUTUBE_QUOTA_EXCEEDED' && !e.message.includes('secret'));
});
test('missing key is mock only in explicit development mode', async () => {
  assert.equal((await getTodayFeed({apiKey:'',development:true})).source,'mock');
  await assert.rejects(getTodayFeed({apiKey:'',development:false}), e=>e.code==='API_NOT_CONFIGURED');
});
async function request(url, method='GET', options={apiKey:'',development:false}) {
  const response = {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=JSON.parse(body);}};
  await handleApi({url,method},response,options);return response;
}
test('API health, methods, invalid parameters, 404 and production configuration error', async () => {
  assert.equal((await request('/api/health')).body.status,'ok');
  assert.equal((await request('/api/feed/today','POST')).statusCode,405);
  assert.equal((await request('/api/feed/today?key=anything')).statusCode,400);
  assert.equal((await request('/api/unknown')).statusCode,404);
  const missing=await request('/api/feed/today');assert.equal(missing.statusCode,503);assert.equal(missing.body.error.code,'API_NOT_CONFIGURED');
  const mock=await request('/api/feed/today','GET',{apiKey:'',development:true});assert.equal(mock.body.videos.length,10);assert.equal(mock.headers['Cache-Control'],'no-store');
});
test('storage resumes a day, resets a new day, tolerates corruption and quota failures', () => {
  const data = new Map(); globalThis.localStorage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
  write(PROGRESS_KEY,{date:'2026-09-30',currentIndex:5,completed:false});assert.equal(getProgress('2026-09-30').currentIndex,5);assert.equal(getProgress('2026-10-01').currentIndex,0);
  data.set(PROGRESS_KEY,'broken');assert.equal(getProgress('2026-09-30').currentIndex,0);
  write(SAVED_KEY,{videos:{abc:{id:'abc',title:'Saved clip',savedAt:'2026-09-30'},broken:null}});assert.deepEqual(Object.keys(getSaved()),['abc']);
  globalThis.localStorage.setItem=()=>{throw new Error('Quota exceeded');};assert.equal(write(SAVED_KEY,{}),false);
});
