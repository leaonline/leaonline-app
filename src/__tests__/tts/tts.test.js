import React from 'react'
import { TTSengine, useTts } from '../../components/Tts'
import { fireEvent, render, act } from '@testing-library/react-native'
import { asyncTimeout } from '../../utils/asyncTimeout'
import Colors from '../../constants/Colors'

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
  })

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} id='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(async () => fireEvent.press(ttsBtn))
  await asyncTimeout(10)
  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(false)
})

it('updates global TTSEngine props as side effect', async function () {
  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: async (t, options) => {
      await act(async () => options.onStart())
    },
    stop: () => {}
  })

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} id='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(async () => fireEvent.press(ttsBtn))
  await asyncTimeout(15)
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text')
  expect(TTSengine.iconColor).toBe(Colors.primary)
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
  })

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} id='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(async () => fireEvent.press(ttsBtn))
  await asyncTimeout(10)
  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(true)
  expect(TTSengine.isSpeaking).toBe(false)
})

it('resolve to a complete state via options.onDone', async () => {
  let speakCalled = false
  let stopCalled = false

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (t, options) => {
      expect(t).toBe('ttsMock.text')
      speakCalled = true

      setTimeout(async () => {
        await act(async () => options.onStart())
      }, 0)

      setTimeout(async () => {
        await act(async () => options.onDone())
      }, 50)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { Tts } = useTts()
  const { getByTestId } = render(
    <>
      <Tts text='ttsMock.text' color={Colors.primary} id='ttsMock.text' />
    </>
  )
  const ttsBtn = getByTestId('ttsMock.text')
  await act(async () => fireEvent.press(ttsBtn))
  await asyncTimeout(10)
  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(false)

  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text')
  expect(TTSengine.iconColor).toBe(Colors.primary)

  await asyncTimeout(300)
  expect(stopCalled).toBe(true)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(TTSengine.iconColor).toBe(Colors.primary)
})

it('start 2 different tts processes successively', async () => {
  let stopCalled = false
  let tts1Speaking = false

  await TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      if (tts1Speaking) {
        tts1Speaking = false
        return true
      }
      return false
    },
    speak: async (t, options) => {
      await act(async () => options.onStart())
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { Tts } = useTts()
  const render1 = render(
    <>
      <Tts text='ttsMock.text1' color={Colors.primary} id='ttsMock.text1' />
    </>
  )

  const render2 = render(
    <>
      <Tts text='ttsMock.text2' color={Colors.primary} id='ttsMock.text2' />
    </>
  )

  const ttsBtn = render1.getByTestId('ttsMock.text1')
  const ttsBtn2 = render2.getByTestId('ttsMock.text2')

  await act(async () => fireEvent.press(ttsBtn))
  await asyncTimeout(15)
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text1')
  expect(TTSengine.iconColor).toBe(Colors.primary)
  expect(stopCalled).toBe(false)
  tts1Speaking = true

  await act(async () => fireEvent.press(ttsBtn2))
  await asyncTimeout(15)

  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe('ttsMock.text2')
  expect(TTSengine.iconColor).toBe(Colors.primary)
  expect(stopCalled).toBe(true)
})
