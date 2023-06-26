import React, { useState, useEffect, useCallback } from 'react'
import { View, Pressable } from 'react-native'
import { Button } from 'react-native-elements'
import { Colors } from '../constants/Colors'
import { asyncTimeout } from '../utils/asyncTimeout'
import { createStyleSheet } from '../styles/createStyleSheet'
import { LeaText } from './LeaText'
import { Log } from '../infrastructure/Log'
import { promiseWithTimeout } from '../utils/promiseWithTimeout'
import { SoundIcon } from './SoundIcon'

/** @private **/
let Speech = null

/** @private **/
const styles = createStyleSheet({
  container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  ttsButton: {
    borderColor: '#0f0'
  },
  text: {},
  icon: { padding: 5 }
})

const globalDebug = Log.create('tts', 'debug')
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
 * @param {string} props.ttsText: The spoken text, use this if it differs from written text
 * @param {boolean} props.dontShowText: Determines whether the text is displayed (Default 'true')
 * @param {boolean} props.smallButton: Changes the button size from 20 to 15 (Default 'false')
 * @param {boolean=} props.block: Makes the container flexGrow. If this causes problems, use style instead.
 * @param {boolean=} props.asButton: Makes the container a block-sized button
 * @param {boolean=} props.disabled: Makes the button disabled
 * @param {string=} props.color: The color of the icon and the text, in hexadecimal format. Default: Colors.secondary
 *   (examples in ./constants/Colors.js)
 * @param {string=} props.iconColor: The color of the icon in hexadecimal format. Default: Colors.secondary   (examples
 *   in ./constants/Colors.js)
 * @param {string=} props.activeIconColor: The color of the icon when speaking is active
 * @param {number} props.shrink: The parameter to shrink the text. Default: 1
 * @param {number} props.fontSize: The parameter to change the font size of the text. Default: 18
 * @param {string} props.fontStyle: The parameter to change the font style of the text. Default: 'normal' ('italic')
 * @param {object=} props.style: The parameter to change the font style of the text. Default: 'normal' ('italic')
 * @param {string} props.align Defines the vertical alignment of the button and text
 * @param {number} props.paddingTop: Determines the top padding of the text. Default: 8
 * @param {number} props.speed: Determines the speed rate of the voice to speak. Default: 1.0
 * @param {string|number} props.id: The parameter to identify the buttons
 * @returns {JSX.Element}
 * @component
 */
