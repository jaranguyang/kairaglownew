import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const CYAN = 0x54faff
const ICE = 0xb8ffff
const TEAL = 0x087e9b
const SPACE = 0x01070b

export function initWormhole(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(SPACE)
  scene.fog = new THREE.FogExp2(SPACE, 0.012)

  const camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(0, 0, 8.8)

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  container.appendChild(renderer.domElement)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.65, 0.75, 0.08)
  composer.addPass(bloom)

  const core = new THREE.Group()
  scene.add(core)

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.48, 48, 48),
    new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending })
  )
  core.add(innerGlow)

  const wireSphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.52, 3),
    new THREE.MeshBasicMaterial({ color: ICE, wireframe: true, transparent: true, opacity: 0.9 })
  )
  core.add(wireSphere)

  const coreHalo = new THREE.Mesh(
    new THREE.TorusGeometry(1.64, 0.035, 8, 128),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9 })
  )
  coreHalo.rotation.x = Math.PI / 2
  core.add(coreHalo)

  const ring = new THREE.Group()
  scene.add(ring)

  const segmentCount = 40
  const segmentGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.62)
  const segmentMaterial = new THREE.MeshStandardMaterial({
    color: 0x116d83,
    emissive: 0x0a8da7,
    emissiveIntensity: 1.4,
    metalness: 0.7,
    roughness: 0.3,
    transparent: true,
    opacity: 0.94,
  })
  const segments = new THREE.InstancedMesh(segmentGeometry, segmentMaterial, segmentCount)
  const segmentMatrix = new THREE.Matrix4()
  const segmentPosition = new THREE.Vector3()
  const segmentQuaternion = new THREE.Quaternion()
  const segmentScale = new THREE.Vector3(1, 1, 1)
  for (let i = 0; i < segmentCount; i += 1) {
    const angle = (i / segmentCount) * Math.PI * 2
    segmentPosition.set(Math.cos(angle) * 2.45, Math.sin(angle) * 2.45, 0)
    segmentQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle)
    segmentMatrix.compose(segmentPosition, segmentQuaternion, segmentScale)
    segments.setMatrixAt(i, segmentMatrix)
  }
  segments.instanceMatrix.needsUpdate = true
  ring.add(segments)

  const ringOutline = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.055, 10, 160),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 })
  )
  ring.add(ringOutline)
  ring.add(new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.025, 8, 160),
    new THREE.MeshBasicMaterial({ color: ICE, transparent: true, opacity: 0.55 })
  ))

  const vortex = new THREE.Group()
  scene.add(vortex)
  const vortexCount = 34
  for (let i = 0; i < vortexCount; i += 1) {
    const points = []
    const baseAngle = (i / vortexCount) * Math.PI * 2
    for (let step = 0; step < 36; step += 1) {
      const progress = step / 35
      const angle = baseAngle + progress * Math.PI * 1.15
      const radius = 1.85 + progress * 1.52 + Math.sin(progress * Math.PI * 4 + i) * 0.08
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.sin(progress * Math.PI) * 0.22 + (i % 5 - 2) * 0.035
      ))
    }
    const strand = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: i % 4 === 0 ? ICE : CYAN, transparent: true, opacity: 0.12 + (i % 5) * 0.035, blending: THREE.AdditiveBlending })
    )
    vortex.add(strand)
  }

  const particleCount = 2000
  const particlePositions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = 1.5 + Math.random() * 4
    const index = i * 3
    particlePositions[index] = Math.cos(angle) * radius
    particlePositions[index + 1] = Math.sin(angle) * radius
    particlePositions[index + 2] = (Math.random() - 0.5) * 2
  }
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: CYAN, size: 0.04, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
  )
  scene.add(particles)

  const starCount = 1000
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i += 1) starPositions[i] = (Math.random() - 0.5) * 40
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x88aabb, size: 0.03, transparent: true, opacity: 0.5 })))

  scene.add(new THREE.PointLight(CYAN, 8, 16))
  scene.add(new THREE.AmbientLight(0x08343d, 1.5))

  const clock = new THREE.Clock()
  const pointer = new THREE.Vector2()
  const target = new THREE.Vector2()
  window.addEventListener('pointermove', (event) => {
    target.x = (event.clientX / window.innerWidth - 0.5) * 0.22
    target.y = (event.clientY / window.innerHeight - 0.5) * 0.16
  })

  function animate() {
    requestAnimationFrame(animate)
    const time = clock.getElapsedTime()
    pointer.lerp(target, 0.035)

    core.rotation.x = time * 0.09 + pointer.y
    core.rotation.y = time * 0.14 + pointer.x
    const pulse = 1 + Math.sin(time * 2.2) * 0.035
    core.scale.setScalar(pulse)
    ring.rotation.z = -time * 0.035 + pointer.x * 0.4
    ring.rotation.x = Math.sin(time * 0.35) * 0.045 + pointer.y * 0.35
    vortex.rotation.z = time * 0.025
    vortex.rotation.x = Math.sin(time * 0.45) * 0.06
    particles.rotation.z = -time * 0.04
    particles.rotation.y = time * 0.02
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.02
    camera.position.y += (-pointer.y * 0.8 - camera.position.y) * 0.02
    camera.lookAt(0, 0, 0)
    composer.render()
  }
  animate()

  function onResize() {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    composer.setSize(width, height)
  }
  window.addEventListener('resize', onResize)
  return { renderer, onResize }
}

