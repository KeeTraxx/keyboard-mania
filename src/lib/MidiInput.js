
const listeners = {}

const inputs = {}

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(midiAccess => {
    midiAccess.inputs.forEach((port, key) => {
      inputs[key] = port
      addListeners(port)
    })

    midiAccess.onstatechange = function (e) {
      switch (e.port.state) {
        case 'disconnected':
          delete inputs[e.port.id]
          break
        case 'connected':
          inputs[e.port.id] = e.port
          addListeners(e.port)
          break
      }
    }
  })
}

function toNote (event) {
  return {
    channel: event.data[0] & 0x0f,
    type: event.data[0] >> 4,
    velocity: event.data[2],
    note: event.data[1],
    timeStamp: event.timeStamp,
    source: event.target
  }
}

function addListeners (port) {
  port.open().then(function () {
    console.log('open', arguments)
  })

  port.onmidimessage = ev => {
    switch (ev.data[0] & 0xf0) {
      case 0x90:
        if (listeners.hasOwnProperty('noteOn')) {
          listeners.noteOn.forEach(cb => cb(toNote(ev)))
        }
        break
      case 0x80:
        if (listeners.hasOwnProperty('noteOff')) {
          listeners.noteOff.forEach(cb => cb(toNote(ev)))
        }
        break
    }
  }
}

const on = (event, callback) => {
  if (!listeners.hasOwnProperty(event)) {
    listeners[event] = []
  }

  listeners[event].push(callback)
}

export {
  on
}
