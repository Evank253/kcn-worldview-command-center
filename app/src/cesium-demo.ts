import { CesiumGlobe } from './cesiumGlobe'

const globe = new CesiumGlobe('cesiumContainer')

// A few markers so there's something to look at besides the bare globe.
globe.upsertMarker('demo-1', 38.9, -77.0, '#f87171') // Washington DC
globe.upsertMarker('demo-2', 51.5, -0.12, '#60a5fa') // London
globe.upsertMarker('demo-3', 35.68, 139.69, '#34d399') // Tokyo
globe.upsertArc('demo-arc-1', 38.9, -77.0, 51.5, -0.12, '#fbbf24')

console.log('CesiumGlobe demo booted:', globe)
