//// 'base', because these tests can be run unmodified by all sub-classes,
//// whether they’re second-tier (extend the base Seqin class directly), or
//// third-tier (extend a second-tier class, like MathSeqin), or fourth-tier.

//// 'browser', because these tests need a fully functional AudioContext. That
//// means they’ll only run in the browser, not Node.js.

!function (ROOT) {

const
    a         = chai.assert
  , expect    = chai.expect
  , eq        = a.strictEqual
  , ok        = a.isOk

    //// To test a `Seqin` subclass called `MyGreatSeqin`, you should have set:
    //// window.TestMeta = { // replace `window` with `global` for Node.js
    ////     NAME:    { value:'MyGreatSeqin' }
    ////   , ID:      { value:'mygt'         }
    ////   , VERSION: { value:'1.2.3'        }
    ////   , SPEC:    { value:'20170728'     }
    ////   , HELP:    { value: 'This is literally the best Seqin ever made!' }
    //// }
  , TestMeta = ROOT.TestMeta
  , TestClassName = TestMeta.NAME.value
  , TestClass = SEQIN[TestClassName]


describe(`Test base browser '${TestClassName}'`, () => {


    describe('perform()', () => {
        const ctx = new (ROOT.AudioContext||ROOT.webkitAudioContext)()
        const cache = {}
        const testInstance = new TestClass({
            audioContext:     ctx
          , sharedCache:      cache
          , samplesPerBuffer: 123
          , sampleRate:       45678
          , channelCount:     1
        })

        it(`should be a method which returns a Promise`, () => {
            const testConfig = {
                bufferCount:     8
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          []
            }
            eq(typeof testInstance.perform, 'function', 'testInstance.perform is not a function')
            ok(typeof testInstance.perform(testConfig), 'object', 'testInstance.perform does not return an object')
            ok(testInstance.perform(testConfig) instanceof Promise, 'testInstance.perform does not return a Promise')
        })

        it(`should fill in missing config properties with defaults`, () => {
            const testConfig = {}
            testInstance.perform(testConfig)
            eq(testConfig.bufferCount,     1,     'testConfig.bufferCount fail')
            eq(testConfig.cyclesPerBuffer, 1,     'testConfig.cyclesPerBuffer fail')
            eq(testConfig.isLooping,       false, 'testConfig.bufferCount fail')
            ok(Array.isArray(testConfig.events),  'testConfig.events fail')
            eq(testConfig.events.length,   0,     'testConfig.events fail')
        })

    })



    describe('Promise returned by perform()', () => {
        const ctx = new (ROOT.AudioContext||ROOT.webkitAudioContext)()
        const cache = {}

        it(`should return a Promise`, () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 2340
              , sampleRate:       23400
              , channelCount:     1
            })
            const bufferProm = testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 234
              , isLooping:       true
              , events:          [ {at:123,down:5,gain:0}, {at:456,down:0} ] // first event has two actions - that is allowed
            })
            eq( typeof bufferProm, 'object', 'not an object' )
            ok( bufferProm instanceof Promise, 'not a Promise' )
        })


        it('Should resolve to an array of buffers (called before setup complete)', () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 2340
              , sampleRate:       23400
              , channelCount:     1 // mono
            })
            const bufferProm = testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 234
              , isLooping:       true
              , events:          []
            })
            eq(testInstance.setupEnd, undefined, 'setupEnd is not undefined')
            return bufferProm.then( response => {
                ok( Array.isArray(response), 'the response is not an array')
                eq( response.length, 8, 'wrong response.length' )
                response.forEach( (buffer,i) => {
                    ok( buffer.data instanceof ROOT.AudioBuffer, `buffers[${i}].data is not an AudioBuffer` )
                    eq( Math.floor(1e6 * buffer.data.duration), 100000, `buffers[${i}].duration is incorrect` )
                    eq( buffer.data.length, 2340, `buffers[${i}].length is incorrect` )
                    eq( buffer.data.numberOfChannels, 1, `buffers[${i}].numberOfChannels is incorrect` )
                    eq( buffer.data.sampleRate, 23400, `buffers[${i}].sampleRate is incorrect` )
                })
            }) // no `.catch(...)`, Mocha knows how to deal with a rejected promise
        })


        it('Should resolve to an array of buffers (called after setup complete)', () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 2340
              , sampleRate:       23400
              , channelCount:     2 // stereo
            })
            const readyProm = testInstance.ready
            eq(testInstance.setupEnd, undefined, 'setupEnd is not undefined')
            return readyProm.then( response => {
                eq(typeof testInstance.setupEnd, 'number', 'setupEnd is not a number')
                const bufferProm = testInstance.perform({
                    bufferCount:     4
                  , cyclesPerBuffer: 234
                  , isLooping:       true
                  , events:          []
                })
                return bufferProm.then( response => {
                    ok( Array.isArray(response), 'the response is not an array')
                    eq( response.length, 4, 'wrong response.length' )
                    response.forEach( (buffer,i) => {
                        ok( buffer.data instanceof ROOT.AudioBuffer, `buffers[${i}].data is not an AudioBuffer` )
                        eq( Math.floor(1e6 * buffer.data.duration), 100000, `buffers[${i}].duration is incorrect` )
                        eq( buffer.data.length, 2340, `buffers[${i}].length is incorrect` )
                        eq( buffer.data.numberOfChannels, 2, `buffers[${i}].numberOfChannels is incorrect` )
                        eq( buffer.data.sampleRate, 23400, `buffers[${i}].sampleRate is incorrect` )
                    })
                })
            })
        })


    })

})

}( 'object' === typeof window ? window : global )
