import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { LayerRegistry } from './layerRegistry'

/**
 * A CesiumJS globe using only free, no-account data sources:
 * - Imagery: OpenStreetMap raster tiles (OpenStreetMapImageryProvider) —
 *   no Cesium ion token needed.
 * - Terrain: Cesium's built-in EllipsoidTerrainProvider (the library's own
 *   default when nothing else is specified) — flat/smooth globe, no real
 *   elevation data. Getting real elevation (mountains, valleys) requires
 *   EITHER a Cesium ion account (their hosted World Terrain, free tier
 *   still needs signup) OR self-hosting a quantized-mesh terrain dataset
 *   built from open elevation data — neither is wired up here yet. This
 *   is intentional and should be treated as a follow-up decision, not
 *   something quietly faked.
 * - Buildings: NOT included in this module. Real global 3D buildings via
 *   Overture Maps requires downloading + converting geospatial data and
 *   is scoped as a separate, bounded-region follow-up (see project docs).
 *
 * Building-level visual detail does not improve the accuracy of anything
 * placed on this globe from IP geolocation (flights, threats) — that
 * data only resolves to city/region level regardless of how detailed the
 * terrain or buildings are. This module exists for a better *viewing*
 * experience, not more accurate tracking.
 */
export class CesiumGlobe {
  readonly viewer: Cesium.Viewer
  private markers = new LayerRegistry<Cesium.Entity>()
  private arcs = new LayerRegistry<Cesium.Entity>()

  constructor(containerId: string) {
    // No Cesium ion asset is referenced anywhere in this constructor —
    // every option below is either explicitly a free/local provider or
    // explicitly disabled, so no ion access token is required to run this.
    this.viewer = new Cesium.Viewer(containerId, {
      baseLayerPicker: false,
      geocoder: false,
      animation: false,
      timeline: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      baseLayer: Cesium.ImageryLayer.fromProviderAsync(
        Promise.resolve(
          new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/',
          })
        )
      ),
      // Explicit even though it matches Cesium's own default — makes the
      // "no real elevation yet" decision visible in code, not implicit.
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    })

    // OSM's tile usage policy requires visible attribution — Cesium adds
    // provider credits automatically via the imagery layer, but this adds
    // an explicit one too in case the layer's own credit is suppressed by
    // a UI change later.
    this.viewer.creditDisplay.addStaticCredit(
      new Cesium.Credit('© OpenStreetMap contributors', true)
    )

    this.viewer.scene.globe.enableLighting = true
  }

  upsertMarker(id: string, lat: number, lon: number, color: string, layer = 'default'): void {
    const position = Cesium.Cartesian3.fromDegrees(lon, lat)
    const existing = this.markers.get(layer, id)

    if (existing) {
      existing.position = new Cesium.ConstantPositionProperty(position)
      return
    }

    const entity = this.viewer.entities.add({
      id: `${layer}:${id}`,
      position,
      point: {
        pixelSize: 6,
        color: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
    this.markers.set(layer, id, entity)
  }

  removeMarker(id: string, layer = 'default'): void {
    const entity = this.markers.delete(layer, id)
    if (entity) this.viewer.entities.remove(entity)
  }

  setLayerVisible(layer: string, visible: boolean): void {
    for (const [, entity] of this.markers.layerEntries(layer)) entity.show = visible
    for (const [, entity] of this.arcs.layerEntries(layer)) entity.show = visible
  }

  upsertArc(
    id: string,
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number,
    color: string,
    layer = 'default'
  ): void {
    if (this.arcs.has(layer, id)) return // static demo arcs, no position updates needed

    const entity = this.viewer.entities.add({
      id: `arc:${layer}:${id}`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([fromLon, fromLat, toLon, toLat]),
        width: 1.5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.25,
          color: Cesium.Color.fromCssColorString(color),
        }),
        arcType: Cesium.ArcType.GEODESIC,
      },
    })
    this.arcs.set(layer, id, entity)
  }

  destroy(): void {
    this.viewer.destroy()
  }
}
