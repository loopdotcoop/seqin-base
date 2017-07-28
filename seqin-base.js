!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'Seqin'    }
  , ID:      { value:'base'     }
  , VERSION: { value:'1.0.1'    }
  , SPEC:    { value:'20170728' }
  , HELP:    { value:
`The base class for all sequencer instruments. It’s not usually used directly -
it just generates silent buffers.` }
}


//// METHODS
//// -------

//// INSTANTIATE
//// constructor()
//// _getReady()

//// PERFORM
//// perform()
//// _buildBuffers()

//// VALID CONSTRUCTOR CONFIG
//// validBaseConstructor()
//// validFamilyConstructor()
//// validSpecificConstructor()

//// VALID PERFORM CONFIG
//// validBasePerform()
//// validFamilyPerform()
//// validSpecificPerform()

//// VALID PERFORM EVENTS
//// validBaseEvents()
//// validFamilyEvents()
//// validSpecificEvents()

//// VALIDATE CONSTRUCTOR CONFIG
//// _validateBaseConstructor
//// _validateFamilyConstructor
//// _validateSpecificConstructor

//// VALIDATE PERFORM CONFIG
//// _validateBasePerform
//// _validateFamilyPerform
//// _validateSpecificPerform

//// VALIDATE PERFORM EVENTS
//// _validateBaseEvents
//// _validateFamilyEvents
//// _validateSpecificEvents


//// UTILITY
//// -------

//// applyDefault()
//// validateType()
//// validateRange()




//// Make available on the window (browser) or global (Node.js).
const SEQIN = ROOT.SEQIN = ROOT.SEQIN || {}

