import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Globe } from './globe'
import { AttackArcLayer } from './attackArc'
import { SIMULATED_CYBER_EVENTS, ipToDemoLatLon, type Severity } from './data/cyberEvents'
import type { FlightsResponse, AircraftType, ThreatsResponse } from './data/types'

const TYPE_COLOR: Record<AircraftType, number> = {
  ISR: 0xa78bfa,
  BOMBER: 0xf87171,
  FIGHTER: 0xfb923c,
  AEW: 0x60a5fa,
  TANKER: 0x34d399,
  PATROL: 0xfbbf24,
  MILITARY: 0x94a3b8,
  UNKNOWN: 0x64748b,
}

const SEVERITY_COLOR: Record<Severity, number> = {
  high: 0xf87171,
  med: 0xfbbf24,
  low: 0x34d399,
  info: 0x64748b,
}

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('#app root not found')

app.innerHTML = `
  <div id="cc-root">
    <header id="cc-header">
      <div class="cc-logo">
        <div class="cc-logo-mark">K</div>
        <h1>KCN Command Center</h1>
      </div>
      <div class="cc-header-right">
        <label class="cc-vw-toggle">
          <input type="checkbox" id="cc-toggle-videowall" />
          Video wall mode
        </label>
        <div class="cc-status" id="cc-status">Initializing…</div>
      </div>
    </header>
    <main id="cc-main">
      <div id="cc-canvas-wrap"></div>
      <aside id="cc-side">
        <section class="cc-panel" data-open="true">
          <button class="cc-panel-head" data-toggle="flights">
            <span class="cc-panel-title">Live Military Air Traffic</span>
            <span class="cc-panel-actions">
              <label class="cc-switch" onclick="event.stopPropagation()">
                <input type="checkbox" id="cc-toggle-flights" checked />
              </label>
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div class="cc-side-sub" id="cc-flight-source">connecting…</div>
            <div id="cc-flight-list" class="cc-scroll"></div>
          </div>
        </section>

        <section class="cc-panel" data-open="true">
          <button class="cc-panel-head" data-toggle="threats">
            <span class="cc-panel-title">Real Threat Feed (blocklist.de)</span>
            <span class="cc-panel-actions">
              <label class="cc-switch" onclick="event.stopPropagation()">
                <input type="checkbox" id="cc-toggle-threats" checked />
              </label>
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div class="cc-side-sub" id="cc-threat-source">connecting…</div>
            <div class="cc-side-sub">IPs reported recently as abuse sources somewhere on the internet — not necessarily targeting this system, and not a claim about who's behind them.</div>
            <div id="cc-threat-list" class="cc-scroll"></div>
          </div>
        </section>

        <section class="cc-panel" data-open="true">
          <button class="cc-panel-head" data-toggle="cyber">
            <span class="cc-panel-title">Simulated Cyber Attack Traces</span>
            <span class="cc-panel-actions">
              <label class="cc-switch" onclick="event.stopPropagation()">
                <input type="checkbox" id="cc-toggle-cyber" checked />
              </label>
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div class="cc-side-sub" id="cc-cyber-source">SIMULATED DATA — source IPs are fake, positions are not real geolocation</div>
            <div id="cc-cyber-list" class="cc-scroll"></div>
          </div>
        </section>
      </aside>
    </main>
  </div>
`

