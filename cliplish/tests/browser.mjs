// Run with an installed Playwright: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser.mjs
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:5174';
const out = fileURLToPath(new URL('../docs/qa/', import.meta.url));
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [], consoleErrors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
const results = [];
const pass = name => { results.push(name); console.log('PASS', name); };
const active = () => page.locator('article.clip-page:not([inert])');
async function ready() { await page.waitForSelector('article.clip-page:not([inert])'); }
try {
  await page.goto(base); await ready();
  assert.equal(await page.locator('article.clip-page').count(), 10); assert.equal(await page.locator('.demo-label').textContent(), 'Demo data'); pass('Today loads exactly ten clearly labeled development clips');
  await active().getByRole('button', { name: 'Save Clip', exact: true }).click();
  assert.equal(await active().getByRole('button', { name: 'Saved', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.reload(); await ready(); assert.equal(await active().getByRole('button', { name: 'Saved', exact: true }).count(), 1); pass('Save state survives refresh');
  await page.locator('.bottom-nav').getByRole('link', { name: 'Saved', exact: true }).click();
  await page.waitForSelector('.saved-card'); assert.equal(await page.locator('.saved-card').count(), 1); await page.reload(); await page.waitForSelector('.saved-card'); pass('Saved route and persisted retrieval');
  await page.locator('.thumbnail-button').click(); await page.waitForSelector('dialog[open]'); await page.keyboard.press('Escape'); await page.waitForSelector('dialog', { state: 'detached' }); pass('Saved watch dialog and Escape dismissal');
  await page.locator('.remove-button').click(); await page.getByRole('heading', { name: 'Nothing saved yet.' }).waitFor(); pass('Unsave and empty Saved state');
  await page.getByRole('link', { name: 'Watch Today’s Clips' }).click(); await ready();
  for (let i=0;i<5;i++) await active().locator('.next-cue').click();
  assert.equal(await active().getAttribute('aria-label'), 'Clip 6 of 10');
  await page.reload(); await ready(); assert.equal(await active().getAttribute('aria-label'), 'Clip 6 of 10'); pass('Progress resumes clip six after refresh');
  await page.locator('.daily-scroll').focus(); await page.keyboard.press('ArrowDown'); assert.equal(await active().getAttribute('aria-label'), 'Clip 7 of 10');
  await page.keyboard.press('ArrowUp'); assert.equal(await active().getAttribute('aria-label'), 'Clip 6 of 10'); pass('Keyboard next and previous clips');
  for (const width of [320,390,430,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(150);
    const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,main:document.querySelector('.daily-scroll').scrollWidth,client:document.querySelector('.daily-scroll').clientWidth, snap:getComputedStyle(document.querySelector('.daily-scroll')).scrollSnapType,cols:getComputedStyle(document.querySelector('.clip-layout')).gridTemplateColumns}));
    assert.ok(dimensions.scroll<=width,JSON.stringify(dimensions));assert.ok(dimensions.main<=dimensions.client,JSON.stringify(dimensions));assert.equal(dimensions.snap,'y mandatory');
    if(width>=1024) assert.equal(dimensions.cols.split(' ').length,2);
    await page.screenshot({path:`${out}today-${width}.png`});pass(`Today ${width}px: no horizontal overflow, responsive layout and scroll snap CSS`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('.daily-scroll').evaluate(el=>{el.scrollTop=document.querySelectorAll('.clip-page')[6].offsetTop;});
  await page.waitForFunction(()=>document.querySelector('article.clip-page:not([inert])')?.getAttribute('aria-label')==='Clip 7 of 10'); pass('Vertical scroll updates active clip');
  for(let i=6;i<10;i++) await active().locator('.next-cue').click();
  await page.locator('.completion-page:not([inert])').waitFor();assert.equal(await page.locator('article.clip-page').count(),10);
  await page.screenshot({path:`${out}completion-390.png`});await page.reload();await page.locator('.completion-page:not([inert])').waitFor();pass('Completion after clip ten, no clip eleven, completion survives refresh');
  await page.setViewportSize({width:1440,height:900});await page.screenshot({path:`${out}completion-1440.png`});
  await page.locator('.top-nav').getByRole('link',{name:'Saved',exact:true}).click(); await page.getByRole('heading',{name:'Nothing saved yet.'}).waitFor();
  await page.evaluate(()=>{const feed=JSON.parse(localStorage.getItem('cliplish:daily-feed:v1'));localStorage.setItem('cliplish:saved:v1',JSON.stringify({videos:Object.fromEntries(feed.videos.slice(0,6).map((v,i)=>[v.id,{...v,savedAt:new Date(Date.now()-i*1000).toISOString()}]))}));});
  await page.reload();await page.waitForSelector('.saved-card');
  for(const width of [320,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const cols=await page.locator('.saved-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(cols,width>=1024?3:width>=768?2:1);await page.screenshot({path:`${out}saved-${width}.png`});pass(`Saved ${width}px: no overflow, ${cols} columns`);}
  await context.setOffline(true);await page.getByRole('status').filter({hasText:'You’re offline'}).waitFor();assert.equal(await page.locator('.saved-card').count(),6);await context.setOffline(false);pass('Offline notice with saved metadata retained');
  // API failure is deliberately injected; progress and saved data must survive.
  const before=await page.evaluate(()=>({saved:localStorage.getItem('cliplish:saved:v1'),progress:localStorage.getItem('cliplish:daily-progress:v1')}));
  await page.evaluate(()=>localStorage.removeItem('cliplish:daily-feed:v1'));
  await page.route('**/api/feed/today',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{code:'TEST_FAILURE',message:'Injected API failure'}})}));
  await page.goto(base);await page.getByRole('heading',{name:'Today’s clips aren’t available right now.'}).waitFor();
  assert.deepEqual(await page.evaluate(()=>({saved:localStorage.getItem('cliplish:saved:v1'),progress:localStorage.getItem('cliplish:daily-progress:v1')})),before);pass('API failure preserves Saved and Progress');
  await page.unroute('**/api/feed/today');await page.getByRole('button',{name:'Try Again'}).click();await page.locator('.completion-page:not([inert])').waitFor();pass('Retry recovers feed');
  // Inject one live-like fixture and an IFrame API double to test error handling without claiming live playback.
  await page.evaluate(()=>{const f=JSON.parse(localStorage.getItem('cliplish:daily-feed:v1'));f.source='youtube';f.videos[0]={...f.videos[0],id:'abcdefghijk',mock:false,youtubeUrl:'https://www.youtube.com/watch?v=abcdefghijk'};localStorage.setItem('cliplish:daily-feed:v1',JSON.stringify(f));localStorage.setItem('cliplish:daily-progress:v1',JSON.stringify({date:f.date,currentIndex:0,completed:false}));});
  await page.addInitScript(()=>{window.YT={Player:class{constructor(el,options){setTimeout(()=>options.events.onError({data:100}),20);}destroy(){}}};Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}});});
  await page.reload();await page.getByText('This clip is no longer available.').waitFor();await active().getByRole('button',{name:'Share',exact:true}).click();assert.equal(await page.evaluate(()=>window.__copied),'https://www.youtube.com/watch?v=abcdefghijk');await page.getByRole('status').filter({hasText:'Link copied'}).waitFor();pass('Clipboard fallback and visible feedback (clipboard stub)');
  await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__shared=data;}}));await active().getByRole('button',{name:'Share',exact:true}).click();assert.equal((await page.evaluate(()=>window.__shared)).url,'https://www.youtube.com/watch?v=abcdefghijk');pass('Web Share branch sends original URL (native share stub)');
  await page.getByRole('button',{name:'Next Clip',exact:true}).click();assert.equal(await active().getAttribute('aria-label'),'Clip 2 of 10');pass('Unavailable video allows next clip (IFrame API error stub)');
  await active().locator('.save').focus();await page.keyboard.press('Tab');const focus=await page.locator(':focus').evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));assert.equal(focus.style,'solid');assert.equal(focus.width,'2px');pass('Visible keyboard focus outline');
  assert.deepEqual(errors,[]);pass('No JavaScript page errors across exercised flows');
  const health=await context.request.get(`${base}/api/health`);assert.equal((await health.json()).status,'ok');pass('Running HTTP health endpoint');
  await writeFile(`${out}browser-results.json`,JSON.stringify({date:new Date().toISOString(),results,errors,consoleErrors},null,2));
} finally {await browser.close();}