SEQIN.Seqin = class Seqin {

    //// INSTANTIATE

    //// The base Seqin constructor() does all the heavy-lifting, so that a
    //// sub-class does’t need to define a constructor() of its own. If a sub-
    //// class does need its own constructor(), it must call `super(config)`
    //// at the top. But it may be preferable just to override _getReady() or
    //// one of the _valid...Constructor() methods.
    constructor (config) {

        //// Detect identifier-clashes in the nine validity-definitions.
        const names = {}, aliases = {}
        ;['Constructor', 'Perform', 'Events'].forEach( method => {
            ['Base', 'Family', 'Specific'].forEach( tier => {
                this[`valid${tier}${method}`].forEach( (valid, i) => {
                    if (names[valid.name])
                        throw new Error(`Seqin(): Duplicate name '${valid.name}' in valid${tier}${method}[${i}]`)
                    if (aliases[valid.alias])
                        throw new Error(`Seqin(): Duplicate alias '${valid.alias}' in valid${tier}${method}[${i}]`)
                    names[valid.name] = true
                    aliases[valid.alias] = true
                })
            })
        })

        //// Validate the configuration object.
        this._validateBaseConstructor(config)
        this._validateFamilyConstructor(config)
        this._validateSpecificConstructor(config)

        //// Record config’s values as immutable properties.
        ;['Base', 'Family', 'Specific'].forEach( tier => {
            this[`valid${tier}Constructor`].forEach( valid => {
                const value = config[valid.name]
                if (null == value)
                    throw new TypeError(123)
                Object.defineProperty(this, valid.name, { value })
            })
        })

        //// ready: a Promise which resolves when the instance has initialised.
        Object.defineProperty(this, 'ready', { value: this._getReady() });
    }


    //// Returns a Promise which is recorded as the instance’s `ready` property,
    //// after the constructor() has validated `config` and recorded the
    //// config properties. Sub-classes can override _getReady() if they need
    //// to fetch remote audio assets, or do other async preparation.
    //// Called by: constructor()
    _getReady () {

        //// setupStart: the time that `new Seqin({...})` was called.
        if (this.setupStart) throw new Error(`Seqin:_getReady(): Can only run once`)
        Object.defineProperty(this, 'setupStart', { value:performance.now() })

        //// seqin-base does no setup, so could resolve the `ready` Promise
        //// immediately. However, to make _getReady()’s behavior consistent with
        //// Seqins which have a slow async setup, we introduce a short delay.
        return new Promise( (resolve, reject) => { setTimeout(
            () => {
                //// setupEnd: the time that `_getReady()` finished running.
                Object.defineProperty(this, 'setupEnd', { value:performance.now() })

                //// Define the instance’s `ready` property.
                resolve({
                    setupDelay: this.setupEnd - this.setupStart
                })
            }
          , 5
        )})
    }




    //// PERFORM

    //// You can think of a Seqin class as a musical instrument. Creating an
    //// instance of that class is like tuning it to a particular key. When it’s
    //// ready to be played, perform() is like producing a single note (or maybe
    //// an ‘articulation’ or short phrase) from that instance.
    ////
    //// Like the constructor(), the base perform() does all the heavy-lifting,
    //// so that a sub-class does’t need to define a perform() of its own. If a
    //// sub-class does need its own perform(), it can call `super(config)` to
    //// at the top. But it may be preferable just to override _buildBuffers(),
    //// or one of the _valid...Perform() or _valid...Events() methods.
    perform(config) {

        //// Validate all of the configuration object except `events`.
        this._validateBasePerform(config)
        this._validateFamilyPerform(config)
        this._validateSpecificPerform(config)

        //// Validate the `events` property of the configuration object.
        this._validateBaseEvents(config)
        this._validateFamilyEvents(config)
        this._validateSpecificEvents(config)

        //// Run _buildBuffers() when the instance is has finished initialising.
        return this.ready.then( () => {
            return this._buildBuffers(config)
        })
    }

    //// Returns a Promise which is resolves to an array of audio buffers.
    //// The base Seqin class only creates silent buffers. Second-tier classes
    //// should override _buildBuffers(), but call `super(config)` to retrieve
    //// silent buffers from the base Seqin _buildBuffers(). Second-tier classes
    //// should then specify their own specialist methods for actually filling
    //// the buffers with audio in a way which makes sense for their family of
    //// Seqins. And then third-tier classes (and below) can override some of
    //// those specialist methods, to produce the specific sounds they need.
    //// The overridden _buildBuffers() will sometimes run asynchronously, so
    //// returning a Promise is appropriate. For a live example, See MathSeqin.
    //// Called by: perform()
    _buildBuffers(config) {

        //// The base Seqin class just returns silence. Note that a silent
        //// buffer created by the base Seqin class has no ID.
        const buffers = []
        for (let i=0; i<config.bufferCount; i++) {
            buffers.push({
                data: this.audioContext.createBuffer( //@TODO start using sharedCache
                    this.channelCount     // numOfChannels
                  , this.samplesPerBuffer // length
                  , this.sampleRate       // sampleRate
                )
            }) // developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBuffer#Syntax
        }

        //// Return the silent buffers.
        return Promise.resolve(buffers)
    }




    //// VALID CONSTRUCTOR CONFIG

    //// Defines what the `config` argument passed to the `constructor()` should
    //// look like, for all tiers of Seqin sub-classes. Note that all of the
    //// `config` values are recorded as immutable instance properties.
    //// Called by: constructor()
    //// Called by: constructor() > _validateBaseConstructor()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validBaseConstructor () { return [
        {
            title:   'AudioContext'
          , name:    'audioContext'
          , alias:   'ac'

          , tooltip: 'A link to the computer’s audio hardware, supplied by the web browser'
          , devtip:  'Generally, all Seqin instances should share a single AudioContext instance'
          , form:    'hidden'

          , type:    (ROOT.AudioContext||ROOT.webkitAudioContext)
        }
      , {
            title:   'Shared Cache'
          , name:    'sharedCache'
          , alias:   'sc'

          , tooltip: 'Caching allows Seqins to efficiently re-use the audio-buffers they generate'
          , devtip:  'Generally, all Seqin instances should share a single cache object'
          , form:    'hidden'

          , type:    'object'
        }
      , {
            title:   'Samples Per Buffer'
          , name:    'samplesPerBuffer'
          , alias:   'sb'

          , tooltip: 'The length of each audio-buffer, in sample-frames'
          , devtip:  'For ‘factor scale’ music choose a value like 5400, which divides many times into 2, 3 and 5'
          , form:    'range'
          , power:   8 // the range-slider should be exponential @TODO adjust power
          , suffix:  'Sample Frame(s)'

          , type:    'number'
          , min:     8
          , max:     96000
          , step:    1
          , default: 5400
        }
      , {
            title:   'Sample Rate'
          , name:    'sampleRate'
          , alias:   'sr'

          , tooltip: 'The number of sample-frames in one second of audio, eg 44100'
          , devtip:  '@TODO add remarks about resampling before final playback, so sampleRate can be used to ‘pitch-bend’'
          , form:    'range'
          , snaps:   [ 22050, 24000, 44100, 48000, 88200, 96000 ] // the range-slider should prefer certain common values
          , suffix:  'Hz'

          , type:    'number'
          , min:     22050 // developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/OfflineAudioContext
          , max:     96000
          , step:    1
          , default: config => config.audioContext.sampleRate
        }
      , {
            title:   'Channel Count'
          , name:    'channelCount'
          , alias:   'cc'

          , tooltip: 'The number of audio channels to generate, eg 2 for stereo'
          , devtip:  '@TODO add remarks'
          , form:    'range'
          , suffix:  'Hz'

          , type:    'number'
          , min:     1
          , max:     32
          , step:    1
          , default: 1
        }
    ]}


    //// Same as validBaseConstructor(), but is intended to be overridden
    //// by second-tier classes. So if MathSeqin overrides it, then its custom
    //// definitions are used to validate new MathSeqin instances, AND ALSO new
    //// SquareMathSeqin instances, FuzzyMathSeqin instances, etc.
    //// Called by: constructor()
    //// Called by: constructor() > _validateFamilyConstructor()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validFamilyConstructor() { return [
    ]}


    //// Same as validFamilyConstructor(), but is intended to be overridden by
    //// third-tier classes (classes which extend 2nd-tier classes) and below.
    //// So if SquareMathSeqin overrides it, then its custom definitions are
    //// used to validate new SquareMathSeqin instances, AND ALSO new fourth-
    //// tier instances BigSquareMathSeqin, WonkySquareMathSeqin, etc.
    //// Called by: constructor()
    //// Called by: constructor() > _validateSpecificConstructor()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validSpecificConstructor() { return [
    ]}




    //// VALID PERFORM CONFIG

    //// Defines what the `config` argument passed to `perform()` should look
    //// like, for all tiers of Seqin sub-classes.
    //// Called by: constructor()
    //// Called by: perform() > _validateBasePerform()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validBasePerform () { return [
        {
            title:   'Buffer Count'
          , name:    'bufferCount'
          , alias:   'bc'

          , tooltip: 'The number of audio-buffers which should be generated'
          , devtip:  '@TODO add remarks'
          , form:    'range'
          , power:   16 // the range-slider should be exponential @TODO adjust power
          , suffix:  'Buffer(s)'

          , type:    'number'
          , min:     1
          , max:     65535
          , step:    1
          , default: 1
        }
      , {
            title:   'Cycles Per Buffer'
          , name:    'cyclesPerBuffer'
          , alias:   'cb'

          , tooltip: 'Effectively the pitch - the number of waveforms each audio-buffer should contain'
          , devtip:  '@TODO add remarks'
          , form:    'range'
          , power:   16 // the range-slider should be exponential @TODO adjust power
          , suffix:  'Cycle(s)'

          , type:    'number'
          , min:     1
          , max:     65535
          , step:    1
          , default: 1
        }
      , {
            title:   'Is Looping'
          , name:    'isLooping'
          , alias:   'il'

          , tooltip: 'If true, sound which continues past the end wraps back to the start'
          , devtip:  '@TODO add remarks'
          , form:    'checkbox'

          , type:    'boolean'
          , default: false
        }
      , {
            title:   'Events'
          , name:    'events'
          , alias:   'ev'

          , tooltip: 'A list of timed actions, eg piano-key down at 2 seconds, up at 3 seconds'
          , devtip:  '@TODO add remarks'
          , form:    'hidden'

          , type:    Array
          , default: []
        }
    ]}


    //// Same as validBaseConstructor(), but is intended to be overridden
    //// by second-tier classes. So if MathSeqin overrides it, then its custom
    //// definitions are used to validate calls to myMathSeqin.perform(), AND
    //// ALSO mySquareMathSeqin.perform(), myFuzzyMathSeqin.perform(), etc.
    //// Called by: constructor()
    //// Called by: perform() > _validateFamilyPerform()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validFamilyPerform() { return [
    ]}


    //// Same as validFamilyPerform(), but is intended to be overridden by
    //// third-tier classes (classes which extend 2nd-tier classes) and below.
    //// So if SquareMathSeqin overrides it, then its custom definitions are
    //// used to validate calls to mySquareMathSeqin.perform(), AND ALSO
    //// myBigSquareMathSeqin.perform(), myWonkySquareMathSeqin.perform(), etc.
    //// Called by: constructor()
    //// Called by: perform() > _validateSpecificPerform()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validSpecificPerform() { return [
    ]}




    //// VALID PERFORM EVENTS

    //// The `config` argument passed to `perform()` has an `events` array.
    //// validBaseEvents() defines what properties are allowed in that array,
    //// for all tiers of Seqin sub-classes.
    //// Called by: constructor()
    //// Called by: perform() > _validateBaseEvents()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validBaseEvents () { return [
        {
            title:   'At'
          , name:    'at'
          , alias:   'at'

          , tooltip: 'The moment in time which the event refers to, measured in sample-frames'
          , devtip:  'Events can occur before the performance starts (a negative number), or after it ends'
          , form:    'range'
          , rangemin:-this.samplesPerBuffer     // hint for the left end of the range-slider
          , rangemax: this.samplesPerBuffer * 2 // hint for the right end of the range-slider

          , type:    'number'
          , step:    1 // no min or max
        }
      , {
            title:   'Down'
          , name:    'down'
          , alias:   'dn'

          , tooltip: 'Pressure on a piano-key, where 0 is unpressed and 9 is pressed all the way down'
          , devtip:  '@TODO add remarks'
          , form:    'range'

          , type:    'number'
          , min:     0
          , max:     9
          , step:    1
        }
      , {
            title:   'Gain'
          , name:    'gain'
          , alias:   'gn'

          , tooltip: 'A ‘volume fader’ where 0 is silence, 4 is same-volume, and 8 is maximum boost'
          , devtip:  '@TODO add remarks'
          , form:    'range'

          , type:    'number'
          , min:     0
          , max:     8
          , step:    1
        }
    ]}


    //// Same as validBaseEvents(), but is intended to be overridden by second-
    //// tier classes. So if MathSeqin overrides it, then its custom action
    //// definitions are used to validate calls to myMathSeqin.perform(), AND
    //// ALSO mySquareMathSeqin.perform(), myFuzzyMathSeqin.perform(), etc.
    //// Called by: constructor()
    //// Called by: perform() > _validateFamilyEvents()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validFamilyEvents() { return [
    ]}


    //// Same as validFamilyEvents(), but is intended to be overridden by
    //// third-tier classes (classes which extend 2nd-tier classes) and below.
    //// So if SquareMathSeqin overrides it, then its custom action definitions
    //// are used to validate calls to mySquareMathSeqin.perform(), AND ALSO
    //// myBigSquareMathSeqin.perform(), myWonkySquareMathSeqin.perform(), etc.
    //// Called by: constructor()
    //// Called by: perform() > _validateSpecificEvents()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validSpecificEvents() { return [
    ]}




    //// VALIDATE CONSTRUCTOR CONFIG

    //// Ensures that the `config` argument passed to the `constructor()` is
    //// valid, for all tiers of Seqin sub-classes.
    //// Called by: constructor()
    _validateBaseConstructor (config) {
        if ('object' !== typeof config)
            throw new Error(`Seqin:_validateBaseConstructor(): config is type ${typeof config} not object`)
        this.validBaseConstructor.forEach( valid => {
            if (! SEQIN.UTILITY.applyDefault(valid, config) )
                throw new TypeError(`Seqin:_validateBaseConstructor(): Mandatory config.${valid.name} is missing`)
            let err, value = config[valid.name]
            if ( err = SEQIN.UTILITY.validateType(valid, value) )
                throw new TypeError(`Seqin:_validateBaseConstructor(): config.${valid.name} ${err}`)
            if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                throw new RangeError(`Seqin:_validateBaseConstructor(): config.${valid.name} ${err}`)
        })
    }

    //// Same as _validateBaseConstructor(), but validates second-tier classes
    //// and below. If a second-tier class like MathSeqin overrides it, then
    //// special config validation can be applied to new MathSeqin instances,
    //// AND ALSO new SquareMathSeqin instances, FuzzyMathSeqin instances, etc.
    //// Called by: constructor()
    _validateFamilyConstructor (config) {
        this.validFamilyConstructor.forEach( valid => {
            if (! SEQIN.UTILITY.applyDefault(valid, config) )
                throw new TypeError(`Seqin:_validateFamilyConstructor(): Mandatory config.${valid.name} is missing`)
            let err, value = config[valid.name]
            if ( err = SEQIN.UTILITY.validateType(valid, value) )
                throw new TypeError(`Seqin:_validateFamilyConstructor(): config.${valid.name} ${err}`)
            if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                throw new RangeError(`Seqin:_validateFamilyConstructor(): config.${valid.name} ${err}`)
        })
    }


    //// Same as _validateFamilyConstructor(), but validates third-tier classes
    //// (classes which extend second-tier classes) and below. If a third-tier
    //// class like SquareMathSeqin overrides it, then special config validation
    //// can be applied to new SquareMathSeqin instances, AND ALSO new fourth-
    //// tier instances BigSquareMathSeqin, WonkySquareMathSeqin, etc.
    //// Called by: constructor()
    _validateSpecificConstructor (config) {
        this.validSpecificConstructor.forEach( valid => {
            if (! SEQIN.UTILITY.applyDefault(valid, config) )
                throw new TypeError(`Seqin:_validateSpecificConstructor(): Mandatory config.${valid.name} is missing`)
            let err, value = config[valid.name]
            if ( err = SEQIN.UTILITY.validateType(valid, value) )
                throw new TypeError(`Seqin:_validateSpecificConstructor(): config.${valid.name} ${err}`)
            if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                throw new RangeError(`Seqin:_validateSpecificConstructor(): config.${valid.name} ${err}`)
        })
    }




    //// VALIDATE PERFORM CONFIG

    //// Ensures that the `config` argument passed to `perform()` is valid, for
    //// all tiers of Seqin sub-classes.
    //// Called by: perform()
    _validateBasePerform (config) {
        if ('object' !== typeof config)
            throw new Error(`Seqin:_validateBasePerform(): config is type ${typeof config} not object`)
        this.validBasePerform.forEach( valid => {
            if (! SEQIN.UTILITY.applyDefault(valid, config) )
                throw new TypeError(`Seqin:_validateBasePerform(): Mandatory config.${valid.name} is missing`)
            let err, value = config[valid.name]
            if ( err = SEQIN.UTILITY.validateType(valid, value) )
                throw new TypeError(`Seqin:_validateBasePerform(): config.${valid.name} ${err}`)
            if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                throw new RangeError(`Seqin:_validateBasePerform(): config.${valid.name} ${err}`)
        })

        //// Seqin only allows waveforms with whole-number lengths.
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        if (samplesPerCycle !== ~~samplesPerCycle)
            throw new Error('Seqin:_validateBasePerform() samplesPerBuffer/cyclesPerBuffer is not an integer')
    }


    //// Same as _validateBasePerform(), but validates second-tier classes and
    //// below. If a second-tier class like MathSeqin overrides it, then special
    //// config validation can run on calls to myMathSeqin.perform(), AND ALSO
    //// mySquareMathSeqin.perform(), myFuzzyMathSeqin.perform(), etc.
    //// Called by: perform()
    _validateFamilyPerform (config) {
        this.validFamilyPerform.forEach( valid => {
            if (! SEQIN.UTILITY.applyDefault(valid, config) )
                throw new TypeError(`Seqin:_validateFamilyPerform(): Mandatory config.${valid.name} is missing`)
            let err, value = config[valid.name]
            if ( err = SEQIN.UTILITY.validateType(valid, value) )
                throw new TypeError(`Seqin:_validateFamilyPerform(): config.${valid.name} ${err}`)
            if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                throw new RangeError(`Seqin:_validateFamilyPerform(): config.${valid.name} ${err}`)
        })
    }


    //// Same as _validateFamilyPerform(), but validates third-tier classes -
    //// that is, classes which extend second-tier classes. If a third-tier
    //// class like SquareMathSeqin overrides it, then special config validation
    //// can run on calls to mySquareMathSeqin.perform(), AND ALSO fourth-tiers
    //// myBigSquareMathSeqin.perform(), myWonkySquareMathSeqin.perform(), etc.
    //// Called by: perform()
    _validateSpecificPerform (config) {
        this.validSpecificPerform.forEach( valid => {
            if (! SEQIN.UTILITY.applyDefault(valid, config) )
                throw new TypeError(`Seqin:_validateSpecificPerform(): Mandatory config.${valid.name} is missing`)
            let err, value = config[valid.name]
            if ( err = SEQIN.UTILITY.validateType(valid, value) )
                throw new TypeError(`Seqin:_validateSpecificPerform(): config.${valid.name} ${err}`)
            if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                throw new RangeError(`Seqin:_validateSpecificPerform(): config.${valid.name} ${err}`)
        })
    }




    //// VALIDATE PERFORM EVENTS

    //// Ensures that the `config.events` array passed to `perform()` is valid,
    //// for all tiers of Seqin sub-classes.
    //// Note that the base Seqin class only creates silent buffers, so the
    //// events don’t make any difference - _validateBaseEvents() is really
    //// here for the benefit of sub-classes.
    //// Called by: perform()
    _validateBaseEvents (config) {
        const validBaseEvents = this.validBaseEvents
        config.events.forEach( (event, i) => {
            if ('object' !== typeof event)
                throw new TypeError(`Seqin:_validateBaseEvents(): config.events[${i}] is not an object`)
            if (null == event.at)
                throw new TypeError(`Seqin:_validateBaseEvents(): config.events[${i}].at is not set`)
            if (1 === Object.keys(event).length )
                throw new Error(`Seqin:_validateBaseEvents(): config.events[${i}] does not specify any actions`)
            validBaseEvents.forEach( valid => {
                if (! event.hasOwnProperty(valid.name) ) return // not this action!
                let err, value = event[valid.name] // note that `applyDefault()` is not used for events
                if ( err = SEQIN.UTILITY.validateType(valid, value) )
                    throw new TypeError(`Seqin:_validateBaseEvents(): config.events[${i}].${valid.name} ${err}`)
                if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                    throw new RangeError(`Seqin:_validateBaseEvents(): config.events[${i}].${valid.name} ${err}`)
            })
        })
    }


    //// Same as _validateBaseEvents(), but is intended to be overridden by
    //// second-tier classes. So if a second-tier class like MathSeqin overrides
    //// it, then special `config.events` validation can run on calls to
    //// myMathSeqin.perform(), AND ALSO mySquareMathSeqin.perform(),
    //// myFuzzyMathSeqin.perform(), etc.
    //// Called by: perform()
    _validateFamilyEvents (config) {
        const validFamilyEvents = this.validFamilyEvents
        config.events.forEach( (event, i) => {
            let actionName = null
            validFamilyEvents.forEach( valid => {
                if (! event.hasOwnProperty(valid.name) ) return // not this action!
                let err, value = event[valid.name] // note that `applyDefault()` is not used for events
                if ( err = SEQIN.UTILITY.validateType(valid, value) )
                    throw new TypeError(`Seqin:_validateFamilyEvents(): config.events[${i}].${valid.name} ${err}`)
                if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                    throw new RangeError(`Seqin:_validateFamilyEvents(): config.events[${i}].${valid.name} ${err}`)
            })
        })
    }


    //// Same as _validateFamilyEvents(), but is intended to be overridden by
    //// third-tier classes (classes which extend 2nd-tier classes) and below.
    //// So if SquareMathSeqin overrides it, then then special `config.events`
    //// validation can run on calls to mySquareMathSeqin.perform(), AND ALSO
    //// myBigSquareMathSeqin.perform(), myWonkySquareMathSeqin.perform(), etc.
    //// Called by: perform()
    _validateSpecificEvents (config) {
        const validSpecificEvents = this.validSpecificEvents
        config.events.forEach( (event, i) => {
            let actionName = null
            validSpecificEvents.forEach( valid => {
                if (! event.hasOwnProperty(valid.name) ) return // not this action!
                let err, value = event[valid.name] // note that `applyDefault()` is not used for events
                if ( err = SEQIN.UTILITY.validateType(valid, value) )
                    throw new TypeError(`Seqin:_validateSpecificEvents(): config.events[${i}].${valid.name} ${err}`)
                if ( err = SEQIN.UTILITY.validateRange(valid, value) )
                    throw new RangeError(`Seqin:_validateSpecificEvents(): config.events[${i}].${valid.name} ${err}`)
            })
        })
    }


}//Seqin


