import React, { useState, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { asyncTimeout } from '../utils/asyncTimeout'
import { createStyleSheet } from '../styles/createStyleSheet'
import { LeaText } from './LeaText'
import { Log } from '../infrastructure/Log'
import { promiseWithTimeout } from '../utils/promiseWithTimeout'
import { Config } from '../env/Config'

/** @private **/
let Speech = null

/** @private **/
const styles = createStyleSheet({
  body: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  text: {},
  icon: { padding: 5 }
})

const globalDebug = Log.create('TTS', 'debug', Config.debug.tts)
const handlers = {}
const runHandlers = name => {
  if (!handlers[name]) { return }
  handlers[name].forEach(fn => fn())
}

/**
 * Tts stands for Text-To-Speech. It contains an icon and the text to be spoken.
 *
 * @category Components
 * @param {string} props.text: The displayed and spoken text
 * @param {boolean} props.dontShowText: Determines whether the text is displayed (Default 'true')
 * @param {boolean} props.smallButton: Changes the button size from 20 to 15 (Default 'false')
 * @param {boolean=} props.block: Makes the container flexGrow. If this causes problems, use style instead.
 * @param {boolean=} props.disabled: Makes the button disabled
 * @param {string=} props.color: The color of the icon and the text, in hexadecimal format. Default: Colors.secondary
 *   (examples in ./constants/Colors.js)
 * @param {string=} props.iconColor: The color of the icon in hexadecimal format. Default: Colors.secondary   (examples
 *   in ./constants/Colors.js)
 * @param {string=} props.activeIconColor: The color of the icon when speaking is active
 * @param {number} props.shrink: The parameter to shrink the text. Default: 1
 * @param {number} props.fontSize: The parameter to change the font size of the text. Default: 18
 * @param {string} props.fontStyle: The parameter to change the font style of the text. Default: 'normal' ('italic')
 * @param {string} props.align Defines the vertical alignment of the button and text
 * @param {number} props.paddingTop: Determines the top padding of the text. Default: 8
 * @param {number} props.speed: Determines the speed rate of the voice to speak. Default: 1.0
 * @param {string} props.id: The parameter to identify the buttons
 * @returns {JSX.Element}
 * @constructor
 */

const ttsComponent = props => {
  // TODO use useReducer to implement complex state logic?
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speakingId, setSpeakingId] = useState(0)
  const [iconColor, setIconColor] = useState(props.iconColor || props.color || Colors.secondary)

  const getIdleIconColor = () => props.iconColor || props.color || Colors.secondary
  const getIdleTextColor = () => props.color || Colors.secondary
  const debug = props.debug || TTSengine.debug
    ? globalDebug
    : () => {}

  useEffect(() => {
    debug('set isSpeaking', isSpeaking)
    TTSengine.isSpeaking = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    debug('set speakingId', speakingId)
    TTSengine.speakId = speakingId
  }, [speakingId])

  useEffect(() => {
    debug('set icon color', iconColor)
    TTSengine.iconColor = iconColor
  }, [iconColor])

  useEffect(() => {
    if (isDone) {
      debug('reset after done')
      setIconColor(getIdleIconColor())
      setIsSpeaking(false)
      setSpeakingId(0)
    }
  }, [isDone])

  /**
   * Starts speaking props.text. At startup it calls the function startSpeak() and at the end its calls stopSpeak()
   */
  const speak = async () => {
    runHandlers('beforeSpeak')

    const isSpeaking = await Speech.isSpeakingAsync()
    debug('speak', { isSpeaking })

    if (isSpeaking) {
      stopSpeak()
      await asyncTimeout(5)
      return await speak()
    }

    Speech.speak(props.text, {
      language: 'ger',
      pitch: 1,
      rate: props.speed || TTSengine.currentSpeed,
      voice: props.voice || TTSengine.currentVoice,
      onStart: () => {
        debug('onStart')
        startSpeak()
      },
      onStopped: () => {
        debug('onStopped')
        stopSpeak()
      },
      onDone: () => {
        debug('onDone')
        // TODO call stopSpeak and update tests to fix state bug
        stopSpeak()
        setIsDone(true)
      }
    })
  }
  /**
   * Stops expo-speech and changes the color back to props.color and sets CurrentlyPlaying to false
   */
  const stopSpeak = () => {
    debug('stop')
    setIconColor(getIdleIconColor())
    setIsSpeaking(false)
    setSpeakingId(0)
    setIsDone(false)
    Speech.stop()
  }
  /**
   * Changes the color of the icon to green and sets CurrentlyPlaying to true, at the start
   */
  const startSpeak = () => {
    debug('start')
    setIsSpeaking(true)
    setSpeakingId(props.id)
    setIconColor(props.activeIconColor ?? Colors.primary)
    if (props.onStart) {
      props.onStart({ isDone, isSpeaking, speakingId })
    }
  }

  /**
   * Displays the spoken text if "dontShowText" is false.
   */
  const displayedText = () => {
    if (props.dontShowText) { return null }

    // color always defaults to secondary
    const styleProps = { color: getIdleTextColor(), marginLeft: 10 }

    if (props.block) {
      styleProps.flex = 1
      styleProps.flexGrow = 1
    }

    if (props.fontStyle) {
      Object.assign(styleProps, props.fontStyle)
    }

    return (<LeaText style={styleProps}>{props.text}</LeaText>)
  }

  const ttsContainerStyle = { ...styles.body }
  if (props.align) {
    ttsContainerStyle.alignItems = props.align
  }
  if (props.style) {
    Object.assign(ttsContainerStyle, props.style)
  }
  const iconSize = props.smallButton ? 20 : 30
  const onPress = () => ((speakingId === props.id) && isSpeaking) ? stopSpeak() : speak()

  return (
    <View style={ttsContainerStyle}>
      <Pressable
        disabled={props.disabled}
        onPress={onPress}
      >
        <Icon
          testID={props.id}
          color={props.disabled ? Colors.gray : iconColor}
          size={iconSize}
          style={styles.icon}
          name='volume-up'
          type='font-awesome-5'
        />
      </Pressable>
      {displayedText()}
    </View>
  )
}

