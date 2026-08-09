import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Globe } from './globe'
import { AttackArcLayer } from './attackArc'
import { SIMULATED_CYBER_EVENTS, ipToDemoLatLon, applyIncidentAction, type Severity, type IncidentStatus, type CyberEvent } from './data/cyberEvents'
import { OSINT_SECTIONS } from './data/osint'
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
    <div id="cc-ticker">
      <div id="cc-ticker-inner">
        KCN COMMAND CENTER — LIVE MILITARY AIR TRACKING · REAL THREAT INTELLIGENCE FEED · SIMULATED ATTACK TRACE VISUALIZATION · OSINT SURVEILLANCE AWARENESS &nbsp;&nbsp;&nbsp;&nbsp;
        KCN COMMAND CENTER — LIVE MILITARY AIR TRACKING · REAL THREAT INTELLIGENCE FEED · SIMULATED ATTACK TRACE VISUALIZATION · OSINT SURVEILLANCE AWARENESS &nbsp;&nbsp;&nbsp;&nbsp;
      </div>
    </div>
    <header id="cc-header">
      <div class="cc-logo">
        <div class="cc-logo-mark">◈</div>
        <div>
          <div class="cc-brand-name">KCN</div>
          <div class="cc-brand-sub">COMMAND CENTER</div>
        </div>
      </div>
      <div class="cc-header-right">
        <label class="cc-vw-toggle">
          <input type="checkbox" id="cc-toggle-videowall" />
          VIDEO WALL MODE
        </label>
        <div class="cc-live-indicator"><span class="cc-sdot"></span> LIVE</div>
        <div class="cc-status" id="cc-status">INITIALIZING…</div>
      </div>
    </header>
    <main id="cc-main">
      <div id="cc-canvas-wrap">
        <div id="cc-globe-loading">LOADING GLOBE TEXTURES…</div>
      </div>
      <aside id="cc-side">
        <section class="cc-panel" data-open="true">
          <button class="cc-panel-head" data-toggle="flights">
            <span class="cc-panel-title"><span class="cc-pd cc-pd-b"></span>LIVE MILITARY AIR TRAFFIC</span>
            <span class="cc-panel-actions">
              <label class="cc-switch" onclick="event.stopPropagation()">
                <input type="checkbox" id="cc-toggle-flights" checked />
              </label>
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div class="cc-side-sub" id="cc-flight-source">CONNECTING…</div>
            <div id="cc-flight-list" class="cc-scroll"></div>
          </div>
        </section>

        <section class="cc-panel" data-open="true">
          <button class="cc-panel-head" data-toggle="threats">
            <span class="cc-panel-title"><span class="cc-pd cc-pd-r"></span>REAL THREAT FEED (BLOCKLIST.DE)</span>
            <span class="cc-panel-actions">
              <label class="cc-switch" onclick="event.stopPropagation()">
                <input type="checkbox" id="cc-toggle-threats" checked />
              </label>
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div class="cc-side-sub" id="cc-threat-source">CONNECTING…</div>
            <div class="cc-side-sub">IPs reported recently as abuse sources somewhere on the internet — not necessarily targeting this system, and not a claim about who's behind them.</div>
            <div id="cc-threat-list" class="cc-scroll"></div>
          </div>
        </section>

        <section class="cc-panel" data-open="true">
          <button class="cc-panel-head" data-toggle="cyber">
            <span class="cc-panel-title"><span class="cc-pd cc-pd-o"></span>SIMULATED CYBER ATTACK TRACES</span>
            <span class="cc-panel-actions">
              <label class="cc-switch" onclick="event.stopPropagation()">
                <input type="checkbox" id="cc-toggle-cyber" checked />
              </label>
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div class="cc-side-sub">SIMULATED DATA — source IPs are fake, positions are not real geolocation</div>
            <table class="cc-packet-table">
              <thead><tr><th>SEV</th><th>TIME</th><th>DESC</th></tr></thead>
              <tbody id="cc-packet-tbody"></tbody>
            </table>
            <div id="cc-event-detail"></div>
          </div>
        </section>

        <section class="cc-panel" data-open="false">
          <button class="cc-panel-head" data-toggle="osint">
            <span class="cc-panel-title"><span class="cc-pd cc-pd-c"></span>OSINT &amp; SURVEILLANCE AWARENESS</span>
            <span class="cc-panel-actions">
              <span class="cc-chevron">▾</span>
            </span>
          </button>
          <div class="cc-panel-body">
            <div id="cc-osint-content"></div>
          </div>
        </section>
      </aside>
    </main>
  </div>
