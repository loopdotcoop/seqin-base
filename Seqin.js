!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'Seqin'    }
  , ID:      { value:'si'       }
  , VERSION: { value:'0.0.8'    }
  , SPEC:    { value:'20170705' }
  , HELP:    { value:
`The base class for all sequencer instruments. It’s not usually used directly -
it just generates silent buffers.` }
}

//// Make available on the window (browser) or global (Node.js)
const SEQIN = ROOT.SEQIN = ROOT.SEQIN || {}


SEQIN.Seqin = class {

    constructor (config) {

        //// Record instantiation time.
        Object.defineProperty(this, 'instantiatedAt', { value:performance.now() })

        //// A private array of `ready` Promises.
        Object.defineProperty(this, '_promises', { value:{} })
        Object.defineProperty(this._promises, 'ready', { value:[] })

        //// Will be changed to true when _setup() has completed.
        Object.defineProperty(this, 'isReady', { value:false, configurable:true, writable:false })

        //// Validate the configuration object, and record its values as
        //// immutable properties.
        if ('object' !== typeof config)
            throw new Error(`Seqin(): config is type ${typeof config} not object`)
        ;[
            { name:'audioContext'    , type:'object' }
          , { name:'sharedCache'     , type:'object' }
          , { name:'samplesPerBuffer', type:'number', min:8, max:96000, mod:1 } // fidelity
          , { name:'sampleRate'      , type:'number', min:22050, max:96000, mod:1 } // developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/OfflineAudioContext
          , { name:'channelCount'    , type:'number', min:1, max:32, mod:1 }
        ].forEach( valid => {
            const value = config[valid.name]
            const realType = typeof value
            if (realType !== valid.type)
                throw new TypeError(`Seqin(): config.${valid.name} is type ${realType} not ${valid.type}`)
            if (null != valid.min && valid.min > value)
                throw new RangeError(`Seqin: config.${valid.name} is less than the minimum ${valid.min}`)
            if (null != valid.max && valid.max < value)
                throw new RangeError(`Seqin: config.${valid.name} is greater than the maximum ${valid.max}`)
            if (null != valid.mod && value % valid.mod)
                throw new RangeError(`Seqin: config.${valid.name} leaves a remainder when divided by ${valid.mod}`)
            Object.defineProperty(this, valid.name, { value })
        })

        //// Begin setup.
        this._setup()
    }


    _resolveReadyPromises () {
        const response = {
            delay: performance.now() - this.instantiatedAt
        }
        let promise
        while ( promise = this._promises.ready.shift() )
            promise.resolve(response)
    }


    _setup () {
        if (this.isReady) throw new Error(`Seqin:_setup(): Can only run once`)

        //// seqin-si has no setup to do, so we could resolve `ready` Promises
        //// immediately. However, to make _setup()’s behavior consistent with
        //// Seqins which have a slow async setup, we introduce a delay.
        setTimeout(
            () => {
                Object.defineProperty(this, 'isReady', { writable:true }) // make writable
                Object.defineProperty(this, 'isReady', { value:true, configurable:false, writable:false }) // unwritable and unconfigurable
                this._resolveReadyPromises()
            }
          , 50
        )

    }


    get ready () {
        return new Promise( (resolve, reject) => {
            this._promises.ready.push({ resolve, reject })
            if (this.isReady) this._resolveReadyPromises()
        })
    }


    getBuffers(config) {

        //// Validate the configuration object.
        if ('object' !== typeof config)
            throw new Error(`Seqin:getBuffers(): config is type ${typeof config} not object`)
        ;[
            { name:'bufferCount'    , type:'number', min:1, max:65535, mod:1 }
          , { name:'cyclesPerBuffer', type:'number', min:1, max:65535, mod:1 }
          , { name:'isLooping'      , type:'boolean' }
          , { name:'events'         , type:'object' }
        ].forEach( valid => {
            const value = config[valid.name]
            const realType = typeof value
            if (realType !== valid.type)
                throw new TypeError(`Seqin:getBuffers(): config.${valid.name} is type ${realType} not ${valid.type}`)
            if (null != valid.min && valid.min > value)
                throw new RangeError(`Seqin:getBuffers(): config.${valid.name} is less than the minimum ${valid.min}`)
            if (null != valid.max && valid.max < value)
                throw new RangeError(`Seqin:getBuffers(): config.${valid.name} is greater than the maximum ${valid.max}`)
            if (null != valid.mod && value % valid.mod)
                throw new RangeError(`Seqin:getBuffers(): config.${valid.name} leaves a remainder when divided by ${valid.mod}`)
        })

        //// Seqin only allows waveforms with whole-number lengths.
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        if (samplesPerCycle !== ~~samplesPerCycle)
            throw new Error('Seqin:getBuffers() samplesPerBuffer/cyclesPerBuffer is not an integer')

        //// Validate the config.events array.
        //// Note that the base Seqin class only creates silent buffers, so the
        //// events don’t make any difference. Validation is included here for
        //// parity with Seqin sub-classes.
        const events = config.events
        if (! Array.isArray(events) )
            throw new Error(`Seqin:getBuffers(): config.events is not an array`)
        events.forEach( (event, i) => {
            if ('object' !== typeof event)
                throw new Error(`Seqin:getBuffers(): config.events[${i}] is not an object`)
            if ('number' !== typeof event.at)
                throw new Error(`Seqin:getBuffers(): config.events[${i}].at is not a number`)
            if (null == event.up && null == event.down)
                throw new Error(`Seqin:getBuffers(): config.events[${i}] does not specify an action`)
            if (null != event.up && null != event.down)
                throw new Error(`Seqin:getBuffers(): config.events[${i}] has more than one action`)
            if ( null != event.up && ('number' !== typeof event.up || 0 > event.up || 1 < event.up) )
                throw new Error(`Seqin:getBuffers(): config.events[${i}].up is invalid`)
            if ( null != event.down && ('number' !== typeof event.down || 0 > event.down || 1 < event.down) )
                throw new Error(`Seqin:getBuffers(): config.events[${i}].down is invalid`)
        })

        //// Run _buildBuffers() when this Seqin instance is ready.
        return new Promise( (resolve, reject) => {
            if (this.isReady)
                this._buildBuffers(config, resolve, reject)
            else
                this._promises.ready.push({
                    reject
                  , resolve: () => this._buildBuffers(config, resolve, reject)
                })
        })
    }


    _buildBuffers(config, resolve, reject) {

        //// The base Seqin class just returns silence.
        const buffers = []
        for (let i=0; i<config.bufferCount; i++) {
            buffers.push({
                id:   'si' // always silence, so always the same cache-identifier
              , data: this.audioContext.createBuffer( //@TODO start using sharedCache
                    this.channelCount     // numOfChannels
                  , this.samplesPerBuffer // length
                  , this.sampleRate       // sampleRate
                )
            }) // developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBuffer#Syntax
        }

        //// Return the silent buffers.
        resolve(buffers)
    }

}


//// Add static constants to the Seqin class.
Object.defineProperties(SEQIN.Seqin, META)


}( 'object' === typeof window ? window : global )
