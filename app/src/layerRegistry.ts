/**
 * Tracks which marker/arc ids exist per named layer, independent of any
 * specific rendering engine. Both the three.js Globe and CesiumGlobe use
 * the same shape of logic (upsert-by-id, per-layer visibility, dedup) —
 * this is that logic extracted so it can be unit tested without needing
 * a real WebGL context, which CesiumGlobe's actual entities require and
 * this sandbox cannot provide.
 */
export class LayerRegistry<T> {
  private layers = new Map<string, Map<string, T>>()

  private getOrCreate(layer: string): Map<string, T> {
    let found = this.layers.get(layer)
    if (!found) {
      found = new Map()
      this.layers.set(layer, found)
    }
    return found
  }

  has(layer: string, id: string): boolean {
    return this.layers.get(layer)?.has(id) ?? false
  }

  get(layer: string, id: string): T | undefined {
    return this.layers.get(layer)?.get(id)
  }

  set(layer: string, id: string, value: T): void {
    this.getOrCreate(layer).set(id, value)
  }

  delete(layer: string, id: string): T | undefined {
    const map = this.layers.get(layer)
    const value = map?.get(id)
    map?.delete(id)
    return value
  }

  layerEntries(layer: string): [string, T][] {
    const map = this.layers.get(layer)
    return map ? Array.from(map.entries()) : []
  }

  layerIds(layer: string): string[] {
    return Array.from(this.layers.get(layer)?.keys() ?? [])
  }

  allLayerNames(): string[] {
    return Array.from(this.layers.keys())
  }

  clearLayer(layer: string): T[] {
    const map = this.layers.get(layer)
    if (!map) return []
    const values = Array.from(map.values())
    map.clear()
    return values
  }
}