const style = document.createElement('style')
style.textContent = `
  #cc-root { display:flex; flex-direction:column; height:100vh; background:#05070c; color:#e2e8f0; font-family:'Inter',system-ui,sans-serif; }
  #cc-header { display:flex; justify-content:space-between; align-items:center; padding:0.9rem 1.5rem; border-bottom:1px solid rgba(120,160,255,0.15); background:rgba(5,7,12,0.9); }
  .cc-header-right { display:flex; align-items:center; gap:1rem; }
  .cc-vw-toggle { display:flex; align-items:center; gap:0.4rem; font-size:0.7rem; color:#93c5fd; cursor:pointer; }
  .cc-logo { display:flex; align-items:center; gap:0.6rem; }
  .cc-logo-mark { width:26px; height:26px; border-radius:6px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem; }
  #cc-header h1 { font-size:0.95rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#bfdbfe; }
  #cc-status { font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:#93c5fd; }
  #cc-main { flex:1; display:grid; grid-template-columns:1fr 340px; min-height:0; }
  #cc-canvas-wrap { position:relative; }
  #cc-canvas-wrap canvas { display:block; width:100%; height:100%; }
  #cc-side { background:rgba(10,14,24,0.85); border-left:1px solid rgba(120,160,255,0.15); overflow-y:auto; scrollbar-width:thin; scrollbar-color:#2a3548 transparent; display:flex; flex-direction:column; }
  .cc-panel { border-bottom:1px solid rgba(120,160,255,0.1); }
  .cc-panel-head { width:100%; display:flex; justify-content:space-between; align-items:center; background:transparent; border:none; color:inherit; padding:0.75rem 1rem; cursor:pointer; font-family:inherit; }
  .cc-panel-title { font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:#93c5fd; }
  .cc-panel-actions { display:flex; align-items:center; gap:0.5rem; }
  .cc-chevron { font-size:0.7rem; color:#64748b; transition:transform 0.15s; }
  .cc-panel[data-open="false"] .cc-chevron { transform:rotate(-90deg); }
  .cc-panel[data-open="false"] .cc-panel-body { display:none; }
  .cc-panel-body { padding:0 1rem 0.85rem; }
  .cc-side-sub { font-size:0.62rem; color:#64748b; font-family:'JetBrains Mono',monospace; margin-bottom:0.6rem; line-height:1.5; }
  .cc-scroll { max-height:260px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#2a3548 transparent; }
  .cc-flight-row, .cc-cyber-row, .cc-threat-row { display:grid; grid-template-columns:14px 1fr auto; align-items:center; gap:0.5rem; padding:0.4rem 0.2rem; border-bottom:1px solid rgba(148,163,184,0.08); font-size:0.7rem; font-family:'JetBrains Mono',monospace; }
  .cc-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .cc-live-badge { font-size:0.55rem; padding:0.05rem 0.3rem; border-radius:4px; white-space:nowrap; }
  .cc-live-true { background:rgba(52,211,153,0.15); color:#6ee7b7; }
  .cc-live-false { background:rgba(148,163,184,0.15); color:#94a3b8; }
  .cc-switch input { cursor:pointer; }
  .cc-anomaly { color:#c4b5fd; }

  /* Video wall mode — larger everything for readability at a distance */
  #cc-root.cc-videowall #cc-header h1 { font-size:1.4rem; }
  #cc-root.cc-videowall #cc-status,
  #cc-root.cc-videowall .cc-vw-toggle { font-size:1rem; }
  #cc-root.cc-videowall #cc-main { grid-template-columns:1fr 480px; }
  #cc-root.cc-videowall .cc-panel-title { font-size:1.05rem; }
  #cc-root.cc-videowall .cc-side-sub { font-size:0.9rem; }
  #cc-root.cc-videowall .cc-flight-row,
  #cc-root.cc-videowall .cc-cyber-row,
  #cc-root.cc-videowall .cc-threat-row { font-size:1rem; padding:0.6rem 0.3rem; }
  #cc-root.cc-videowall .cc-scroll { max-height:380px; }
`
document.head.appendChild(style)

const canvasWrap = document.querySelector<HTMLDivElement>('#cc-canvas-wrap')!
const rootEl = document.querySelector<HTMLDivElement>('#cc-root')!
const statusEl = document.querySelector<HTMLDivElement>('#cc-status')!
const flightListEl = document.querySelector<HTMLDivElement>('#cc-flight-list')!
const flightSourceEl = document.querySelector<HTMLDivElement>('#cc-flight-source')!
const cyberListEl = document.querySelector<HTMLDivElement>('#cc-cyber-list')!
const threatListEl = document.querySelector<HTMLDivElement>('#cc-threat-list')!
const threatSourceEl = document.querySelector<HTMLDivElement>('#cc-threat-source')!
const flightsToggle = document.querySelector<HTMLInputElement>('#cc-toggle-flights')!
const cyberToggle = document.querySelector<HTMLInputElement>('#cc-toggle-cyber')!
const threatsToggle = document.querySelector<HTMLInputElement>('#cc-toggle-threats')!
const videowallToggle = document.querySelector<HTMLInputElement>('#cc-toggle-videowall')!

videowallToggle.addEventListener('change', () => {
  rootEl.classList.toggle('cc-videowall', videowallToggle.checked)
})

// Collapsible panels
document.querySelectorAll<HTMLButtonElement>('.cc-panel-head').forEach((btn) => {
  btn.addEventListener('click', () => {
    const panel = btn.closest<HTMLElement>('.cc-panel')!
    const isOpen = panel.dataset.open === 'true'
    panel.dataset.open = isOpen ? 'false' : 'true'
  })
})

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
camera.position.set(0, 0, 2.6)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
canvasWrap.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.minDistance = 1.3
controls.maxDistance = 6
controls.rotateSpeed = 0.45

const sun = new THREE.DirectionalLight(0xffffff, 2.2)
sun.position.set(5, 2, 3)
scene.add(sun)
scene.add(new THREE.AmbientLight(0x223344, 0.5))