`

const style = document.createElement('style')
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

  :root {
    --bg0:#020509; --bg1:#07090e; --bg2:#0b1018; --bg3:#101620;
    --accent:#00d4ff; --danger:#ff3333; --warn:#ff8800; --ok:#00cc66; --info:#00aaff; --purple:#a855f7;
    --b1:rgba(0,212,255,0.10); --b2:rgba(0,212,255,0.25);
    --t1:#ddeef5; --t2:#6a8fa8; --t3:#2e4a5a;
    --mono:'Share Tech Mono',monospace; --head:'Orbitron',monospace; --body:'Rajdhani',sans-serif;
  }

  #cc-root { display:flex; flex-direction:column; height:100vh; background:var(--bg0); color:var(--t1); font-family:var(--body); font-size:13px; }

  #cc-ticker { flex-shrink:0; background:rgba(255,30,30,0.06); border-bottom:1px solid rgba(255,50,50,0.15); padding:3px 0; overflow:hidden; }
  #cc-ticker-inner { display:inline-flex; white-space:nowrap; animation:cc-ticker-scroll 32s linear infinite; font-family:var(--mono); font-size:9px; color:#ff9999; letter-spacing:0.5px; padding-left:100%; }
  @keyframes cc-ticker-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

  #cc-header { display:flex; justify-content:space-between; align-items:center; padding:0 1.1rem; height:52px; border-bottom:1px solid var(--b2); background:var(--bg1); position:relative; }
  #cc-header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--accent) 40%,var(--accent) 60%,transparent); opacity:0.25; }
  .cc-header-right { display:flex; align-items:center; gap:1rem; }
  .cc-vw-toggle { display:flex; align-items:center; gap:0.4rem; font-family:var(--mono); font-size:8px; letter-spacing:1.5px; color:var(--t2); cursor:pointer; }
  .cc-logo { display:flex; align-items:center; gap:0.6rem; }
  .cc-logo-mark { width:30px; height:30px; border:1.5px solid var(--accent); border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--accent); flex-shrink:0; }
  .cc-brand-name { font-family:var(--head); font-size:15px; font-weight:900; letter-spacing:5px; color:var(--accent); text-shadow:0 0 20px rgba(0,212,255,0.3); }
  .cc-brand-sub { font-family:var(--mono); font-size:8px; color:var(--t3); letter-spacing:2px; margin-top:1px; }
  .cc-live-indicator { display:flex; align-items:center; gap:6px; font-family:var(--mono); font-size:9px; letter-spacing:1px; color:var(--ok); }
  .cc-sdot { width:6px; height:6px; border-radius:50%; background:var(--ok); box-shadow:0 0 5px var(--ok); animation:cc-blink 2s infinite; }
  @keyframes cc-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  #cc-status { font-family:var(--mono); font-size:9px; letter-spacing:1px; color:var(--accent); }

  #cc-main { flex:1; display:grid; grid-template-columns:1fr 340px; min-height:0; background:var(--b1); gap:1px; }
  #cc-canvas-wrap { position:relative; background:var(--bg0); }
  #cc-canvas-wrap canvas { display:block; width:100%; height:100%; }
  #cc-globe-loading { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--accent); font-family:var(--mono); font-size:10px; letter-spacing:2px; text-align:center; padding:2rem; }

  #cc-side { background:var(--bg1); overflow-y:auto; scrollbar-width:thin; scrollbar-color:var(--b2) transparent; display:flex; flex-direction:column; }
  #cc-side::-webkit-scrollbar { width:3px; }
  #cc-side::-webkit-scrollbar-thumb { background:var(--b2); }

  .cc-panel { border-bottom:1px solid var(--b1); }
  .cc-panel-head { width:100%; display:flex; justify-content:space-between; align-items:center; background:var(--bg2); border:none; border-bottom:1px solid var(--b1); color:inherit; padding:7px 12px; cursor:pointer; font-family:inherit; }
  .cc-panel-title { display:flex; align-items:center; gap:7px; font-family:var(--mono); font-size:9px; text-transform:uppercase; letter-spacing:1.5px; color:var(--accent); }
  .cc-pd { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .cc-pd-r { background:var(--danger); box-shadow:0 0 4px var(--danger); }
  .cc-pd-o { background:var(--warn); box-shadow:0 0 4px var(--warn); }
  .cc-pd-g { background:var(--ok); box-shadow:0 0 4px var(--ok); }
  .cc-pd-b { background:var(--info); box-shadow:0 0 4px var(--info); }
  .cc-pd-c { background:var(--accent); box-shadow:0 0 4px var(--accent); }
  .cc-panel-actions { display:flex; align-items:center; gap:0.5rem; }
  .cc-chevron { font-size:9px; color:var(--t3); transition:transform 0.15s; }
  .cc-panel[data-open="false"] .cc-chevron { transform:rotate(-90deg); }
  .cc-panel[data-open="false"] .cc-panel-body { display:none; }
  .cc-panel-body { padding:10px 12px; }
  .cc-side-sub { font-family:var(--mono); font-size:8px; letter-spacing:0.5px; color:var(--t3); margin-bottom:0.6rem; line-height:1.5; }
  .cc-scroll { max-height:260px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:var(--b2) transparent; }
  .cc-flight-row, .cc-cyber-row, .cc-threat-row { display:grid; grid-template-columns:14px 1fr auto; align-items:center; gap:0.5rem; padding:6px 2px; border-bottom:1px solid rgba(0,212,255,0.05); font-size:10px; font-family:var(--mono); }
  .cc-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .cc-live-badge { font-family:var(--mono); font-size:7px; letter-spacing:1px; padding:1px 5px; border-radius:2px; white-space:nowrap; border:1px solid; }
  .cc-live-true { border-color:rgba(0,204,102,0.4); color:var(--ok); background:rgba(0,204,102,0.08); }
  .cc-live-false { border-color:var(--t3); color:var(--t2); background:transparent; }
  .cc-switch input { cursor:pointer; accent-color:var(--accent); }
  .cc-anomaly { color:var(--purple); }

  /* Packet table + incident detail */
  .cc-packet-table { width:100%; border-collapse:collapse; font-family:var(--mono); font-size:9px; }
  .cc-packet-table thead th { text-align:left; padding:4px 4px; color:var(--t3); text-transform:uppercase; font-size:8px; letter-spacing:1px; border-bottom:1px solid var(--b1); position:sticky; top:0; background:var(--bg2); }
  .cc-packet-row { cursor:pointer; transition:background 0.15s; }
  .cc-packet-row td { padding:5px 4px; border-bottom:1px solid rgba(0,212,255,0.04); }
  .cc-packet-row:hover td { background:rgba(0,212,255,0.03); }
  .cc-packet-row.selected td { background:rgba(0,212,255,0.08); }
  .cc-detail-panel { margin-top:8px; background:var(--bg2); border:1px solid var(--b2); border-radius:3px; padding:10px; font-size:10px; }
  .cc-detail-row { display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px dashed rgba(0,212,255,0.08); font-family:var(--mono); font-size:9px; }
  .cc-detail-row span:first-child { color:var(--t3); letter-spacing:1px; }
  .cc-assets-list { display:flex; flex-wrap:wrap; gap:4px; margin:6px 0 8px; }
  .cc-asset-chip { background:rgba(0,212,255,0.06); border:1px solid var(--b1); border-radius:2px; padding:2px 7px; font-size:8px; font-family:var(--mono); color:var(--t2); }
  .cc-action-row { display:flex; gap:5px; flex-wrap:wrap; margin-top:8px; }
  .cc-action-btn { background:rgba(0,212,255,0.08); border:1px solid var(--b2); color:var(--accent); border-radius:2px; padding:5px 9px; font-size:8px; letter-spacing:1px; cursor:pointer; font-family:var(--mono); transition:all 0.2s; }
  .cc-action-btn:hover { background:rgba(0,212,255,0.18); }
  .cc-status-pill { font-family:var(--mono); font-size:7px; letter-spacing:1px; padding:1px 6px; border-radius:2px; text-transform:uppercase; border:1px solid; }
  .cc-status-open { border-color:rgba(255,51,51,0.35); color:#ff8888; background:rgba(255,51,51,0.08); }
  .cc-status-acknowledged { border-color:rgba(255,136,0,0.35); color:#ffaa55; background:rgba(255,136,0,0.08); }
  .cc-status-escalated { border-color:rgba(168,85,247,0.35); color:#c9a3fa; background:rgba(168,85,247,0.08); }
  .cc-status-isolated { border-color:rgba(0,204,102,0.35); color:var(--ok); background:rgba(0,204,102,0.08); }
  .cc-prototype-note { font-family:var(--mono); font-size:8px; color:var(--t3); font-style:italic; margin-top:6px; }

  /* OSINT panel */
  .cc-osint-section { margin-bottom:0.9rem; }
  .cc-osint-title { font-family:var(--mono); font-size:9px; font-weight:700; letter-spacing:1px; color:var(--accent); margin-bottom:5px; }
  .cc-osint-card { background:var(--bg2); border:1px solid var(--b1); border-radius:3px; padding:10px; font-size:11px; line-height:1.55; color:var(--t2); }
  .cc-osint-card a { color:var(--accent); }
  .cc-osint-card ul { margin:5px 0 0 1rem; padding:0; }
  .cc-osint-card li { margin-bottom:0.2rem; }
  .cc-osint-warning { background:rgba(255,51,51,0.08); border:1px solid rgba(255,51,51,0.25); border-radius:3px; padding:8px; font-size:9px; color:#ff9999; margin-top:8px; }

  /* Video wall mode — larger everything for readability at a distance */
  #cc-root.cc-videowall .cc-brand-name { font-size:22px; }
  #cc-root.cc-videowall #cc-status,
  #cc-root.cc-videowall .cc-vw-toggle { font-size:12px; }
  #cc-root.cc-videowall #cc-main { grid-template-columns:1fr 480px; }
  #cc-root.cc-videowall .cc-panel-title { font-size:13px; }
  #cc-root.cc-videowall .cc-side-sub { font-size:11px; }
  #cc-root.cc-videowall .cc-flight-row,
  #cc-root.cc-videowall .cc-cyber-row,
  #cc-root.cc-videowall .cc-threat-row { font-size:12px; padding:8px 3px; }
  #cc-root.cc-videowall .cc-scroll { max-height:380px; }
`
document.head.appendChild(style)

