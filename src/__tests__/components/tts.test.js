import React from 'react'
import SplashScreen from '../../screens/SplashScreen'
import TandCScreen from '../../screens/TermsAndConditionsScreen'
import { TTSengine } from '../../components/Tts'
import { fireEvent, render, act } from '@testing-library/react-native'
import { asyncTimeout } from '../../utils/asyncTimeout'
import Colors from '../../constants/Colors'
import i18n from '../../i18n'
import { I18nextProvider } from 'react-i18next'

it('find button via testId', () => {
  const { getByTestId } = render(<SplashScreen />)
  const foundButton = getByTestId('splashScreen1')
  expect(foundButton).toBeTruthy()
})

it('tts (async) speak', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (t, options) => {
      expect(t).toBe('Herzlich Willkommen zu lea online')
      speakCalled = true
      setTimeout(() => options.onDone(), 100)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { getByTestId } = render(
    <I18nextProvider i18n={i18n}>
      <SplashScreen />
    </I18nextProvider>
  )
  const foundButton = getByTestId('splashScreen1')
  await act(async () => fireEvent.press(foundButton))
  await asyncTimeout(50)
  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(false)
})

it('stop tts process if its already active', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (t, options) => {
      expect(t).toBe('Herzlich Willkommen zu lea online')
      speakCalled = true
      options.onStart()
      setTimeout(() => options.onDone(), 100)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { getByTestId } = render(
    <I18nextProvider i18n={i18n}>
      <SplashScreen />
    </I18nextProvider>
  )
  const foundButton = getByTestId('splashScreen1')
  await act(async () => fireEvent.press(foundButton))
  expect(TTSengine.isSpeaking).toBe(true)
  await asyncTimeout(5)
  expect(TTSengine.speakId).toBe(0)
  expect(speakCalled).toBe(true)

  await act(async () => fireEvent.press(foundButton))
  await asyncTimeout(5)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(stopCalled).toBe(true)
})

it('start 2 different tts processes successively', async () => {
  let speakCalled = false
  let stopCalled = false

  // TODO keep these strings untranslated during tests so we can test against
  // TODO correct i18n id
  const texts = [
    'Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu',
    'Hiermit stimme ich folgenden Bedingungen zu ...'
  ]
  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (t, options) => {
      expect(t).toBe(texts.pop())
      speakCalled = true
      setTimeout(() => options.onDone(), 100)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { getByTestId } = render(<TandCScreen />)
  const foundButton1 = getByTestId('tandc1')
  const foundButton2 = getByTestId('tandc2')
  await act(async () => fireEvent.press(foundButton1))
  await act(async () => fireEvent.press(foundButton2))
  await asyncTimeout(50)

  expect(speakCalled).toBe(true)
  expect(stopCalled).toBe(true)
})

it('checks for icon color', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (t, options) => {
      expect(t).toBe('Herzlich Willkommen zu lea online')
      speakCalled = true
      options.onStart()
      // simulate speak end aftet 100ms
      setTimeout(() => options.onDone(), 100)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { getByTestId } = render(<SplashScreen />)
  const foundButton = getByTestId('splashScreen1')

  expect(TTSengine.iconColor).toBe(Colors.primary)
  await act(async () => fireEvent.press(foundButton))
  await asyncTimeout(10)
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe(0)
  expect(speakCalled).toBe(true)
  expect(TTSengine.iconColor).toBe(Colors.success)

  await act(async () => fireEvent.press(foundButton))
  await asyncTimeout(10)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(stopCalled).toBe(true)
  expect(TTSengine.iconColor).toBe(Colors.primary)
})