/**
 * Global Text-To-Speech engine. The actual tts-processor engine is injected,
 * this is only a wrapper to connect it with react components.
 *
 * Designed to have always only one instance of speech being active.
 *
 *
 * @property setSpeech {function} use to inject tts implementation
 * @property stop {function} use to stop tts speech
 * @property isSpeaking {boolean} indicate if currently there is a
 *  speech ongoing
 * @property speakId {number} id of the target that is used for tts
 * @property iconColor {null} current color of the speech icon
 * @property component {function} returns the react component {ttsComponent}
 * @property debug {boolean} debugs all internal tts events if true
 */
export const TTSengine = {
  setSpeech (s, { speakImmediately = false, text = '', timeout = 500 } = {}) {
    return promiseWithTimeout(new Promise((resolve) => {
      globalDebug('set speech', { speakImmediately })
      Speech = s

      if (speakImmediately) {
        Speech.speak(text, {
          language: 'ger',
          pitch: 1,
          rate: 1,
          volume: 0,
          onDone: resolve,
          onError: resolve
        })
      }
    }), timeout)
  },
  on: (name, fn) => {
    globalDebug('add global listener', name)
    handlers[name] = handlers[name] || []
    handlers[name].push(fn)
  },
  stop () {
    return Speech.stop()
  },
  availableVoices: null,
  isSpeaking: false,
  speakId: 0,
  iconColor: null,
  debug: false,
  defaultSpeed: 1,
  currentSpeed: 1,
  currentVoice: undefined,
  /** @deprecated use `useTts` hook from this module instead */
  component: () => ttsComponent,
  updateSpeed: newSpeed => {
    globalDebug('set new speed', newSpeed)
    if (newSpeed < 0.1 || newSpeed > 2.0) {
      throw new Error(`New speed not in range, expected ${newSpeed} between 0.1 and 2.0`)
    }
    TTSengine.currentSpeed = newSpeed
  },
  setVoice: identifier => {
    globalDebug('set default voice', identifier)
    TTSengine.currentVoice = identifier
  },
  speakImmediately: text => {
    globalDebug('speak immediately', text)
    Speech.stop()
    Speech.speak(text, {
      language: 'ger',
      pitch: 1,
      rate: TTSengine.currentSpeed,
      volume: 1.0,
      voice: TTSengine.currentVoice
    })
  },
  getVoices: () => new Promise(resolve => {
    globalDebug('get voices')
    if (TTSengine.availableVoices !== null) {
      return resolve(TTSengine.availableVoices)
    }

    loadVoices(5, loaded => {
      TTSengine.availableVoices = loaded
      return resolve(loaded)
    })
  })
}

const loadVoices = (counter, onComplete) => {
  globalDebug('load voices', { counter })
  const langPattern = /de[-_]+/g

  setTimeout(async () => {
    const voices = await Speech.getAvailableVoicesAsync()

    if (voices.length > 0) {
      const filtered = voices.filter(v => langPattern.test(v.language))
      onComplete(filtered)
    }
    else {
      if (!counter || counter < 10) {
        loadVoices((counter ?? 0) + 1)
      }
      else {
        onComplete([])
      }
    }
  }, (counter ?? 1) * 300)
}

export const useTts = () => ({ Tts: ttsComponent })
