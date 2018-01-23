<template>
  <div id="main" ref="container" @click="note(~~(Math.random() * 8))">
    <div>
      <input ref="fileinput" type="file">
      <div v-if="!hasMIDISupport()">MIDI-Keyboard support only in Chrome</div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import * as Stats from 'stats.js'
import * as MIDIParser from 'midi-parser-js/src/midi-parser.js'
import * as MIDIInput from '../lib/MidiInput'

function noteData (note) {
  let octave = ~~(note / 12)
  let tone = note % 12
  let isHalfTone = false

  if (tone === 0) {
  } else if (tone === 1) {
    isHalfTone = true
    tone -= 0.5
  } else if (tone < 3) {
    tone -= 1
  } else if (tone === 3) {
    isHalfTone = true
    tone -= 1.5
  } else if (tone < 6) {
    tone -= 2
  } else if (tone === 6) {
    isHalfTone = true
    tone -= 2.5
  } else if (tone < 8) {
    tone -= 3
  } else if (tone === 8) {
    isHalfTone = true
    tone -= 3.5
  } else if (tone < 10) {
    tone -= 4
  } else if (tone === 10) {
    isHalfTone = true
    tone -= 4.5
  } else if (tone < 13) {
    tone -= 5
  }

  let position = octave * 7 + tone
  return {
    note,
    octave,
    tone,
    position,
    isHalfTone
  }
}

const stats = new Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.bottom = '5px'
stats.domElement.style.left = '5px'
stats.domElement.style.display = 'flex'
stats.domElement.style.justifyContent = 'flex-end'
stats.domElement.style.flexDirection = 'column'
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

const basicBlue = new THREE.LineBasicMaterial({ color: 0x0000cc, linewidth: 2 })

let lanes = []

for (let octave = 4; octave < 8; octave++) {
  const group = new THREE.Group()
  group.position.x = octave * 7

  for (let i = 0; i < 7; i++) {
    // LANE
    const box = new THREE.BoxGeometry(1, 100, 0.2)
    const geo = new THREE.EdgesGeometry(box)
    const lane = new THREE.LineSegments(geo, basicGreen)
    lane.position.x = i
    lanes[octave * 7 + i] = lane
    group.add(lane)
  }
  scene.add(group)
}

MIDIInput.on('noteOn', ev => {
  console.log(ev)
  let note = noteData(ev.note)
  console.log(note)
  if (lanes[note.position]) {
    let mesh = lanes[note.position]
    mesh.material = basicBlue
  }
})

MIDIInput.on('noteOff', ev => {
  let note = noteData(ev.note)
  if (lanes[note.position]) {
    let mesh = lanes[note.position]
    mesh.material = basicGreen
  }
})

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
    note (midiEvent) {
      let box = new THREE.BoxGeometry(1, 0.2, 0.2)
      let mesh = new THREE.Mesh(box, midiEvent.isHalfTone ? basicGreen : basicBlue)
      mesh.position.x = midiEvent.position
      scene.add(mesh)
      mesh.position.y = 0
      new TWEEN.Tween(mesh.position)
        .to({ y: -100 }, 10000)
        .onComplete(() => {
          console.log('removing', mesh)
          scene.remove(mesh)
        })
        .start()
    },
    loadMidiData (data) {
      console.log(data)
      midiData = data.track[1].event.map(e => {
        if (e.type === 9 || e.type === 8) {
          let dat = noteData(e.data)
          e.octave = dat.octave
          e.tone = dat.tone
          e.position = dat.position
        }

        return e
      })
      timeDivision = data.timeDivision
      this.popMidi(0)
    },
    popMidi (index) {
      // note ON
      if (midiData[index].type === 9) {
        this.note(midiData[index])
      }

      while (midiData[++index].deltaTime === 0) {
        if (midiData[index].type === 9) {
          this.note(midiData[index])
        }
      }

      let deltaTime = midiData[index].deltaTime

      setTimeout(() => this.popMidi(++index), deltaTime / timeDivision * 250)
    },
    hasMIDISupport () {
      return navigator.requestMIDIAccess
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#main {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
