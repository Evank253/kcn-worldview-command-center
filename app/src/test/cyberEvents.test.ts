import { describe, expect, it } from 'vitest'
import { hashString, ipToDemoLatLon, SIMULATED_CYBER_EVENTS } from '../data/cyberEvents'

describe('hashString', () => {
  it('is deterministic for the same input', () => {
    expect(hashString('185.220.101.4')).toBe(hashString('185.220.101.4'))
  })

  it('produces different values for different inputs', () => {
    expect(hashString('185.220.101.4')).not.toBe(hashString('8.8.8.8'))
  })

  it('always returns a non-negative 32-bit integer', () => {
    const inputs = ['1.1.1.1', '', 'a very long string with spaces and punctuation!!!', '10.0.0.1']
    for (const input of inputs) {
      const h = hashString(input)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xffffffff)
    }
  })
})

describe('ipToDemoLatLon', () => {
  it('is deterministic for the same IP', () => {
    const a = ipToDemoLatLon('203.0.113.9')
    const b = ipToDemoLatLon('203.0.113.9')
    expect(a).toEqual(b)
  })

  it('stays within valid, pole-avoiding latitude range', () => {
    const ips = ['1.1.1.1', '8.8.8.8', '185.220.101.4', '10.0.0.1', '255.255.255.255']
    for (const ip of ips) {
      const { lat } = ipToDemoLatLon(ip)
      expect(lat).toBeGreaterThanOrEqual(-70)
      expect(lat).toBeLessThanOrEqual(70)
    }
  })

  it('stays within valid longitude range', () => {
    const ips = ['1.1.1.1', '8.8.8.8', '185.220.101.4', '10.0.0.1', '255.255.255.255']
    for (const ip of ips) {
      const { lon } = ipToDemoLatLon(ip)
      expect(lon).toBeGreaterThanOrEqual(-180)
      expect(lon).toBeLessThanOrEqual(180)
    }
  })

  it('gives different IPs different positions (not all collapsed to one point)', () => {
    const positions = new Set(
      ['1.1.1.1', '8.8.8.8', '185.220.101.4', '10.0.0.1'].map((ip) => JSON.stringify(ipToDemoLatLon(ip)))
    )
    expect(positions.size).toBeGreaterThan(1)
  })
})

describe('SIMULATED_CYBER_EVENTS', () => {
  it('has unique ids', () => {
    const ids = SIMULATED_CYBER_EVENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every event has a source and destination IP', () => {
    for (const ev of SIMULATED_CYBER_EVENTS) {
      expect(ev.srcIp.length).toBeGreaterThan(0)
      expect(ev.dstIp.length).toBeGreaterThan(0)
    }
  })
})
