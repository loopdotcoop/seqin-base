//// 'common', because these tests can be run unmodified by all subclasses, eg
//// MathSeqin just replaces `TestClass = Seqin` with `TestClass = MathSeqin`.

//// 'browser', because these tests need a fully functional AudioContext. That
//// means they’ll only run in the browser, not Node.js.

!function (ROOT) {

const
    a         = chai.assert
  , expect    = chai.expect
  , eq        = a.strictEqual
  , ok        = a.isOk

    //// To test a `Seqin` subclass called `MyGreatSeqin`, you should have set:
    //// window.TestClassName = 'MyGreatSeqin'
  , TestClass = SEQIN[ROOT.TestClassName]


describe(`Test common browser '${ROOT.TestClassName}'`, () => {


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
              , events:          []
            })
    		eq( typeof bufferProm, 'object', 'not an object' )
    		ok( bufferProm instanceof Promise, 'not a Promise' )
    	})


        it('Should resolve to an array of buffers (before isReady)', () => {
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
            eq(testInstance.isReady, false, 'isReady is not false')
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


        it('Should resolve to an array of buffers (after isReady)', () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 2340
              , sampleRate:       23400
              , channelCount:     2 // stereo
            })
            const readyProm = testInstance.ready
            eq(testInstance.isReady, false, 'isReady is not false')
            return readyProm.then( response => {
                eq(testInstance.isReady, true, 'isReady is not true')
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
