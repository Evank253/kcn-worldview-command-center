export type AircraftType = 'ISR' | 'TANKER' | 'FIGHTER' | 'AEW' | 'BOMBER' | 'PATROL' | 'MILITARY' | 'UNKNOWN'

export interface FlightRecord {
  callsign: string
  icao24?: string
  type: AircraftType
  aircraft: string
  lat: number
  lon: number
  altitude: number | null
  speed: number | null
  heading: number | null
  country: string
  /** True only for data that actually came from a live feed this request. */
  live: boolean
  source: 'OpenSky' | 'SENTINEL/Curated'
}

export interface FlightsResponse {
  flights: FlightRecord[]
  count: number
  sources: string[]
  timestamp: string
}