const canvasWrap = document.querySelector<HTMLDivElement>('#cc-canvas-wrap')!
const rootEl = document.querySelector<HTMLDivElement>('#cc-root')!
const statusEl = document.querySelector<HTMLDivElement>('#cc-status')!
const flightListEl = document.querySelector<HTMLDivElement>('#cc-flight-list')!
const flightSourceEl = document.querySelector<HTMLDivElement>('#cc-flight-source')!
const packetTbodyEl = document.querySelector<HTMLTableSectionElement>('#cc-packet-tbody')!
const eventDetailEl = document.querySelector<HTMLDivElement>('#cc-event-detail')!
const osintContentEl = document.querySelector<HTMLDivElement>('#cc-osint-content')!
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

// Local, in-memory copy so incident response actions can update status —
// this is a UI-only simulation, there is no backend SIEM behind it.
let cyberEvents: CyberEvent[] = [...SIMULATED_CYBER_EVENTS]
let selectedEventId: string | null = null

function renderPacketTable() {
  packetTbodyEl.innerHTML = cyberEvents
    .map((ev) => {
      const color = `#${SEVERITY_COLOR[ev.severity].toString(16).padStart(6, '0')}`
      return `
        <tr class="cc-packet-row ${ev.id === selectedEventId ? 'selected' : ''}" data-id="${ev.id}">
          <td style="color:${color}">${ev.severity.toUpperCase()}</td>
          <td>${ev.time}</td>
          <td>${ev.desc}${ev.anomaly ? ' <span class="cc-anomaly">◆</span>' : ''}</td>
        </tr>
      `
    })
    .join('')

  packetTbodyEl.querySelectorAll<HTMLTableRowElement>('.cc-packet-row').forEach((row) => {
    row.addEventListener('click', () => {
      selectedEventId = selectedEventId === row.dataset.id ? null : row.dataset.id || null
      renderPacketTable()
      renderEventDetail()
    })
  })
}

