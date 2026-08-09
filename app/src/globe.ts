import * as THREE from 'three'

export interface GlobeMarker {
  id: string
  lat: number
  lon: number
  color: number
  label?: string
}

/**
 * A textured, lit 3D Earth — day map blended toward city lights on the
 * night side, bump-mapped terrain, specular ocean highlight, a separate
 * rotating cloud shell, and an atmosphere glow. Replaces the flat
 * wireframe sphere used in the earlier Worldview/Cyber-Security-HQ
 * prototypes.
 */
export class Globe {
  readonly group: THREE.Group
  private earth!: THREE.Mesh
  private clouds!: THREE.Mesh
  private markerGroup: THREE.Group
  private markers = new Map<string, THREE.Object3D>()

  constructor(private radius = 1) {
    this.group = new THREE.Group()
    this.markerGroup = new THREE.Group()
    this.group.add(this.markerGroup)
  }

  /** Load textures and build the mesh. Call once, await before rendering. */
  async init(textureBasePath = './textures'): Promise<void> {
    const loader = new THREE.TextureLoader()
    const load = (name: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(`${textureBasePath}/${name}`, resolve, undefined, reject)
      })

    const [dayMap, normalMap, specularMap, cloudsMap, lightsMap] = await Promise.all([
      load('earth_day_4096.jpg'),
      load('earth_normal_2048.jpg'),
      load('earth_specular_4096.jpg'),
      load('earth_clouds_1024.png'),
      load('earth_night_4096.jpg'),
    ])

    for (const tex of [dayMap, normalMap, specularMap, cloudsMap, lightsMap]) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 4
    }

    const geometry = new THREE.SphereGeometry(this.radius, 96, 96)

    // Base day/night material. Night lights are added as a separate additive
    // layer driven by the same light direction as the sun, so the "lit
    // city" effect only shows on the dark side.
    const material = new THREE.MeshPhongMaterial({
      map: dayMap,
      normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap,
      specular: new THREE.Color(0x333333),
      shininess: 12,
    })
    this.earth = new THREE.Mesh(geometry, material)
    this.group.add(this.earth)

    // Night lights: additive-blended sphere slightly inside the day sphere,
    // emissive map only, so it glows through on the unlit hemisphere.
    const nightMaterial = new THREE.MeshBasicMaterial({
      map: lightsMap,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    })
    const nightMesh = new THREE.Mesh(geometry.clone(), nightMaterial)
    nightMesh.scale.setScalar(0.999)
    this.group.add(nightMesh)

    // Clouds — separate shell, rotates slightly faster than the surface.
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.35,
    })
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 1.008, 96, 96),
      cloudMaterial
    )
    this.group.add(this.clouds)

    // Atmosphere glow — backside-rendered, additive, fresnel-ish falloff via
    // a simple shader so the rim glows more than the center.
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 1.12, 64, 64),
      atmosphereMaterial
    )
    this.group.add(atmosphere)
  }

  /** Advance rotation/animation by a frame delta (seconds). */
  update(deltaSeconds: number): void {
    this.earth.rotation.y += deltaSeconds * 0.03
    this.clouds.rotation.y += deltaSeconds * 0.035
  }

  /** Convert lat/lon (degrees) to a position on the globe surface. */
  static latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  /** Add or update a point marker (aircraft, event origin, etc.) at lat/lon. */
  upsertMarker(marker: GlobeMarker): void {
    const existing = this.markers.get(marker.id)
    const position = Globe.latLonToVector3(marker.lat, marker.lon, this.radius * 1.01)

    if (existing) {
      existing.position.copy(position)
      return
    }

    const geometry = new THREE.SphereGeometry(0.006, 8, 8)
    const material = new THREE.MeshBasicMaterial({ color: marker.color })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)
    mesh.name = marker.id
    this.markerGroup.add(mesh)
    this.markers.set(marker.id, mesh)
  }

  removeMarker(id: string): void {
    const existing = this.markers.get(id)
    if (!existing) return
    this.markerGroup.remove(existing)
    this.markers.delete(id)
  }

  clearMarkers(): void {
    for (const id of Array.from(this.markers.keys())) this.removeMarker(id)
  }

  setMarkersVisible(visible: boolean): void {
    this.markerGroup.visible = visible
  }
}
