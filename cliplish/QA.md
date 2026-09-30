# Cliplish — executed QA

Test date: September 30, 2026. App: local Vite development server at `http://127.0.0.1:5174`, production preview at port 4175. Browser: isolated headless Google Chrome on macOS. No YouTube Data API key was configured. No deployment was performed.

## Actual results

- `pnpm test`: **9/9 tests pass**. ISO duration parsing, normalization/availability/language filtering, deterministic date selection, uniqueness, finite count, channel diversity, duration fallback, insufficient candidates, complete search→details→feed pipeline with upstream fixtures, quota/error sanitization, production vs development configuration behavior, HTTP validation, corrupt storage and storage failures.
- `pnpm build`: **passes**, 45 modules; JS 278.39 kB / 88.25 kB gzip, CSS 13.64 kB / 3.57 kB gzip. Vite emits two non-failing React Router `"use client"` directive warnings.
- `tests/browser.mjs`: **30 checks pass**. Full machine-readable record: [browser-results.json](docs/qa/browser-results.json).
- Real YouTube player: **iframe created, ready callback fired, native center play button clicked, playback observed at 6.875872 seconds with `paused: false`, `readyState: 4`**. Uses Google's official IFrame API sample `M7lc1UVf-VE`, not a discovered English clip. [Result](docs/qa/live-player-result.json), [screenshot](docs/qa/live-player.png).
- Production HTTP: `/api/health` → 200, `/api/feed/today` without key → 503 `API_NOT_CONFIGURED`, `/saved` → 200 HTML. Production does not return mock data.
- Production JavaScript scan: no `YOUTUBE_API_KEY`, YouTube Data API base URL, prior Unsplash environment key name, or injected test secret. API fixture output also checked for test-secret leakage. Actual credentials were not printed, modified, or sent to the frontend.

## Flow and layout checks

| Item | Observed result |
| --- | --- |
| Today loads | Pass: exactly ten labeled development fixtures |
| Live Data API response | **Not executed: API key missing**; complete integration verified using upstream response fixtures |
| Video playback | Pass: real public YouTube documentation sample plays after click |
| Scroll snap / progress | Pass: mandatory vertical snap computed; real container scroll changes active clip |
| Save and Unsave | Pass: button state, Saved retrieval, empty state |
| Saved survives refresh | Pass |
| Saved watch | Pass: dialog opens and closes using Escape; development image fixture used in this flow |
| Share | Pass with Web Share stub: original YouTube URL passed; OS share sheet not exercised |
| Copy fallback | Pass with Clipboard API stub and visible “Link copied”; system clipboard write not exercised |
| Resume | Pass: refresh at clip six resumes clip six |
| Completion | Pass: after clip ten, completion appears and survives refresh; no clip eleven |
| API failure / retry | Pass with injected 503; saved and progress values preserved byte-for-byte; Retry recovers |
| Unavailable clip | Pass with IFrame API error 100 stub; visible message and Next Clip work |
| Offline | Pass: browser offline event displays notice while Saved metadata remains visible |
| Keyboard | Pass: ArrowDown / ArrowUp navigation, Escape dialog dismissal, 2px visible focus outline after Tab |
| JavaScript errors | No uncaught page errors; one expected console resource error from deliberately injected HTTP 503 |
| New date / corrupt storage | Pass in Node tests; real overnight transition not observed |

Today and Saved were checked at **320, 390, 430, 768, 1024, and 1440px**. All have no horizontal overflow. Saved uses 1 / 2 / 3 columns at mobile / tablet / desktop. Desktop Today has two columns. Screenshots are in `docs/qa/`. Mobile Today, desktop Today, desktop Saved, and mobile Completion were also visually reviewed against the supplied Stitch screenshots.

The exported layout/token system and actual assets are reused. Expected differences: real metadata varies, demo mode is labeled, native YouTube controls replace static playback simulations, and vocabulary/profile/filter elements are omitted in accordance with the MVP scope. The page does not invent captions, definitions, verification marks or watch-time metrics. The progress counter tracks active position, not proof that the user watched each second.

## Checks still requiring configuration or devices

1. Configure `YOUTUBE_API_KEY` and run discovery against live Google search/detail responses. Confirm ten valid English clips, real metadata, quota behavior and playback of those selected clips.
2. Verify Web Share sheet and real clipboard permissions on target phones/browsers.
3. Check physical iOS/Android touch scrolling, safe areas, rotation, and assistive technology. Responsive tests emulate viewport widths, not physical mobile devices.
4. Deploy to Vercel and verify serverless cold starts, CDN cache behavior, direct routes, regional video availability, and operational quota limits.
5. No exhaustive accessibility audit, long-running overnight observation, or concurrent multi-region load test was performed.

## Re-run

```sh
pnpm test
pnpm build
pnpm dev
# In another terminal with Playwright and Chrome installed:
TEST_URL=http://127.0.0.1:5174 node tests/browser.mjs
TEST_URL=http://127.0.0.1:5174 node tests/live-player.mjs
```

If Playwright is available outside this project, provide `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs`. Browser tests create isolated contexts, stub only the explicitly identified external boundaries, and save their output under `docs/qa/`.
