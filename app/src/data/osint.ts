export interface OsintSection {
  id: string
  title: string
  bullets: string[]
  link?: { label: string; url: string }
  warning?: string
}

export const OSINT_SECTIONS: OsintSection[] = [
  {
    id: 'deflock',
    title: 'DeFlock — Privacy Features',
    bullets: [
      'No personal data collection — no cookies, analytics, or tracking.',
      'OpenStreetMap based — camera locations are contributed to the public OSM commons.',
      'Offline-capable mobile app with manufacturer profiles (Flock, Motorola, Genetec, etc.).',
      'Route avoidance — can generate driving routes that minimize or avoid known ALPR cameras.',
      'Proximity alerts when approaching mapped devices. Free, open-source, no ads.',
    ],
    link: { label: 'deflock.me', url: 'https://deflock.me' },
  },
  {
    id: 'other-tools',
    title: 'Other Surveillance Mapping Tools',
    bullets: [
      'Atlas of Surveillance (EFF + University of Nevada) — searchable database of police tech including ALPRs, drones, facial recognition, body cameras.',
      'Eyes on Flock / Have I Been Flocked — transparency portals and FOIA-derived audit log tools.',
      'OpenStreetMap itself (query surveillance:type=ALPR) powers many of these maps.',
    ],
  },
  {
    id: 'legal-access',
    title: 'Legal Access to Flock Footage — Clarified',
    bullets: [
      'No public live streams — Flock feeds are not openly viewable by the public.',
      'Law enforcement / authorized customers access data through agency contracts.',
      'Public records / FOIA — in some jurisdictions, images have been ruled public records subject to disclosure. Outcomes vary by state; retention is often ~30 days.',
      'Unauthorized access is illegal. This platform provides awareness only.',
    ],
    warning:
      'This section is for transparency, research, and defensive awareness. It does not provide or encourage unauthorized access to any system.',
  },
  {
    id: 'osint-overview',
    title: 'OSINT Technologies (Defensive Overview)',
    bullets: [
      'Public camera & sensor mapping (DeFlock, Atlas of Surveillance).',
      'Satellite & aerial imagery analysis.',
      'Domain, IP, and infrastructure reconnaissance.',
      'Public records & FOIA research.',
      'Threat-intel feed aggregation.',
      'Geolocation from open data sources.',
    ],
  },
]
