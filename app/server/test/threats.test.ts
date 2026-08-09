import { afterEach, describe, expect, it, vi } from 'vitest'

const SAMPLE_BLOCKLIST_TEXT = '1.2.3.4\n5.6.7.8\nnot-an-ip\n\n9.10.11.12\n'

const SAMPLE_GEO_RESPONSE = [
  { status: 'success', lat: 51.5, lon: -0.1, country: 'United Kingdom', city: 'London', query: '1.2.3.4' },
  { status: 'fail', query: '5.6.7.8' },
  { status: 'success', lat: 35.6, lon: 139.7, country: 'Japan', city: 'Tokyo', query: '9.10.11.12' },
]

function mockFetchSequence(responses: unknown[]) {
  let call = 0
  return vi.fn().mockImplementation(() => {
    const r = responses[call++]
    return Promise.resolve({
      ok: true,
      status: 200,
      text: async () => (typeof r === 'string' ? r : ''),
      json: async () => r,
    })
  })
}

describe('getThreats', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('parses only valid IPv4 lines from the blocklist text and geolocates them', async () => {
    vi.stubGlobal('fetch', mockFetchSequence([SAMPLE_BLOCKLIST_TEXT, SAMPLE_GEO_RESPONSE]))
    const { getThreats } = await import('../api/threats')
    const result = await getThreats()

    // 'not-an-ip' and the blank line must never reach geolocation/output
    expect(result.threats.every((t) => /^\d+\.\d+\.\d+\.\d+$/.test(t.ip))).toBe(true)
  })

  it('drops IPs that failed geolocation rather than fabricating coordinates for them', async () => {
    vi.stubGlobal('fetch', mockFetchSequence([SAMPLE_BLOCKLIST_TEXT, SAMPLE_GEO_RESPONSE]))
    const { getThreats } = await import('../api/threats')
    const result = await getThreats()

    // 5.6.7.8 returned status:'fail' in the mock — must not appear with fake coords
    expect(result.threats.some((t) => t.ip === '5.6.7.8')).toBe(false)
    expect(result.threats.some((t) => t.ip === '1.2.3.4')).toBe(true)
  })

  it('marks every returned threat as live:true (only successfully-geolocated entries are ever included)', async () => {
    vi.stubGlobal('fetch', mockFetchSequence([SAMPLE_BLOCKLIST_TEXT, SAMPLE_GEO_RESPONSE]))
    const { getThreats } = await import('../api/threats')
    const result = await getThreats()

    expect(result.threats.length).toBeGreaterThan(0)
    expect(result.threats.every((t) => t.live)).toBe(true)
  })

  it('returns an empty, honestly-labeled result when the network is unreachable, never fabricated data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unreachable in test')))
    const { getThreats } = await import('../api/threats')
    const result = await getThreats()

    expect(result.threats).toEqual([])
    expect(result.source).toBe('unavailable')
  })
})
