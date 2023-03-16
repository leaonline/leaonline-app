import React from 'react'
import { fireEvent, render, act } from '@testing-library/react-native'
import { TTSengine, useTts } from '../../lib/components/Tts'
import { Colors } from '../../lib/constants/Colors'

const setSpeechOptions = { timeout: 25 }

it('speaks a given text', async () => {
  let speakCalled = false
  let stopCalled = false

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (t) => {
      expect(t).toBe('ttsMock.text')
      speakCalled = true
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))

  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(false)
})

it('updates global TTSEngine props as side effect', async function () {
  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: async (t, options) => {
      if (TTSengine.isSpeaking) { await act(() => options.onDone()) }
      else { await act(() => options.onStart()) }
    },
    stop: () => {}
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text')
  expect(TTSengine.iconColor).toBe(Colors.primary)

  await act(() => fireEvent.press(ttsBtn))
})

it('stops if the action is executed before the tts is done', async function () {
  let speakCalled = false
  let stopCalled = false
  let isSpeakingCalled = false
  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      if (isSpeakingCalled) {
        return false
      }

      isSpeakingCalled = true
      return true
    },
    speak: () => {
      speakCalled = true
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))

  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(true)
  expect(TTSengine.isSpeaking).toBe(false)
})

it('resolve to a complete state via options.onStart', async () => {
  let speakCalled = false
  let stopCalled = false
  let opts

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: async (t, options) => {
      opts = options
      expect(t).toBe('ttsMock.text')
      speakCalled = true

      await act(() => options.onStart())
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))

  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(false)

  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text')
  expect(TTSengine.iconColor).toBe(Colors.primary)

  // clean up
  await act(() => opts.onDone())
})

it('resolve to a stopped state via options.onStopped', async () => {
  let speakCalled = false
  let stopCalled = false

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: async (t, options) => {
      expect(t).toBe('ttsMock.text')
      speakCalled = true

      await act(() => options.onStopped())
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))
  await act(() => TTSengine.stop())

  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(true)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(TTSengine.iconColor).toBe(Colors.primary)
})

it('allows to attach beforeSpeak listener', async () => {
  let handlerRun = false
  let opts
  const beforeSpeakHandler = () => {
    handlerRun = true
  }

  TTSengine.on('beforeSpeak', beforeSpeakHandler)

  let speakCalled = false
  let stopCalled = false

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: async (t, options) => {
      opts = options
      expect(t).toBe('ttsMock.text')
      speakCalled = true

      await act(() => options.onStart())
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))

  expect(handlerRun).toBe(true)
  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(false)
  expect(TTSengine.off('beforeSpeak', () => {})).toBe(false)
  expect(TTSengine.off('beforeSpeak', beforeSpeakHandler)).toBe(true)

  // clean up
  await act(() => opts.onDone())
})

it('resolve to a complete state via options.onDone', async () => {
  let speakCalled = false
  let stopCalled = false

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: async (t, options) => {
      expect(t).toBe('ttsMock.text')
      speakCalled = true

      await act(() => options.onDone())
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} testId='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(() => fireEvent.press(ttsBtn))

  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(true)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(TTSengine.iconColor).toBe(Colors.primary)
})

it('start 2 different tts processes successively', async () => {
  let stopCalled = false
  let tts1Speaking = false
  let opts
  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      if (tts1Speaking) {
        tts1Speaking = false
        return true
      }
      return false
    },
    speak: async (t, options) => {
      if (opts) {
        // simulate stop / override
        await act(() => opts.onDone())
      }
      opts = options
      await act(() => options.onStart())
    },
    stop: () => {
      stopCalled = true
    }
  }, setSpeechOptions)

  const { Tts } = useTts()
  const render1 = render(
    <>
      <Tts text='ttsMock.text1' color={Colors.primary} testId='ttsMock.text1' />
    </>
  )

  const render2 = render(
    <>
      <Tts text='ttsMock.text2' color={Colors.primary} testId='ttsMock.text2' />
    </>
  )

  const ttsBtn = render1.getByTestId('ttsMock.text1')
  const ttsBtn2 = render2.getByTestId('ttsMock.text2')

  await act(() => fireEvent.press(ttsBtn))
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text1')
  expect(TTSengine.iconColor).toBe(Colors.primary)
  expect(stopCalled).toBe(false)
  tts1Speaking = true
  // clean up

  await act(() => fireEvent.press(ttsBtn2))

  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text2')
  expect(TTSengine.iconColor).toBe(Colors.primary)
  expect(stopCalled).toBe(true)

  // clean up
  await act(() => opts.onDone())
})

describe('API', function () {
  describe(TTSengine.component.name, function () {
    it('returns the React component', () => {
      const c = TTSengine.component()
      expect(typeof c === 'function').toBe(true)
    })
  })
  describe(TTSengine.updateSpeed.name, function () {
    it('throws if speed is out of supported range', () => {
      [-1, -0.1, 0, 0.09, 2.1, 3].forEach(value => {
        expect(() => TTSengine.updateSpeed(value))
          .toThrow(`New speed not in range, expected ${value} between 0.1 and 2.0`)
      })
    })
    it('sets the new speed', () => {
      for (let i = 0.1; i <= 2.0; i += 0.1) {
        TTSengine.updateSpeed(i)
        expect(TTSengine.currentSpeed).toBe(i)
      }
      TTSengine.currentSpeed = 1
    })
  })
  describe(TTSengine.getVoices.name, function () {
    it('loads voices if not yet loaded', async () => {
      await TTSengine.setSpeech({
        async getAvailableVoicesAsync () {
          return [{ language: 'en-GB' }, { language: 'de-DE' }]
        }
      })
      const voices = await TTSengine.getVoices()
      expect(voices).toEqual([{ language: 'de-DE' }])
    })
  })
})
