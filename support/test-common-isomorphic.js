//// 'common', because these tests can be run unmodified by all subclasses, eg
//// MathSeqin just replaces `TestClass = Seqin` with `TestClass = MathSeqin`.

//// 'isomorphic', because these tests will run in the browser or in Node.js.

!function (ROOT) {

const
    isBrowser = 'object' === typeof window
  , a         = isBrowser ? chai.assert : require('chai').assert
  , expect    = isBrowser ? chai.expect : require('chai').expect
  , eq        = a.strictEqual
  , ok        = a.isOk

    //// To test a `Seqin` subclass called `MyGreatSeqin`, you should have set:
    //// window.TestClassName = 'MyGreatSeqin' // browser
    //// ...or...
    //// global.TestClassName = 'MyGreatSeqin' // Node.js
  , TestClass = SEQIN[ROOT.TestClassName]

    //// To test a `Seqin` subclass called `MyGreatSeqin`, you should have set:
    //// window.TestMeta = { // replace `window` with `global` for Node.js
    ////     NAME:    { value:'MyGreatSeqin' }
    ////   , ID:      { value:'mygt'       }
    ////   , VERSION: { value:'1.2.3'    }
    ////   , SPEC:    { value:'20170705' }
    ////   , HELP:    { value: 'This is literally the best Seqin ever made!' }
    //// }
  , TestMeta = ROOT.TestMeta


describe(`Test common isomorphic '${ROOT.TestClassName}'`, () => {

    describe('META', () => {

        ['NAME','ID','VERSION','SPEC','HELP'].map( key => {
            const val = TestMeta[key].value
            const shortval = 60<(''+val).length ? val.substr(0,59)+'…' : ''+val
            it(`${ROOT.TestClassName}.${key} is "${shortval}"`, () => {
                eq(TestClass[key], val)
            })
        })

    })

    describe('Instance properties (not from config)', () => {
        const ctx = {}
        const cache = {}

        it(`instance properties as expected`, () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 123
              , sampleRate:       22050
              , channelCount:     2
            })

            ok(Array.isArray(testInstance.validConstructor),     'testInstance.validConstructor not an array')
            ok(Array.isArray(testInstance.validCommonPerform),   'testInstance.validCommonPerform not an array')
            ok(Array.isArray(testInstance.validSpecificPerform), 'testInstance.validSpecificPerform not an array')
            ok(Array.isArray(testInstance.validEvents),          'testInstance.validEvents not an array')

            eq(typeof testInstance.setupStart, 'number',   'testInstance.setupStart wrong type')
            eq(testInstance.setupEnd,           undefined, 'testInstance.setupEnd not undefined')

            return testInstance.ready.then( response => {
                eq(typeof testInstance.setupEnd, 'number', 'testInstance.setupEnd wrong type')
                ok(testInstance.setupEnd > testInstance.setupStart, 'testInstance.setupEnd wrong value')
            }) // no `.catch(...)`, Mocha knows how to deal with a rejected promise
        })

        it(`instance properties should be immutable`, () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 123
              , sampleRate:       22050
              , channelCount:     2
            })

            testInstance.validConstructor     = 12345
            testInstance.validCommonPerform   = 12345
            testInstance.validSpecificPerform = 12345
            testInstance.validEvents          = 12345
            ok(Array.isArray(testInstance.validConstructor),     'testInstance.validConstructor not immutable')
            ok(Array.isArray(testInstance.validCommonPerform),   'testInstance.validCommonPerform not immutable')
            ok(Array.isArray(testInstance.validSpecificPerform), 'testInstance.validSpecificPerform not immutable')
            ok(Array.isArray(testInstance.validEvents),          'testInstance.validEvents not immutable')

            const origSetupStart = testInstance.setupStart
            testInstance.setupStart = 12345
            eq(testInstance.setupStart, origSetupStart, 'testInstance.setupStart not immutable')

            return testInstance.ready.then( response => {
                const origSetupEnd = testInstance.setupEnd
                testInstance.setupEnd = /foo/
                eq(testInstance.setupEnd, origSetupEnd, 'testInstance.setupEnd not immutable')
            })
        })
    })

    describe('Instantiation config', () => {

        it(`should be an object`, () => {
            expect( () => { new TestClass() } )
               .to.throw('config is type undefined not object')
            expect( () => { new TestClass(123) } )
               .to.throw('config is type number not object')
        })

        it(`should contain values of expected type`, () => {
            expect( () => { new TestClass({
                audioContext:     true
              , sharedCache:      {}
              , samplesPerBuffer: 123
              , sampleRate:       22050
              , channelCount:     1
            }) } )
               .to.throw('config.audioContext is type boolean not object')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      'abc'
              , samplesPerBuffer: 123
              , sampleRate:       22050
              , channelCount:     1
            }) } )
               .to.throw('config.sharedCache is type string not object')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , sampleRate:       22050
              , channelCount:     1
            }) } )
               .to.throw('config.samplesPerBuffer is type undefined not number')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 123
              , sampleRate:       null
              , channelCount:     1
            }) } )
               .to.throw('config.sampleRate is type object not number')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 123
              , sampleRate:       22050
              , channelCount:     null
            }) } )
               .to.throw('config.channelCount is type object not number')
        })

        it(`samplesPerBuffer should contain values within range`, () => {
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: -7
              , sampleRate:       22050
              , channelCount:     1
            }) } )
               .to.throw('config.samplesPerBuffer is less than the minimum 8')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 96001
              , sampleRate:       22050
              , channelCount:     1
            }) } )
               .to.throw('config.samplesPerBuffer is greater than the maximum 96000')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 12345.6
              , sampleRate:       22050
              , channelCount:     1
            }) } )
               .to.throw('config.samplesPerBuffer leaves a remainder when divided by 1')
        })

        it(`sampleRate should contain values within range`, () => {
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 8
              , sampleRate:       22049
              , channelCount:     1
            }) } )
               .to.throw('config.sampleRate is less than the minimum 22050')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 8
              , sampleRate:       96001
              , channelCount:     1
            }) } )
               .to.throw('config.sampleRate is greater than the maximum 96000')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 8
              , sampleRate:       22050.5
              , channelCount:     1
            }) } )
               .to.throw('config.sampleRate leaves a remainder when divided by 1')
        })

        it(`channelCount should contain values within range`, () => {
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 8
              , sampleRate:       22050
              , channelCount:     0
            }) } )
               .to.throw('config.channelCount is less than the minimum 1')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 8
              , sampleRate:       96000
              , channelCount:     33
            }) } )
               .to.throw('config.channelCount is greater than the maximum 32')
            expect( () => { new TestClass({
                audioContext:     {}
              , sharedCache:      {}
              , samplesPerBuffer: 8
              , sampleRate:       96000
              , channelCount:     15.0001
            }) } )
               .to.throw('config.channelCount leaves a remainder when divided by 1')
        })

        {
            const ctx = {}
            const cache = {}
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 123
              , sampleRate:       22050
              , channelCount:     2
            })

            it(`should create instance properties`, () => {
                eq(testInstance.audioContext,     ctx,   'testInstance.audioContext fail')
                eq(testInstance.sharedCache,      cache, 'testInstance.sharedCache fail')
                eq(testInstance.samplesPerBuffer, 123,   'testInstance.samplesPerBuffer fail')
                eq(testInstance.sampleRate,       22050, 'testInstance.sampleRate fail')
                eq(testInstance.channelCount,     2,     'testInstance.channelCount fail')
            })

            it(`instance properties should be immutable`, () => {
                testInstance.audioContext = {a:1}
                testInstance.sharedCache = {b:2}
                testInstance.samplesPerBuffer = 77
                testInstance.sampleRate = 88
                testInstance.channelCount = 1
                eq(testInstance.audioContext,     ctx,   'testInstance.audioContext fail')
                eq(testInstance.sharedCache,      cache, 'testInstance.sharedCache fail')
                eq(testInstance.samplesPerBuffer, 123,   'testInstance.samplesPerBuffer fail')
                eq(testInstance.sampleRate,       22050, 'testInstance.sampleRate fail')
                eq(testInstance.channelCount,     2,     'testInstance.channelCount fail')
            })
        }

    })


    describe('The `ready` property', () => {
        const ctx = {}
        const cache = {}

        it(`should be an immutable Promise`, () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 123
              , sampleRate:       45678
              , channelCount:     1
            })
            eq(typeof testInstance.ready, 'object', 'testInstance.ready is not an object')
            ok(testInstance.ready instanceof Promise, 'testInstance.ready is not a Promise')
            testInstance.ready = 44
            eq(typeof testInstance.ready, 'object', 'testInstance.ready is not immutable')
        })

        it('Should resolve to an object', () => {
            const testInstance = new TestClass({
                audioContext:     ctx
              , sharedCache:      cache
              , samplesPerBuffer: 123
              , sampleRate:       45678
              , channelCount:     1
            })
            const readyPromise = testInstance.ready
            eq(typeof testInstance.setupStart, 'number', 'setupStart is not a number')
            eq(testInstance.setupEnd, undefined, 'setupEnd is not undefined')
            return readyPromise.then( response => {
                eq(typeof response, 'object', 'the response is not an object')
                eq(typeof testInstance.setupEnd, 'number', 'setupEnd is not a number')
                eq(typeof response.setupDelay, 'number', 'the response has no `setupDelay` number')
                eq(testInstance.setupEnd - testInstance.setupStart, response.setupDelay, 'setupDelay is wrong value')
                return testInstance.ready.then( response => {
                    eq(typeof response.setupDelay, 'number', 'new Promise not fulfilled after setupEnd becomes a number')
                    eq(testInstance.setupEnd - testInstance.setupStart, response.setupDelay, 'setupStart, setupEnd and/or setupDelay has changed')
                })
            })
        })

    })

    describe('perform() config', () => {
        const ctx = {}
        const cache = {}
        const testInstance = new TestClass({
            audioContext:     ctx
          , sharedCache:      cache
          , samplesPerBuffer: 123
          , sampleRate:       45678
          , channelCount:     1
        })

        it(`should be an object`, () => {
            expect( () => { testInstance.perform() } )
               .to.throw('config is type undefined not object')
            expect( () => { testInstance.perform(true) } )
               .to.throw('config is type boolean not object')
        })

        //@TODO use this style for Promise errors
        //
        // it(`should be an object`, () => {
        //     return testInstance.perform().then( () => {
        //         a.fail('Some message here')
        //     }).catch( e => {
        //         expect(e.message).to.equal('Seqin:_validCommonPerfom(): config is type undefined not object')
        //     })
        // })

        it(`should contain values of expected type`, () => {
            expect( () => { testInstance.perform({
                bufferCount:     false
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.bufferCount is type boolean not number')
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: /nope/
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.cyclesPerBuffer is type object not number')
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 123
              , isLooping:       null
              , events:          []
            }) } )
               .to.throw('config.isLooping is type object not boolean')
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          ''
            }) } )
               .to.throw('config.events is type string not object')
        })

        it(`bufferCount should contain values within range`, () => {
            expect( () => { testInstance.perform({
                bufferCount:     0
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.bufferCount is less than the minimum 1')
            expect( () => { testInstance.perform({
                bufferCount:     65536
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.bufferCount is greater than the maximum 65535')
            expect( () => { testInstance.perform({
                bufferCount:     123.4
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.bufferCount 123.4 leaves remainder 0.4000000000000057 when divided by 1')
        })

        it(`cyclesPerBuffer should contain values within range`, () => {
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 0
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.cyclesPerBuffer is less than the minimum 1')
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 65536
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.cyclesPerBuffer is greater than the maximum 65535')
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 123.4
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('config.cyclesPerBuffer 123.4 leaves remainder 0.4000000000000057 when divided by 1')
        })

        it(`samplesPerBuffer/cyclesPerBuffer must be an integer`, () => {
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 124
              , isLooping:       true
              , events:          []
            }) } )
               .to.throw('samplesPerBuffer/cyclesPerBuffer is not an integer')
        })


        it(`config.events should be an array`, () => {
            expect( () => { testInstance.perform({
                bufferCount:     8
              , cyclesPerBuffer: 123
              , isLooping:       true
              , events:          {}
            }) } )
               .to.throw('config.events is not an array')
        })


        it(`config.events should only contain valid 'event' objects`, () => {
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:9}, {at:456,down:0}, 'whoops!', {at:789,down:0} ]
            }) } )
               .to.throw('config.events[2] is not an object')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:5}, {} ]
            }) } )
               .to.throw('config.events[1].at is not a number')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:5}, {at:-123.456} ]
            }) } )
               .to.throw('config.events[1] does not specify an action')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:5,gain:0} ]
            }) } )
               .to.throw('config.events[0] has more than one action')

            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:true} ]
            }) } )
               .to.throw('config.events[0].down is type boolean not number')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:10} ]
            }) } )
               .to.throw('config.events[0].down is greater than the maximum 9')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:-1} ]
            }) } )
               .to.throw('config.events[0].down is less than the minimum 0')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,down:5.5} ]
            }) } )
               .to.throw('config.events[0].down 5.5 leaves remainder 0.5 when divided by 1')

            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,gain:'5'} ]
            }) } )
               .to.throw('config.events[0].gain is type string not number')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,gain:10} ]
            }) } )
               .to.throw('config.events[0].gain is greater than the maximum 9')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,gain:-1} ]
            }) } )
               .to.throw('config.events[0].gain is less than the minimum 0')
            expect( () => { testInstance.perform({
                bufferCount: 8, cyclesPerBuffer: 123, isLooping: true
              , events: [ {at:123,gain:0.41} ]
            }) } )
               .to.throw('config.events[0].gain 0.41 leaves remainder 0.41 when divided by 1')

           //@TODO valid event objects

        })

    })

})

}( 'object' === typeof window ? window : global )
