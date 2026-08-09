# KCN Command Center — app

The real, buildable merge of Worldview + Cyber Security HQ, replacing the
static wireframe-globe prototypes with an actual textured 3D Earth and a
live data layer. Deployed via Docker (not the paid Lovable subscription,
which is attached to an unrelated project — see chat history/decision
log if you need the reasoning).

## What's real right now

- **3D globe** (`src/globe.ts`): high-res satellite-derived textures
  (day map, normal map, specular ocean map, cloud shell, night lights)
  at 4096x2048 — the day/night/specular maps are resized from real
  8192x4096 NASA imagery (CC0, via `matteason/daily-cloud-maps`), not
  the lower-res three.js example textures used in the first pass.
  Properly lit with a directional "sun" light so there's a real
  day/night terminator. Covered by 11 unit tests (lat/lon math, marker
  add/update/remove, visibility toggling).
- **Live military flight data** (`server/api/flights.ts`): fetches real
  aircraft positions from OpenSky Network's free public API, filtered to
  military-relevant callsigns/ICAO hex ranges. Adapted from
  `worldview_command_sentinel_axonia-app`'s `api/adsb.js`, with one real
  bug fixed: that version marked hardcoded fallback aircraft as
  `live: true`, which is misleading. Here, only data that actually came
  from OpenSky this request is `live: true` — verified by a test that
  mocks the network both ways (success and failure) and asserts the
  labeling stays honest either way.
- **Cyber attack trace arcs** (`src/attackArc.ts`,
  `src/data/cyberEvents.ts`): animated great-circle arcs on the globe
  between source/destination points, with a traveling pulse. Reuses the
  same simulated event set built for the Cyber-Security-HQ prototype.
  **Important honesty note:** the source/destination "locations" are a
  deterministic hash of the demo IP addresses, not real IP geolocation —
  clearly labeled DEMO in the UI. 7 unit tests cover the hash
  determinism, coordinate bounds, and arc add/remove/visibility logic.
- **Toggleable layers**: checkboxes in the side panel show/hide the
  flight markers and cyber attack arcs independently.
- **Collapsible, scrollable side panels**: each panel section collapses
  via its header, and long lists scroll within a bounded height instead
  of pushing the layout around.
- Flight data cached server-side (15s TTL) so many browser tabs don't
  each hammer OpenSky's fair-use rate limit.

## What's NOT built yet (see the phased plan from chat)

- Satellite tracking (planned: CelesTrak TLE data + satellite.js)
- True Google Earth-style zoom-to-street-level imagery — that's Google's
  own licensed tile-streaming service, requiring your own Google Cloud
  API key/billing and subject to their ToS on caching/reuse. What's here
  is a much higher-res *static* satellite texture, not a zoomable tile
  service.
- Live CCTV — intentionally not started; needs a legitimate public
  source decided first (state DOT traffic cams, licensed webcam APIs).
  Will not build anything that aggregates exposed/insecure private
  cameras.
- User auth / API key gating (sentinel-axonia had this; dropped for this
  public demo, add back if this needs to be access-controlled)

## Run locally

```bash
npm install
npm run server    # starts the API on :4200
npm run dev        # separate terminal — starts Vite dev server on :5173, proxies /api to :4200
```

## Run via Docker (matches production)

```bash
docker compose up --build
# open http://localhost:8080
```

## Test / lint / build

```bash
npm test
npm run lint
npx tsc      # type-check
npm run build
```

## Known dev-only vulnerability

`npm audit` reports a moderate esbuild vulnerability affecting Vite's dev
server (not the production build) on Vite 5.x — fixed only in Vite 8,
which is a breaking change not made here. Low real-world risk unless you
expose the dev server (not the Docker build) to an untrusted network.
