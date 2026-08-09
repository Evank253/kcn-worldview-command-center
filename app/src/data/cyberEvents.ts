export type Severity = 'high' | 'med' | 'low' | 'info'

export interface CyberEvent {
  id: string
  severity: Severity
  time: string
  srcIp: string
  dstIp: string
  proto: string
  desc: string
  anomaly: boolean
}

/**
 * The same simulated event set built for Cyber-Security-HQ's packet table.
 * These are demo IPs, not real attacker infrastructure — see
 * ipToDemoLatLon() below for why their map positions are explicitly
 * fake, not real geolocation.
 */
export const SIMULATED_CYBER_EVENTS: CyberEvent[] = [
  { id: 'ev1', severity: 'high', time: '14:22:01', srcIp: '10.0.4.12', dstIp: '185.220.101.4', proto: 'TCP:443', desc: 'Suspicious outbound (C2 pattern)', anomaly: true },
  { id: 'ev2', severity: 'med', time: '14:21:47', srcIp: '203.0.113.9', dstIp: '10.0.1.5', proto: 'TCP:22', desc: 'Failed auth burst', anomaly: false },
  { id: 'ev3', severity: 'low', time: '14:21:12', srcIp: '198.51.100.22', dstIp: '10.0.0.0/16', proto: 'TCP:SYN', desc: 'Port scan noise (filtered)', anomaly: false },
  { id: 'ev4', severity: 'high', time: '14:20:55', srcIp: '10.0.4.12', dstIp: '185.220.101.4', proto: 'TCP:443', desc: 'Possible beacon interval match', anomaly: true },
  { id: 'ev5', severity: 'med', time: '14:19:33', srcIp: '10.0.2.8', dstIp: '8.8.8.8', proto: 'UDP:53', desc: 'Unusual DNS query volume', anomaly: true },
  { id: 'ev7', severity: 'high', time: '14:17:22', srcIp: '10.0.4.19', dstIp: '203.0.113.44', proto: 'SMB:445', desc: 'Lateral movement signature detected', anomaly: true },
  { id: 'ev9', severity: 'low', time: '14:15:40', srcIp: '91.203.5.10', dstIp: '10.0.1.5', proto: 'TCP:443', desc: 'Geo-IP anomaly (benign)', anomaly: false },
]

/**
 * Deterministic hash of a string to a 32-bit unsigned integer (FNV-1a).
 * Pure and stable across runs — same input always produces the same
 * output, which is what makes the "fake geolocation" below stable
 * instead of jittering every render.
 */
export function hashString(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Maps an IP string to a deterministic but ENTIRELY FAKE lat/lon.
 *
 * This is not real IP geolocation — it has no relationship to where
 * that IP actually is. It exists purely so the demo event set draws to
 * consistent, stable positions on the globe instead of random ones each
 * render. Do not present this as real attacker geolocation; the UI
 * layer must label this data as simulated.
 */
export function ipToDemoLatLon(ip: string): { lat: number; lon: number } {
  const h = hashString(ip)
  const lat = (h % 1000) / 1000 * 140 - 70 // -70..70, avoids poles
  const lon = ((h >>> 10) % 1000) / 1000 * 360 - 180 // -180..180
  return { lat, lon }
}
