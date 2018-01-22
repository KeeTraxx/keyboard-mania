<template>
  <div ref="container" @click="note(~~(Math.random() * 8))">

  </div>
</template>

<script>

import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
THREE.Cache.enabled = true

const renderer = new THREE.WebGLRenderer({ antialias: true })

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50)
camera.position.z = 2
camera.position.y = -55
camera.lookAt(new THREE.Vector3(0, 0, 0))

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)
// scene.fog = new THREE.Fog(0x000000, 250, 1400)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.125)
dirLight.position.set(0, 0, 1).normalize()
scene.add(dirLight)

const geometry = new THREE.SphereGeometry(5, 16, 16)
const wireframeGreen = new THREE.MeshBasicMaterial({ color: 0x00cc00, wireframe: true })
const sphere = new THREE.Mesh(geometry, wireframeGreen)

scene.add(sphere)

const basicGreen = new THREE.LineBasicMaterial({ color: 0x00cc00, linewidth: 2 })

for (let i = 0; i < 8; i++) {
  const group = new THREE.Group()
  group.position.x = i * 1 - 4

  // LANE
  const box = new THREE.BoxGeometry(1, 100, 0.2)
  const geo = new THREE.EdgesGeometry(box)
  const lane = new THREE.LineSegments(geo, basicGreen)
  group.add(lane)
  scene.add(group)
}

export default {
  name: 'Keyboard',
  mounted () {
    window.addEventListener('resize', this.onResize)
    this.onResize()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    this.$refs.container.appendChild(renderer.domElement)
    this.animate()
  },
  methods: {
    onResize () {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    render () {
      // camera.lookAt(cameraTarget)
      renderer.clear()
      renderer.render(scene, camera)
    },
    animate (time) {
      requestAnimationFrame(this.animate)
      sphere.rotation.y += 0.01
      sphere.rotation.z += 0.01
      this.render()

      TWEEN.update(time)
    },
    note (note) {
      console.log('Spawning...')
      let box = new THREE.BoxGeometry(1, 0.2, 0.2)
      let mesh = new THREE.Mesh(box, basicGreen)
      mesh.position.x = note - 4
      scene.add(mesh)
      mesh.position.y = 0
      new TWEEN.Tween(mesh.position)
        .to({ y: -100 }, 3000)
        .start()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