function statusPillClass(status: IncidentStatus) {
  return `cc-status-${status}`
}

function renderEventDetail() {
  if (!selectedEventId) {
    eventDetailEl.innerHTML = ''
    return
  }
  const ev = cyberEvents.find((e) => e.id === selectedEventId)
  if (!ev) return

  eventDetailEl.innerHTML = `
    <div class="cc-detail-panel">
      <div class="cc-detail-row"><span>Status</span><span class="cc-status-pill ${statusPillClass(ev.status)}">${ev.status}</span></div>
      <div class="cc-detail-row"><span>Protocol</span><span>${ev.proto}</span></div>
      <div class="cc-detail-row"><span>Source → Destination</span><span>${ev.srcIp} → ${ev.dstIp}</span></div>
      <div style="margin-top:0.4rem;color:#64748b;font-size:0.6rem;">AFFECTED ASSETS</div>
      <div class="cc-assets-list">${ev.assets.map((a) => `<span class="cc-asset-chip">${a}</span>`).join('') || '<span class="cc-asset-chip">none</span>'}</div>
      <div class="cc-action-row">
        <button class="cc-action-btn" data-action="acknowledged">Acknowledge</button>
        <button class="cc-action-btn" data-action="escalated">Escalate</button>
        <button class="cc-action-btn" data-action="isolated">Isolate host</button>
      </div>
      <div class="cc-prototype-note">Response actions update this local view only — no live SIEM is connected.</div>
    </div>
  `

  eventDetailEl.querySelectorAll<HTMLButtonElement>('.cc-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action as IncidentStatus
      cyberEvents = cyberEvents.map((e) => (e.id === ev.id ? applyIncidentAction(e, action) : e))
      renderPacketTable()
      renderEventDetail()
    })
  })
}

