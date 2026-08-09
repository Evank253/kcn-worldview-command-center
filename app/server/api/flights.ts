/**
 * Live military-relevant flight fetcher.
 *
 * Adapted from worldview_command_sentinel_axonia-app's api/adsb.js. Fixed
 * one real bug from that version: its "curated fallback" aircraft were
 * hardcoded static positions but marked `live: true`, which is misleading
 * — a viewer would reasonably read that as real-time data. Here, only
 * data that actually came from OpenSky this request is marked live; the
 * curated set (used purely to keep the globe from looking empty when the
 * live feed returns little/nothing) is explicitly `live: false`.
 */

import type { AircraftType, FlightRecord, FlightsResponse } from '../../src/data/types.js'

const MILITARY_CALLSIGN_PATTERNS = [
  /^(RCH|REACH)\d+/i,
  /^(OLIVE|JAKE|COBRA|DUKE|REDEYE|BISON|ZINC|IRON|HAVOC|HAWK|AZTEK)\d*/i,
  /^(CNV|CONVOY|SPAR|SAM)\d+/i,
  /^(VM|VV|ZZ|ZK|ZM)\d+/i,
]

const MILITARY_HEX_PREFIXES = ['ae', 'a0c', '43c', '3f4', '3c6', '484', '500']

const CURATED_FALLBACK: FlightRecord[] = [
  { callsign: 'OLIVE01', type: 'ISR', aircraft: 'RC-135V', lat: 36.5, lon: 28.2, altitude: 34000, speed: 480, heading: 95, country: 'USA', live: false, source: 'SENTINEL/Curated' },
  { callsign: 'JAKE21', type: 'ISR', aircraft: 'P-8A', lat: 40.2, lon: 17.5, altitude: 28000, speed: 440, heading: 180, country: 'USA', live: false, source: 'SENTINEL/Curated' },
  { callsign: 'QUID41', type: 'TANKER', aircraft: 'KC-135', lat: 55.1, lon: 2.4, altitude: 26000, speed: 490, heading: 45, country: 'USA', live: false, source: 'SENTINEL/Curated' },
  { callsign: 'COBRA11', type: 'FIGHTER', aircraft: 'F-35A', lat: 50.8, lon: 16.2, altitude: 22000, speed: 520, heading: 70, country: 'USA', live: false, source: 'SENTINEL/Curated' },
  { callsign: 'DUKE01', type: 'BOMBER', aircraft: 'B-52H', lat: 42.5, lon: -28.4, altitude: 40000, speed: 520, heading: 60, country: 'USA', live: false, source: 'SENTINEL/Curated' },
  { callsign: 'AZTEC55', type: 'AEW', aircraft: 'E-3G', lat: 52.2, lon: 22.5, altitude: 29000, speed: 460, heading: 90, country: 'USA', live: false, source: 'SENTINEL/Curated' },
]

function classifyAircraft(callsign: string | null, hex: string | null): AircraftType | null {
  if (!callsign) return null
  const cs = callsign.trim().toUpperCase()

  if (/RC-?135|P-?8|U-?2|EP-?3|E-?8/.test(cs)) return 'ISR'
  if (/^(OLIVE|JAKE|IRON)\d+/.test(cs)) return 'ISR'
  if (/^(QUID|PATO|ROCKY|ATLAS|REACH|RCH)\d+/.test(cs)) return 'TANKER'
  if (/KC-?135|KC-?46|KC-?10/.test(cs)) return 'TANKER'
  if (/^(AZTEK|SENTRY)\d*/.test(cs)) return 'AEW'
  if (/E-?3|E-?2|AWACS/.test(cs)) return 'AEW'
  if (/^(DUKE|BISON)\d+/.test(cs)) return 'BOMBER'
  if (/B-?52|B-?1|B-?2/.test(cs)) return 'BOMBER'
  if (/^(COBRA|VIPER|REDEYE|HAVOC)\d+/.test(cs)) return 'FIGHTER'

  if (hex) {
    const h = hex.toLowerCase()
    if (MILITARY_HEX_PREFIXES.some((p) => h.startsWith(p))) return 'MILITARY'
  }
  if (MILITARY_CALLSIGN_PATTERNS.some((p) => p.test(cs))) return 'PATROL'
  return null
}