const TtsComponent = props => {
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
  const speak = useCallback(async () => {
    runHandlers('beforeSpeak')

    const isSpeaking = await Speech.isSpeakingAsync()
    debug('speak', { isSpeaking })

    if (isSpeaking) {
      stopSpeak()
      await asyncTimeout(5)
      return await speak()
    }

    const textToSpeak = props.ttsText ?? props.text

    Speech.speak(textToSpeak, {
      language: 'ger',
      pitch: 1,
      rate: props.speed || TTSengine.currentSpeed,
      voice: props.voice || TTSengine.currentVoice,
      onStart: () => {
        debug('speak', textToSpeak)
        startSpeak()
      },
      onStopped: () => {
        debug('stopped', textToSpeak)
        stopSpeak()
      },
      onDone: () => {
        debug('finished', textToSpeak)
        // TODO call stopSpeak and update tests to fix state bug
        stopSpeak()
        setIsDone(true)
      }
    })
  }, [])
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
    setSpeakingId(props.testId ?? props.id)
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
    const textStyleProps = { color: getIdleTextColor(), marginLeft: 10 }

    if (props.block) {
      textStyleProps.flex = 1
      textStyleProps.flexGrow = 1
    }

    if (props.fontStyle) {
      Object.assign(textStyleProps, props.fontStyle)
    }

    return (<LeaText style={textStyleProps} fitSize={props.fitSize}>{props.text}</LeaText>)
  }

  const ttsContainerStyle = { ...styles.container }
  if (props.align) {
    ttsContainerStyle.alignItems = props.align
  }
  if (props.style) {
    Object.assign(ttsContainerStyle, props.style)
  }
  const iconSize = props.smallButton ? 20 : 30
  const onPress = () => ((speakingId === props.id) && isSpeaking) ? stopSpeak() : speak()
  const rippleConfig = {
    color: iconColor,
    borderless: true,
    radius: iconSize
  }

  const renderIcon = () => {
    const currentIconColor = props.asButton && !isSpeaking
      ? Colors.white
      : props.disabled
        ? Colors.gray
        : iconColor
    return (
      <SoundIcon
        animated={isSpeaking}
        color={currentIconColor}
        size={iconSize}
        style={styles.icon}
      />
    )
  }

  if (props.asButton) {
    const buttonStyle = {
      backgroundColor: isSpeaking
        ? Colors.white
        : iconColor
    }
    if (props.block) {
      buttonStyle.flexGrow = 1
    }
    return (
      <Button
        accessibilityRole='button'
        testID={props.testId}
        containerStyle={ttsContainerStyle}
        buttonStyle={[styles.ttsButton, buttonStyle]}
        onPress={onPress}
        type='solid'
        raised
        disabled={props.disabled}
        title={renderIcon()}
      />
    )
  }

  return (
    <View style={ttsContainerStyle}>
      <Pressable
        accessibilityRole='button'
        disabled={props.disabled}
        android_ripple={rippleConfig}
        onPress={onPress}
        testID={props.testId}
      >
        {renderIcon()}
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
 * @property isSpeaking {boolean} indicate if currently there is a speech ongoing
 * @property speakId {number} id of the target that is used for tts
 * @property iconColor {null} current color of the speech icon
 * @property component {function} returns the react component {ttsComponent}
 * @property debug {boolean} debugs all internal tts events if true
 */
export const TTSengine = {
  /**
   *
   * @param speechProvider {object}
   * @param {boolean} [speakImmediately=false]
   * @param text {string}
   * @param timeout {number=}
   * @return {Promise<*>}
   */
  setSpeech (speechProvider, { speakImmediately = false, text = '', timeout = 500 } = {}) {
    globalDebug('set speech', { speakImmediately, timeout, text })
    Speech = speechProvider

    if (speakImmediately) {
      return promiseWithTimeout(new Promise((resolve) => {
        Speech.speak(text, {
          language: 'ger',
          pitch: 1,
          rate: 1,
          volume: 0,
          onDone: resolve,
          onError: resolve
        })
      }), timeout)
    }
    else {
      return Promise.resolve()
    }
  },
  /**
   * Adds a new global hook
   * @param name {string}
   * @param fn {function}
   */
  on: (name, fn) => {
    globalDebug('add global listener', name)
    handlers[name] = handlers[name] || []
    handlers[name].push(fn)
  },
  /**
   * Removes global hook
   * @param name {string}
   * @param fn {function}
   * @return {boolean}
   */
  off: (name, fn) => {
    globalDebug('add global listener', name)
    const list = handlers[name] ?? []
    const index = list.findIndex(value => value === fn)
    if (index === -1) {
      return false
    }
    list.splice(index, 1)
    return true
  },
  /**
   * Stops speaking
   * @return {*}
   */
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
  /**
   * Returns the TTS React component
   * @return {function():JSX.Element}
   */
  component: () => TtsComponent,
  /**
   * Sets a new speed, valid values are 0.1 <= x <= 2.0
   * @param newSpeed {number}
   */
  updateSpeed: newSpeed => {
    globalDebug('set new speed', newSpeed)
    if (newSpeed < 0.1 || newSpeed > 2.0) {
      throw new Error(`New speed not in range, expected ${newSpeed} between 0.1 and 2.0`)
    }
    TTSengine.currentSpeed = newSpeed
  },
  /**
   * Sets a new voice by given identifier
   * @param identifier {string}
   */
  setVoice: identifier => {
    globalDebug('set default voice', identifier)
    TTSengine.currentVoice = identifier
  },
  /**
   * Speaks a new text immediately, stops
   * all speech
   * @param text
   */
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
  /**
   * Returns all available voices
   * @return {Promise<Array<Object>>}
   */
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
  const langPattern = /de[-_]+/i

  setTimeout(async () => {
    const voices = await Speech.getAvailableVoicesAsync()

    if (voices.length > 0) {
      const filtered = voices.filter(v => {
        return (
          langPattern.test(v.language) &&
          !(v.identifier ?? '').includes('eloquence')
        )
      })

      onComplete(filtered)
    }
    else {
      if (!counter || counter < 10) {
        loadVoices((counter ?? 0) + 1, onComplete)
      }
      else {
        onComplete([])
      }
    }
  }, (counter ?? 1) * 300)
}

export const useTts = () => ({ Tts: TtsComponent })
