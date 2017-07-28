//// This is the test entry-point for Node.js.
//// You’ll need to install mocha and chai first.

//// Define `TestClassName` and `TestMeta` for './test-base-isomorphic.js'.
global.TestClassName = 'Seqin'
global.TestMeta = {
//// This has been copy-pasted from the main script:
    NAME:    { value:'Seqin'    }
  , ID:      { value:'si'       }
  , VERSION: { value:'0.0.14'    }
  , SPEC:    { value:'20170705' }
  , HELP:    { value:
`The base class for all sequencer instruments. It’s not usually used directly -
it just generates silent buffers.` }
}

//// Polyfill `performance.now()` and define a dummy `AudioContext`.
global.performance = {
    now: () => { const hr = process.hrtime(); return hr[0] * 1e4 + hr[1] / 1e6 }
}
global.AudioContext = class AudioContext {}
global.AudioContext.prototype.sampleRate = 48000

//// Load the class to be tested.
require('../'+global.TestClassName)

//// Run the tests.
require('./test-base-isomorphic')