function renderOsintPanel() {
  osintContentEl.innerHTML = OSINT_SECTIONS.map(
    (section) => `
      <div class="cc-osint-section">
        <div class="cc-osint-title">${section.title}</div>
        <div class="cc-osint-card">
          <ul>${section.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
          ${section.link ? `<a href="${section.link.url}" target="_blank" rel="noopener">${section.link.label}</a>` : ''}
          ${section.warning ? `<div class="cc-osint-warning">${section.warning}</div>` : ''}
        </div>
      </div>
    `
  ).join('')
}

function renderCyberLayer() {
  renderPacketTable()
  for (const ev of cyberEvents) {
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
    const res = await fetch('/api/flights', { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: FlightsResponse = await res.json()
    renderFlightList(data)
    updateGlobeMarkers(data)
  } catch (err) {
    statusEl.textContent = 'FEED UNAVAILABLE'
    flightSourceEl.textContent =
      err instanceof Error && err.name === 'TimeoutError'
        ? 'timed out (no backend on this deployment?)'
        : (err as Error).message
    console.error('[flights] poll failed:', err)
  }
}

async function pollThreats() {
  try {
    const res = await fetch('/api/threats', { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: ThreatsResponse = await res.json()
    renderThreatList(data)
  } catch (err) {
    threatSourceEl.textContent =
      err instanceof Error && err.name === 'TimeoutError'
        ? 'unavailable: timed out (no backend on this deployment?)'
        : `unavailable: ${(err as Error).message}`
    console.error('[threats] poll failed:', err)
  }
}

flightsToggle.addEventListener('change', () => {
  globe.setMarkersVisible(flightsToggle.checked, 'flights')
  flightListEl.style.display = flightsToggle.checked ? '' : 'none'
})

cyberToggle.addEventListener('change', () => {
  attackArcs.setVisible(cyberToggle.checked)
  packetTbodyEl.closest('table')!.style.display = cyberToggle.checked ? '' : 'none'
  eventDetailEl.style.display = cyberToggle.checked ? '' : 'none'
})

threatsToggle.addEventListener('change', () => {
  globe.setMarkersVisible(threatsToggle.checked, 'threats')
  threatListEl.style.display = threatsToggle.checked ? '' : 'none'
})

/**
 * Boot sequence, made resilient on purpose: the globe's textures (~3MB,
 * 5 separate loads) are the slowest and most failure-prone part of
 * startup. Everything else — the packet table, OSINT panel, and the
 * live data polls — must not be gated behind that succeeding. Previously
 * they were all sequential awaits after globe.init(), so a slow or
 * failed texture load silently blocked the rest of the UI from ever
 * populating (an unhandled rejection with no visible error) — this is
 * the fix for that.
 */
async function boot() {
  // Local data, no network dependency — render immediately.
  renderCyberLayer()
  renderOsintPanel()

  // Live data polling — independent of the globe, independent of each other.
  pollFlights()
  pollThreats()
  setInterval(pollFlights, 20_000)
  setInterval(pollThreats, 60_000)

  // The globe itself — failure here must not take down anything above.
  try {
    await globe.init('./textures')
    canvasWrap.innerHTML = '' // clear the loading message
    canvasWrap.appendChild(renderer.domElement)
    resize()
    animate()
  } catch (err) {
    console.error('[globe] failed to initialize:', err)
    canvasWrap.innerHTML = `<div style="color:#f87171;font-family:monospace;font-size:0.8rem;padding:2rem;">
      Globe failed to load: ${err instanceof Error ? err.message : 'unknown error'}.
      The panels on the right should still work.
    </div>`
  }
}

boot()

