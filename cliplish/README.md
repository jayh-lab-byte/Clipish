# Cliplish

**10 English clips a day.** A finite English-learning feed with Today, Save/Unsave, sharing, same-day resume, Saved retrieval, and a calm ending after clip ten.

The application is implemented at this workspace root. It follows the supplied Google Stitch mobile/desktop layouts, colors, Geist typography, spacing, and rounded surfaces. Original exports are preserved in `docs/stitch/`; the logo and six thumbnail assets are reused. Original root entry files were preserved in `docs/previous-app/`. Other existing projects in this workspace were not changed.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open the URL printed by Vite (normally http://localhost:5173; it uses the next free port if necessary). Vite serves both the React app and `/api/*` through a server-only middleware.

Without a YouTube key, development returns ten **clearly labeled fictional design samples**. These reuse Stitch artwork; their titles, channels, and counts are fixtures, not live results. Samples do not play or share a fabricated video URL. Production and production preview never fall back to samples.

To enable real discovery:

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **YouTube Data API v3** and create an API key. Restrict the key to that API; apply server restrictions appropriate to your hosting environment.
3. Create `.env.local` at this project root containing:

   ```dotenv
   YOUTUBE_API_KEY=your_key_here
   ```

4. Restart `pnpm dev` and refresh the browser. Demo feed caches are deliberately rechecked against the server so configuring the key takes effect immediately.

Do not prefix the key with `VITE_`. `.env`, `.env.local`, and other `.env.*` files are ignored; `.env.example` is the safe template. Existing workspace environment files are preserved.

```sh
pnpm test       # Server, selection, normalization and storage tests
pnpm build      # Production assets in dist/
pnpm preview    # Production behavior, including server API middleware
```

`pnpm preview` without a key intentionally shows the graceful feed error. Saved remains accessible.

## Architecture

React + Vite + JavaScript + React Router + plain CSS. No database, authentication, state framework, or UI framework.

```text
api/health.js, api/feed/today.js   Vercel function entry points
server/http.js                   Shared HTTP contract and sanitized errors
server/feed.js                   Selection, cache and request coalescing
server/youtube/                  API client, search and video normalization
server/mock.js                   Development-only fictional fixtures
src/App.jsx                      Routing, feed state, save/share and notices
src/pages/                       Today and Saved
src/components/                  Player, clip, progress and SVG icons
src/services/api.js              Frontend feed client and daily metadata cache
src/storage/local.js             Safe localStorage access
src/styles.css                   Responsive Stitch-derived CSS tokens/layouts
public/assets/                   Supplied logo and exported thumbnail artwork
tests/                          Node tests and optional browser checks
docs/qa/                        Executed browser results and screenshots
```

The older Quote Card Studio helpers remaining under `src/` are not imported by Cliplish or included in its bundle.

## YouTube API

`GET /api/feed/today` returns `{ date, count: 10, source, videos }`. Every video has its position, ID, title, channel, thumbnail, publication time, duration, view count, content type and original YouTube URL. Errors use `{ error: { code, message } }`. `GET /api/health` returns service health without configuration values. Unsupported methods, unknown API paths, and query parameters are rejected.

The server uses seven explicit English-learning queries with `search.list`, merges and deduplicates IDs, then calls `videos.list` with up to 50 IDs per request. It checks public/processed/embeddable status, declared English language where available, and duration. It prefers 15–180 seconds; 181–239 seconds may fill a shortfall. Content type comes from the discovery query. Selection uses a date-based hash and prefers at most two clips per channel, relaxing that cap only to reach ten. Fewer than ten valid candidates produces an error, never a partial feed.

**`videoDuration=short` means under four minutes; these are not necessarily official YouTube Shorts.** Reference: [Search API](https://developers.google.com/youtube/v3/docs/search/list), [Videos API](https://developers.google.com/youtube/v3/docs/videos/list).

Only the server calls the Data API. The browser requests the normalized feed and loads the official [YouTube IFrame Player](https://developers.google.com/youtube/iframe_api_reference). Only the active feed clip mounts a player; leaving a clip destroys its player, stopping playback. Native YouTube controls remain intact. Playback starts by user gesture. Errors have Retry, Next Clip, and an original YouTube link. No media is downloaded or cached.

Daily state uses **UTC**, including the completion message. Discovery excludes uploads after the start of that day. A successful feed is cached in process and, when writable, under the OS temporary directory. Concurrent requests share one discovery operation, failed discovery has a 30-second cooldown, and successful HTTP responses permit CDN caching until UTC midnight. The browser also persists the selected ten for same-day stability. Scrolling never initiates another search.

At most seven searches and three batched detail requests occur per discovery run. Serverless cold starts or separate regions can have separate caches; this MVP does not claim a global durable cache. Monitor quota before scaling. A persistent shared cache can be added later without changing the client contract.

## Responsive behavior and local state

- 320–767px: single-column vertical scroll-snap feed, metadata/actions below the player, bottom navigation, one-column Saved.
- 768–1023px: wider centered feed, two-column Saved.
- 1024px+: 1040px two-column Today composition inside a 1120px shell, top navigation and three-column Saved.
- Completion contains no eleventh clip. Progress represents the active clip/session position, not a verified watch-time metric.

`cliplish:daily-progress:v1` stores the UTC date, current zero-based index, and completion flag. `cliplish:saved:v1` stores video IDs, display metadata and `savedAt`, sorted newest first. `cliplish:daily-feed:v1` stores only the daily metadata selection. Day changes reset progress after a new feed successfully loads; failed requests preserve existing state. Saved data stays on this browser/device and survives daily resets. Storage failures produce visible feedback; there is no cloud sync. Saved metadata can become stale. Videos require connectivity.

Share uses Web Share where supported, otherwise Clipboard API, and reports success/failure without alerts. Samples explicitly explain why there is no live URL to share.

## Deploy to Vercel

1. Create a Git repository for this root application if needed (this workspace was not a Git checkout), then push it to your own remote.
2. Import it into Vercel with the **Vite** preset and this directory as the root. Use `pnpm install`, `pnpm build`, and output `dist`.
3. Add `YOUTUBE_API_KEY` in Vercel project environment variables for the environments you intend to deploy. Never enter it into a frontend `VITE_` variable.
4. Deploy. `vercel.json` configures the serverless feed function and direct `/saved` routing. Alternatively, run `vercel` from the project root after signing in.
5. Check `/api/health`, verify `/api/feed/today` returns `source: "youtube"` and ten unique clips, then test playback, save/share, refresh/resume, completion, and direct `/saved` navigation.

No deployment was performed in this session. Do not deploy `dist/` alone to a static-only host: the serverless API is required.

## Verification and limitations

See [QA.md](QA.md) for actual executed checks, screenshots, and distinctions between fixtures and live services. API integration is implemented and tested with upstream fixtures; **live YouTube Data API discovery has not been verified because no API key is configured**. Native share-sheet behavior requires a supported physical device. Language inference is heuristic; missing language metadata and broad search relevance can admit unsuitable clips. Availability, region restrictions, consent prompts, and embedding policy may change after discovery. Saved snapshots are not automatically refreshed.

Optional browser regression tests use Playwright and an installed Chrome. With Playwright installed in your environment, run `nodetests/browser.mjs`; otherwise set `PLAYWRIGHT_MODULE` to its `index.mjs` path. Set `TEST_URL` to your running dev server (default in the test is `http://127.0.0.1:5174`). The suite uses an isolated browser context. `tests/live-player.mjs` separately probes the official documentation's public sample video, not a discovered English clip.
