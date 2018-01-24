import Promise from 'bluebird'

const BASE_URL = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/'
const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const instruments = {}
let selectedInstrument

function octave (n) {
  return ~~((n - 12) / 12)
}

function note (n) {
  return notes[(n - 12) % 12]
}

var soundmap = []

for (let i = 21; i <= 109; i++) {
  soundmap[i] = note(i) + octave(i)
}

const audioContext = new AudioContext()

function getInstrumentNames () {
  return fetch('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/names.json')
    .then(res => res.json())
}

function loadInstrument (name) {
  if (!instruments[name]) {
    return Promise.map(soundmap, v => {
      if (v === undefined) return
      return fetch(BASE_URL + name + '-mp3/' + v + '.mp3')
        .then(res => res.arrayBuffer())
        .then(buf => audioContext.decodeAudioData(buf))
        .then(decoded => {
          return {
            buffer: decoded
          }
        }).catch(err => {
          console.log(err)
          return undefined
        })
    }).then(instrument => {
      console.log('loaded', instrument)
      instruments[name] = instrument
      selectedInstrument = instrument
      return instrument
    })
  } else {
    return Promise.resolve(instruments[name])
  }
}

function noteOn (note, velocity) {
  console.log(note, velocity)
  let source = audioContext.createBufferSource()
  let gainNode = audioContext.createGain()
  gainNode.gain.value = velocity / 128
  console.log(selectedInstrument)
  source.buffer = selectedInstrument[note].buffer
  source.connect(gainNode)
  gainNode.connect(audioContext.destination)
  source.start()
  selectedInstrument[note].source = source
  selectedInstrument[note].gainNode = gainNode
}

function noteOff (note) {
  if (!selectedInstrument[note].source) return
  console.log('noteoff', note)
  selectedInstrument[note].gainNode.gain.setTargetAtTime(0, audioContext.currentTime + 0.3, 0.5)
  selectedInstrument[note].source.stop(audioContext.currentTime + 0.3)
}

export {
  loadInstrument,
  getInstrumentNames,
  noteOn,
  noteOff
}
