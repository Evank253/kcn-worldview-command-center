import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { Globe } from '../globe'

describe('Globe.latLonToVector3', () => {
  it('places the north pole at +Y', () => {
    const v = Globe.latLonToVector3(90, 0, 1)
    expect(v.y).toBeCloseTo(1, 5)
    expect(v.x).toBeCloseTo(0, 5)
    expect(v.z).toBeCloseTo(0, 5)
  })

  it('places the south pole at -Y', () => {
    const v = Globe.latLonToVector3(-90, 0, 1)
    expect(v.y).toBeCloseTo(-1, 5)
  })

  it('produces a point on the sphere surface for arbitrary coordinates', () => {
    const v = Globe.latLonToVector3(37.7749, -122.4194, 2.5)
    expect(v.length()).toBeCloseTo(2.5, 4)
  })

  it('scales linearly with radius', () => {
    const a = Globe.latLonToVector3(10, 20, 1)
    const b = Globe.latLonToVector3(10, 20, 3)
    expect(b.length()).toBeCloseTo(a.length() * 3, 5)
  })
})

describe('Globe markers', () => {
  it('adds a marker and can find it in the marker group', () => {
    const globe = new Globe(1)
    globe.upsertMarker({ id: 'a1', lat: 10, lon: 20, color: 0xff0000 })
    const found = globe.group.children
      .flatMap((c) => c.children)
      .find((c) => c.name === 'a1')
    expect(found).toBeDefined()
  })

  it('updates position on repeated upsert with the same id rather than duplicating', () => {
    const globe = new Globe(1)
    globe.upsertMarker({ id: 'a1', lat: 10, lon: 20, color: 0xff0000 })
    globe.upsertMarker({ id: 'a1', lat: 50, lon: -80, color: 0xff0000 })

    const matches = globe.group.children
      .flatMap((c) => c.children)
      .filter((c) => c.name === 'a1')
    expect(matches.length).toBe(1)

    const expected = Globe.latLonToVector3(50, -80, 1.01)
    expect(matches[0].position.x).toBeCloseTo(expected.x, 5)
    expect(matches[0].position.y).toBeCloseTo(expected.y, 5)
    expect(matches[0].position.z).toBeCloseTo(expected.z, 5)
  })

  it('removes a marker by id', () => {
    const globe = new Globe(1)
    globe.upsertMarker({ id: 'a1', lat: 10, lon: 20, color: 0xff0000 })
    globe.removeMarker('a1')
    const found = globe.group.children
      .flatMap((c) => c.children)
      .find((c) => c.name === 'a1')
    expect(found).toBeUndefined()
  })

  it('removing a nonexistent marker is a safe no-op', () => {
    const globe = new Globe(1)
    expect(() => globe.removeMarker('does-not-exist')).not.toThrow()
  })

  it('setMarkersVisible toggles the marker group visibility flag', () => {
    const globe = new Globe(1)
    globe.upsertMarker({ id: 'a1', lat: 10, lon: 20, color: 0xff0000 })
    globe.setMarkersVisible(false)
    expect(globe.group.children[0].visible).toBe(false)
    globe.setMarkersVisible(true)
    expect(globe.group.children[0].visible).toBe(true)
  })

  it('setMarkersVisible on a layer with no markers yet is a safe no-op', () => {
    const globe = new Globe(1)
    expect(() => globe.setMarkersVisible(false, 'threats')).not.toThrow()
  })

  it('supports independent named layers that do not collide by id', () => {
    const globe = new Globe(1)
    globe.upsertMarker({ id: 'shared-id', lat: 10, lon: 20, color: 0xff0000 }, 'flights')
    globe.upsertMarker({ id: 'shared-id', lat: -10, lon: -20, color: 0x00ff00 }, 'threats')

    const flightsFound = globe.group.children
      .flatMap((c) => c.children)
      .filter((c) => c.name === 'shared-id')
    expect(flightsFound.length).toBe(2) // one per layer, same id string, different layers

    globe.setMarkersVisible(false, 'flights')
    globe.setMarkersVisible(true, 'threats')
    // Exactly one of the two same-named-id layer groups should be hidden.
    const visibilityStates = globe.group.children.map((g) => g.visible)
    expect(visibilityStates).toContain(false)
    expect(visibilityStates).toContain(true)
  })

  it('clearMarkers removes everything', () => {
    const globe = new Globe(1)
    globe.upsertMarker({ id: 'a1', lat: 10, lon: 20, color: 0xff0000 })
    globe.upsertMarker({ id: 'a2', lat: -10, lon: -20, color: 0x00ff00 })
    globe.clearMarkers()
    const remaining = globe.group.children.flatMap((c) => c.children)
    expect(remaining.length).toBe(0)
  })
})

describe('THREE sanity check', () => {
  it('can construct core THREE objects without a real WebGL context', () => {
    const geo = new THREE.SphereGeometry(1, 8, 8)
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(geo, mat)
    expect(mesh.isMesh).toBe(true)
  })
})
