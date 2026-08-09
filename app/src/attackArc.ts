import * as THREE from 'three'
import { Globe } from './globe'

export interface ArcSpec {
  id: string
  fromLat: number
  fromLon: number
  toLat: number
  toLon: number
  color: number
}

interface ActiveArc {
  line: THREE.Line
  pulse: THREE.Mesh
  curve: THREE.QuadraticBezierCurve3
  progress: number
  speed: number
}

/**
 * Renders animated arcs between two points on a globe — the classic
 * "attack map" visual. Each arc bulges outward from the sphere surface
 * along a quadratic bezier, with a small glowing pulse traveling along
 * it on a loop.
 */
export class AttackArcLayer {
  readonly group: THREE.Group
  private arcs = new Map<string, ActiveArc>()

  constructor(private radius: number) {
    this.group = new THREE.Group()
  }

  private buildCurve(spec: ArcSpec): THREE.QuadraticBezierCurve3 {
    const from = Globe.latLonToVector3(spec.fromLat, spec.fromLon, this.radius * 1.01)
    const to = Globe.latLonToVector3(spec.toLat, spec.toLon, this.radius * 1.01)
    const mid = from.clone().add(to).multiplyScalar(0.5)
    // Bulge the midpoint outward from the globe center proportional to
    // the great-circle distance, so short hops arc gently and long hops
    // arc higher.
    const distance = from.distanceTo(to)
    mid.normalize().multiplyScalar(this.radius * (1.05 + distance * 0.18))
    return new THREE.QuadraticBezierCurve3(from, mid, to)
  }

  upsertArc(spec: ArcSpec): void {
    const existing = this.arcs.get(spec.id)
    if (existing) return // static demo arcs don't need position updates

    const curve = this.buildCurve(spec)
    const points = curve.getPoints(48)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0.45,
    })
    const line = new THREE.Line(geometry, material)
    line.name = spec.id

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 8, 8),
      new THREE.MeshBasicMaterial({ color: spec.color })
    )

    this.group.add(line)
    this.group.add(pulse)
    this.arcs.set(spec.id, { line, pulse, curve, progress: Math.random(), speed: 0.15 + Math.random() * 0.1 })
  }

  removeArc(id: string): void {
    const arc = this.arcs.get(id)
    if (!arc) return
    this.group.remove(arc.line)
    this.group.remove(arc.pulse)
    this.arcs.delete(id)
  }

  clear(): void {
    for (const id of Array.from(this.arcs.keys())) this.removeArc(id)
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible
  }

  update(deltaSeconds: number): void {
    for (const arc of this.arcs.values()) {
      arc.progress = (arc.progress + deltaSeconds * arc.speed) % 1
      const point = arc.curve.getPoint(arc.progress)
      arc.pulse.position.copy(point)
    }
  }
}