interface OpenSkyState {
  0: string // icao24
  1: string | null // callsign
  2: string // origin_country
  5: number | null // lon
  6: number | null // lat
  7: number | null // baro_altitude (m)
  8: boolean // on_ground
  9: number | null // velocity (m/s)
  10: number | null // heading
}

async function fetchOpenSky(): Promise<FlightRecord[]> {
  const boxes = [
    { name: 'Europe', lamin: 35, lomin: -15, lamax: 72, lomax: 45 },
    { name: 'Middle East', lamin: 10, lomin: 25, lamax: 38, lomax: 65 },
    { name: 'Pacific', lamin: 0, lomin: 100, lamax: 55, lomax: 180 },
    { name: 'Atlantic', lamin: 20, lomin: -80, lamax: 60, lomax: -10 },
  ]

  const results: FlightRecord[] = []

  for (const box of boxes) {
    try {
      const url = `https://opensky-network.org/api/states/all?lamin=${box.lamin}&lomin=${box.lomin}&lamax=${box.lamax}&lomax=${box.lomax}`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const data = (await res.json()) as { states?: OpenSkyState[] }
      if (!data.states) continue

      for (const state of data.states) {
        const [icao24, callsignRaw, originCountry, , , lon, lat, baroAlt, onGround, velocity, heading] = state
        if (onGround || lat === null || lon === null) continue

        const cs = (callsignRaw || '').trim()
        if (!cs) continue

        const type = classifyAircraft(cs, icao24)
        if (!type) continue

        results.push({
          callsign: cs,
          icao24,
          type,
          aircraft: 'UNKNOWN',
          lat: Number(lat.toFixed(4)),
          lon: Number(lon.toFixed(4)),
          altitude: baroAlt ? Math.round(baroAlt * 3.28084) : null,
          speed: velocity ? Math.round(velocity * 1.944) : null,
          heading: heading ? Math.round(heading) : null,
          country: originCountry,
          live: true,
          source: 'OpenSky',
        })
      }
    } catch (err) {
      console.error(`OpenSky fetch failed for ${box.name}:`, (err as Error).message)
    }
  }

  return results
}

let cache: { data: FlightsResponse; expiresAt: number } | null = null
const CACHE_TTL_MS = 15_000

/**
 * Fetch (or return cached) flight data. Cached briefly so many concurrent
 * browser clients don't each trigger a fresh OpenSky call — OpenSky's
 * public API has fair-use rate limits.
 */
export async function getFlights(): Promise<FlightsResponse> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data
  }

  const live = await fetchOpenSky()
  const sources: string[] = []
  if (live.length > 0) sources.push('OpenSky Network')

  const liveCallsigns = new Set(live.map((f) => f.callsign))
  const curatedExtra = CURATED_FALLBACK.filter((f) => !liveCallsigns.has(f.callsign))
  if (curatedExtra.length > 0) sources.push('SENTINEL Curated (not live)')

  const flights = [...live, ...curatedExtra]
  const typePriority: Record<string, number> = { ISR: 0, BOMBER: 1, FIGHTER: 2, AEW: 3, TANKER: 4, PATROL: 5, MILITARY: 6, UNKNOWN: 7 }
  flights.sort((a, b) => {
    if (a.live !== b.live) return a.live ? -1 : 1
    return (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9)
  })

  const response: FlightsResponse = {
    flights: flights.slice(0, 150),
    count: flights.length,
    sources,
    timestamp: new Date().toISOString(),
  }

  cache = { data: response, expiresAt: Date.now() + CACHE_TTL_MS }
  return response
}