//// Add static constants to the Seqin class.
Object.defineProperties(SEQIN.Seqin, META)




//// UTILITY

SEQIN.UTILITY = {

    applyDefault: (valid, config) => {
        if ( config.hasOwnProperty(valid.name) ) return true // `true` here signifies default did not need to be applied
        if (! valid.hasOwnProperty('default') ) return false // `false` signifies a missing mandatory field
        config[valid.name] = 'function' === typeof valid.default
          ? valid.default(config) // useful where a default value depends on some other config value
          : valid.default
        return true // `true` here signifies default was successfully applied
    }

  , validateType: (valid, value) => {
        if ('string' === typeof valid.type && typeof value !== valid.type)
            return `is type ${typeof value} not ${valid.type}`
        if ('function' === typeof valid.type && ! (value instanceof valid.type))
            return `is not an instance of ${valid.type.name}`
    }

  , validateRange: (valid, value) => {
        if (null != valid.min && valid.min > value)
            return `is less than the minimum ${valid.min}`
        if (null != valid.max && valid.max < value)
            return `is greater than the maximum ${valid.max}`
        if (null != valid.step && ((value/valid.step) % 1))
            return `${value} leaves remainder ${(value/valid.step) % 1} when divided by ${valid.step}`
    }

}




}( 'object' === typeof window ? window : global )
