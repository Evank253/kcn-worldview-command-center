import { afterEach, describe, expect, it, vi } from 'vitest'

const OPENSKY_RESPONSE_WITH_MILITARY = {
  states: [
    // icao24, callsign, origin_country, _, _, lon, lat, baro_alt, on_ground, velocity, heading
    ['ae1234', 'OLIVE07  ', 'United States', null, null, 28.5, 37.0, 10000, false, 200, 90],
    ['abc999', 'DAL123   ', 'United States', null, null, -80.0, 25.0, 9000, false, 220, 45], // civilian, not military
  ],
}

describe('getFlights', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('marks curated fallback data as live:false, never live:true', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network unreachable in test'))
    )
    const { getFlights } = await import('../api/flights')
    const result = await getFlights()

    expect(result.flights.length).toBeGreaterThan(0)
    for (const f of result.flights) {
      expect(f.live).toBe(false)
      expect(f.source).toBe('SENTINEL/Curated')
    }
    expect(result.sources).not.toContain('OpenSky Network')
  })

  it('marks genuinely fetched OpenSky data as live:true and filters out non-military traffic', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => OPENSKY_RESPONSE_WITH_MILITARY,
      })
    )
    const { getFlights } = await import('../api/flights')
    const result = await getFlights()

    const live = result.flights.filter((f) => f.live)
    expect(live.length).toBeGreaterThan(0)
    expect(live.every((f) => f.source === 'OpenSky')).toBe(true)
    // The civilian DAL123 callsign should never appear — classifyAircraft returns null for it.
    expect(result.flights.some((f) => f.callsign === 'DAL123')).toBe(false)
    expect(result.sources).toContain('OpenSky Network')
  })
})
