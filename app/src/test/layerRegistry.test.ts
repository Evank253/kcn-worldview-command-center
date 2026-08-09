import { describe, expect, it } from 'vitest'
import { LayerRegistry } from '../layerRegistry'

describe('LayerRegistry', () => {
  it('set/get/has work within a layer', () => {
    const reg = new LayerRegistry<string>()
    reg.set('flights', 'a1', 'value-a1')
    expect(reg.has('flights', 'a1')).toBe(true)
    expect(reg.get('flights', 'a1')).toBe('value-a1')
  })

  it('has() is false for an id that was never set', () => {
    const reg = new LayerRegistry<string>()
    expect(reg.has('flights', 'nope')).toBe(false)
  })

  it('has() is false for a layer that was never created', () => {
    const reg = new LayerRegistry<string>()
    expect(reg.has('nonexistent-layer', 'a1')).toBe(false)
  })

  it('the same id in two different layers does not collide', () => {
    const reg = new LayerRegistry<string>()
    reg.set('flights', 'shared-id', 'flight-value')
    reg.set('threats', 'shared-id', 'threat-value')

    expect(reg.get('flights', 'shared-id')).toBe('flight-value')
    expect(reg.get('threats', 'shared-id')).toBe('threat-value')
  })

  it('delete removes the id and returns its value', () => {
    const reg = new LayerRegistry<string>()
    reg.set('flights', 'a1', 'value-a1')
    const removed = reg.delete('flights', 'a1')

    expect(removed).toBe('value-a1')
    expect(reg.has('flights', 'a1')).toBe(false)
  })

  it('delete on a nonexistent id/layer is a safe no-op returning undefined', () => {
    const reg = new LayerRegistry<string>()
    expect(reg.delete('nope', 'nope')).toBeUndefined()
  })

  it('layerIds lists every id currently in a layer', () => {
    const reg = new LayerRegistry<string>()
    reg.set('flights', 'a1', 'x')
    reg.set('flights', 'a2', 'y')
    expect(reg.layerIds('flights').sort()).toEqual(['a1', 'a2'])
  })

  it('layerEntries lists [id, value] pairs for a layer', () => {
    const reg = new LayerRegistry<number>()
    reg.set('threats', 'ip1', 1)
    reg.set('threats', 'ip2', 2)
    const entries = reg.layerEntries('threats').sort((a, b) => a[0].localeCompare(b[0]))
    expect(entries).toEqual([
      ['ip1', 1],
      ['ip2', 2],
    ])
  })

  it('allLayerNames returns every layer that has had something set', () => {
    const reg = new LayerRegistry<string>()
    reg.set('flights', 'a1', 'x')
    reg.set('threats', 'b1', 'y')
    expect(reg.allLayerNames().sort()).toEqual(['flights', 'threats'])
  })

  it('clearLayer empties a layer and returns the removed values', () => {
    const reg = new LayerRegistry<string>()
    reg.set('flights', 'a1', 'x')
    reg.set('flights', 'a2', 'y')
    const removed = reg.clearLayer('flights')

    expect(removed.sort()).toEqual(['x', 'y'])
    expect(reg.layerIds('flights')).toEqual([])
  })

  it('clearLayer on an empty/nonexistent layer returns an empty array', () => {
    const reg = new LayerRegistry<string>()
    expect(reg.clearLayer('nope')).toEqual([])
  })
})