const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      Array.from({ length: 1500 * 3 }, () => (Math.random() - 0.5) * 60),
      3
    )
  ),
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.6 })
)
scene.add(stars)

const globe = new Globe(1)
scene.add(globe.group)

const attackArcs = new AttackArcLayer(1)
scene.add(attackArcs.group)

function resize() {
  const w = canvasWrap.clientWidth
  const h = canvasWrap.clientHeight
  if (!w || !h) return
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
window.addEventListener('resize', resize)

const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  globe.update(delta)
  attackArcs.update(delta)
  controls.update()
  renderer.render(scene, camera)
}

function renderFlightList(data: FlightsResponse) {
  const liveCount = data.flights.filter((f) => f.live).length
  flightSourceEl.textContent = `${data.sources.join(' + ') || 'no source'} · ${liveCount} live / ${data.flights.length} total`
  statusEl.textContent = liveCount > 0 ? 'LIVE FEED ACTIVE' : 'FALLBACK DATA ONLY'

  flightListEl.innerHTML = data.flights
    .slice(0, 40)
    .map((f) => {
      const color = `#${TYPE_COLOR[f.type].toString(16).padStart(6, '0')}`
      return `
        <div class="cc-flight-row">
          <span class="cc-dot" style="background:${color}"></span>
          <span>${f.callsign} · ${f.type}${f.altitude ? ` · ${f.altitude}ft` : ''}</span>
          <span class="cc-live-badge ${f.live ? 'cc-live-true' : 'cc-live-false'}">${f.live ? 'LIVE' : 'DEMO'}</span>
        </div>
      `
    })
    .join('')
}

function updateGlobeMarkers(data: FlightsResponse) {
  for (const f of data.flights) {
    const id = f.icao24 || f.callsign
    globe.upsertMarker({ id, lat: f.lat, lon: f.lon, color: TYPE_COLOR[f.type] }, 'flights')
  }
}

function renderThreatList(data: ThreatsResponse) {
  threatSourceEl.textContent = `${data.source} · ${data.count} reported`
  threatListEl.innerHTML = data.threats
    .slice(0, 40)
    .map(
      (t) => `
        <div class="cc-threat-row">
          <span class="cc-dot" style="background:#f87171"></span>
          <span>${t.ip} · ${t.city}, ${t.country}</span>
          <span class="cc-live-badge cc-live-true">LIVE</span>
        </div>
      `
    )
    .join('')

  for (const t of data.threats) {
    globe.upsertMarker({ id: t.ip, lat: t.lat, lon: t.lon, color: 0xf87171 }, 'threats')
  }
}

function renderCyberLayer() {
  cyberListEl.innerHTML = SIMULATED_CYBER_EVENTS.map((ev) => {
    const color = `#${SEVERITY_COLOR[ev.severity].toString(16).padStart(6, '0')}`
    return `
      <div class="cc-cyber-row">
        <span class="cc-dot" style="background:${color}"></span>
        <span>${ev.time} · ${ev.desc}${ev.anomaly ? ' <span class="cc-anomaly">◆</span>' : ''}</span>
        <span class="cc-live-badge cc-live-false">DEMO</span>
      </div>
    `
  }).join('')

  for (const ev of SIMULATED_CYBER_EVENTS) {
    const from = ipToDemoLatLon(ev.srcIp)
    const to = ipToDemoLatLon(ev.dstIp)
    attackArcs.upsertArc({
      id: ev.id,
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      color: SEVERITY_COLOR[ev.severity],
    })
  }
}

async function pollFlights() {
  try {
    const res = await fetch('/api/flights')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: FlightsResponse = await res.json()
    renderFlightList(data)
    updateGlobeMarkers(data)
  } catch (err) {
    statusEl.textContent = 'FEED UNAVAILABLE'
    flightSourceEl.textContent = (err as Error).message
    console.error('[flights] poll failed:', err)
  }
}

async function pollThreats() {
  try {
    const res = await fetch('/api/threats')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: ThreatsResponse = await res.json()
    renderThreatList(data)
  } catch (err) {
    threatSourceEl.textContent = `unavailable: ${(err as Error).message}`
    console.error('[threats] poll failed:', err)
  }
}

flightsToggle.addEventListener('change', () => {
  globe.setMarkersVisible(flightsToggle.checked, 'flights')
})

cyberToggle.addEventListener('change', () => {
  attackArcs.setVisible(cyberToggle.checked)
})

threatsToggle.addEventListener('change', () => {
  globe.setMarkersVisible(threatsToggle.checked, 'threats')
})

async function boot() {
  await globe.init('./textures')
  resize()
  animate()
  renderCyberLayer()
  await pollFlights()
  await pollThreats()
  setInterval(pollFlights, 20_000)
  setInterval(pollThreats, 60_000)
}

boot()
