<template>
  <div ref="container" @click="note(~~(Math.random() * 8))">
    <input ref="fileinput" type="file">
  </div>
</template>

<script>
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import * as Stats from 'stats.js'
import * as MIDIParser from 'midi-parser-js/src/midi-parser.js'

const stats = new Stats()
THREE.Cache.enabled = true

const renderer = new THREE.WebGLRenderer({ antialias: true })

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 40)
camera.position.x = 40
camera.position.y = -55
camera.position.z = 20
camera.lookAt(new THREE.Vector3(40, 0, -30))

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)
// scene.fog = new THREE.Fog(0x000000, 250, 1400)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.125)
dirLight.position.set(0, 0, 1).normalize()
scene.add(dirLight)

// const wireframeGreen = new THREE.MeshBasicMaterial({ color: 0x00cc00, wireframe: true })

const basicGreen = new THREE.LineBasicMaterial({ color: 0x00cc00, linewidth: 2 })

for (let octave = 4; octave < 8; octave++) {
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group()
    group.position.x = octave * 8 + i * 1 - 4

    // LANE
    const box = new THREE.BoxGeometry(1, 100, 0.2)
    const geo = new THREE.EdgesGeometry(box)
    const lane = new THREE.LineSegments(geo, basicGreen)
    group.add(lane)
    scene.add(group)
  }
}

let midiData
let timeDivision

export default {
  name: 'Keyboard',
  mounted () {
    window.addEventListener('resize', this.onResize)
    this.onResize()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    this.$refs.container.appendChild(renderer.domElement)
    this.animate()

    this.$refs.container.appendChild(stats.dom)

    MIDIParser.addListener(this.$refs.fileinput, midiData => this.loadMidiData(midiData))
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
      stats.begin()
      TWEEN.update(time)
      this.render()
      stats.end()
      requestAnimationFrame(this.animate)
    },
    note (note) {
      console.log(note)

      let octave = ~~(note / 12)
      let tone = note % 12

      if (tone === 1) {
        tone -= 0.5
      } else if (tone > 1) {
        tone -= 1
      } else if (tone === 3) {
        tone -= 1.5
      } else if (tone > 3) {
        tone -= 2
      } else if (tone === 6) {
        tone -= 2.5
      } else if (tone > 6) {
        tone -= 3
      } else if (tone === 8) {
        tone -= 3.5
      } else if (tone > 8) {
        tone -= 4
      } else if (tone === 10) {
        tone -= 4.5
      } else {
        tone -= 5
      }

      let box = new THREE.BoxGeometry(1, 0.2, 0.2)
      let mesh = new THREE.Mesh(box, basicGreen)
      mesh.position.x = octave * 8 + tone
      scene.add(mesh)
      mesh.position.y = 0
      new TWEEN.Tween(mesh.position)
        .to({ y: -100 }, 10000)
        .onComplete(() => scene.remove(mesh))
        .start()
    },
    loadMidiData (data) {
      console.log(data)
      midiData = data.track[1].event
      timeDivision = data.timeDivision
      this.popMidi(0)
    },
    popMidi (index) {
      // note ON
      if (midiData[index].type === 9) {
        this.note(midiData[index].data[0])
      }

      while (midiData[++index].deltaTime === 0) {
        if (midiData[index].type === 9) {
          this.note(midiData[index].data[0])
        }
      }

      let deltaTime = midiData[index].deltaTime

      setTimeout(() => this.popMidi(++index), deltaTime / timeDivision * 250)
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
