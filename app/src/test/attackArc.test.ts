import { describe, expect, it } from 'vitest'
import { AttackArcLayer } from '../attackArc'

describe('AttackArcLayer', () => {
  it('adds an arc as a line + pulse pair in the group', () => {
    const layer = new AttackArcLayer(1)
    layer.upsertArc({ id: 'a1', fromLat: 10, fromLon: 20, toLat: -10, toLon: -20, color: 0xff0000 })

    const line = layer.group.children.find((c) => c.name === 'a1')
    expect(line).toBeDefined()
    // one line + one pulse mesh
    expect(layer.group.children.length).toBe(2)
  })

  it('does not duplicate on repeated upsert with the same id', () => {
    const layer = new AttackArcLayer(1)
    layer.upsertArc({ id: 'a1', fromLat: 10, fromLon: 20, toLat: -10, toLon: -20, color: 0xff0000 })
    layer.upsertArc({ id: 'a1', fromLat: 10, fromLon: 20, toLat: -10, toLon: -20, color: 0xff0000 })
    expect(layer.group.children.length).toBe(2)
  })

  it('removes an arc by id', () => {
    const layer = new AttackArcLayer(1)
    layer.upsertArc({ id: 'a1', fromLat: 10, fromLon: 20, toLat: -10, toLon: -20, color: 0xff0000 })
    layer.removeArc('a1')
    expect(layer.group.children.length).toBe(0)
  })

  it('removing a nonexistent arc is a safe no-op', () => {
    const layer = new AttackArcLayer(1)
    expect(() => layer.removeArc('nope')).not.toThrow()
  })

  it('clear() removes all arcs', () => {
    const layer = new AttackArcLayer(1)
    layer.upsertArc({ id: 'a1', fromLat: 10, fromLon: 20, toLat: -10, toLon: -20, color: 0xff0000 })
    layer.upsertArc({ id: 'a2', fromLat: 30, fromLon: 40, toLat: -30, toLon: -40, color: 0x00ff00 })
    layer.clear()
    expect(layer.group.children.length).toBe(0)
  })

  it('setVisible toggles the group visibility flag', () => {
    const layer = new AttackArcLayer(1)
    layer.setVisible(false)
    expect(layer.group.visible).toBe(false)
    layer.setVisible(true)
    expect(layer.group.visible).toBe(true)
  })

  it('update() moves the pulse mesh along the arc over time', () => {
    const layer = new AttackArcLayer(1)
    layer.upsertArc({ id: 'a1', fromLat: 10, fromLon: 20, toLat: -10, toLon: -20, color: 0xff0000 })
    const pulse = layer.group.children.find((c) => c.type === 'Mesh')!
    const before = pulse.position.clone()
    layer.update(0.5)
    const after = pulse.position.clone()
    expect(before.equals(after)).toBe(false)
  })
})
