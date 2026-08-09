/**
 * Real, live threat feed. No signup/API key required for either service:
 *
 * - blocklist.de publishes a plain-text list of IPs recently reported as
 *   attack sources (SSH brute force, mail abuse, web exploit attempts,
 *   etc.) by its network of fail2ban-style reporters. Free, no key.
 * - ip-api.com's free tier geolocates IPs without an API key (rate
 *   limited to 45 requests/minute — respected via a small batch + cache
 *   below).
 *
 * Important: this tells you an IP was *reported somewhere* recently as a
 * source of abusive traffic — not that it's actively attacking this
 * specific system right now, and not who the intended target was. The
 * UI must not imply otherwise.
 */

import type { ThreatRecord, ThreatsResponse } from '../../src/data/types.js'

const BLOCKLIST_URL = 'https://lists.blocklist.de/lists/all.txt'
const GEOLOCATE_BATCH_URL = 'http://ip-api.com/batch?fields=status,lat,lon,country,city,query'
const MAX_IPS_PER_POLL = 40 // keep well under ip-api's 45/min free-tier limit

async function fetchRecentAttackerIps(): Promise<string[]> {
  const res = await fetch(BLOCKLIST_URL, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`blocklist.de returned HTTP ${res.status}`)
  const text = await res.text()

  const ips = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(line))

  // The list has no reliable ordering guarantee we can rely on for
  // "most recent" — take a random sample instead of always the same
  // first N, so repeated polls surface variety rather than one static set.
  const shuffled = [...ips].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, MAX_IPS_PER_POLL)
}

interface GeoResult {
  status: 'success' | 'fail'
  lat?: number
  lon?: number
  country?: string
  city?: string
  query: string
}

async function geolocate(ips: string[]): Promise<ThreatRecord[]> {
  if (ips.length === 0) return []

  const res = await fetch(GEOLOCATE_BATCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ips.map((ip) => ({ query: ip }))),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`ip-api.com returned HTTP ${res.status}`)

  const results = (await res.json()) as GeoResult[]
  return results
    .filter((r) => r.status === 'success' && r.lat !== undefined && r.lon !== undefined)
    .map((r) => ({
      ip: r.query,
      lat: r.lat as number,
      lon: r.lon as number,
      country: r.country || 'Unknown',
      city: r.city || 'Unknown',
      live: true,
    }))
}

let cache: { data: ThreatsResponse; expiresAt: number } | null = null
const CACHE_TTL_MS = 60_000 // longer TTL than flights — this data doesn't need to update as fast, and it protects ip-api.com's rate limit

export async function getThreats(): Promise<ThreatsResponse> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data
  }

  let threats: ThreatRecord[] = []
  let source = 'unavailable'

  try {
    const ips = await fetchRecentAttackerIps()
    threats = await geolocate(ips)
    if (threats.length > 0) source = 'blocklist.de + ip-api.com'
  } catch (err) {
    console.error('[threats] fetch failed:', (err as Error).message)
  }

  const response: ThreatsResponse = {
    threats,
    count: threats.length,
    source,
    timestamp: new Date().toISOString(),
  }

  cache = { data: response, expiresAt: Date.now() + CACHE_TTL_MS }
  return response
}
