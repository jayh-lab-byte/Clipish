import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
const { chromium }=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const result={fixture:'Official IFrame API documentation sample M7lc1UVf-VE',dataApiTested:false};
try{
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5174');await page.waitForSelector('article.clip-page');
 await page.evaluate(()=>{const f=JSON.parse(localStorage.getItem('cliplish:daily-feed:v1'));f.source='youtube';f.videos[0]={...f.videos[0],id:'M7lc1UVf-VE',mock:false,title:'YouTube IFrame API official test video',youtubeUrl:'https://www.youtube.com/watch?v=M7lc1UVf-VE'};localStorage.setItem('cliplish:daily-feed:v1',JSON.stringify(f));});
 await page.reload();
 try{await page.waitForSelector('.youtube-host iframe',{timeout:20000});result.iframeCreated=true;await page.waitForFunction(()=>!document.querySelector('.player-loading'),{},{timeout:15000});result.ready=true;}
 catch{result.ready=false;}
 result.errorVisible=await page.getByText('This clip is no longer available.').isVisible();
 if(result.ready&&!result.errorVisible){
  const frame=page.frameLocator('.youtube-host iframe');
  try{await page.locator('.youtube-host iframe').click({timeout:10000});await page.waitForTimeout(8000);result.playback=await frame.locator('video').evaluateAll(videos=>videos.map(v=>({currentTime:v.currentTime,paused:v.paused,readyState:v.readyState})));result.frameText=(await frame.locator('body').innerText()).slice(0,1000);}catch(e){result.playback='Could not verify playback: '+e.name;}
 }
 await page.screenshot({path:fileURLToPath(new URL('../docs/qa/live-player.png',import.meta.url))});
 console.log(JSON.stringify(result,null,2));await writeFile(fileURLToPath(new URL('../docs/qa/live-player-result.json',import.meta.url)),JSON.stringify(result,null,2));
}finally{await browser.close();}
