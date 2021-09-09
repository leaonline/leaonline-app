import React from 'react'
import WelcomeScreen from '../../screens/WelcomeScreen'
import TandCScreen from '../../screens/TermsAndConditionsScreen'
import { TTSengine } from '../../components/Tts'
import { fireEvent, render, waitFor, act } from '@testing-library/react-native'
import { asyncTimeout } from '../../utils/asyncTimeout'
import Colors from '../../constants/Colors'

it('find button via testId', () => {
  const { getByTestId } = render(<WelcomeScreen />)
  const foundButton = getByTestId('welcomeScreen1')
  expect(foundButton).toBeTruthy()
})

it('tts (async) speak', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: t => {
      expect(t).toBe('Herzlich Willkommen zu lea online')
      global.ttsIsCurrentlyPlaying = true
      speakCalled = true
    },
    stop: () => {
      stopCalled = true
      global.ttsIsCurrentlyPlaying = false
    }
  })

  const { getByTestId } = render(<WelcomeScreen />)
  const foundButton = getByTestId('welcomeScreen1')
  await fireEvent.press(foundButton)
  await waitFor(() => {
    expect(global.ttsIsCurrentlyPlaying).toBeTruthy()
    expect(speakCalled).toBe(true)
    expect(stopCalled).toBe(false)
  })
})

it('stop tts process if its already active', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (text, options) => {
      expect(text).toBe('Herzlich Willkommen zu lea online')
      speakCalled = true
      options.onStart()
      setTimeout(() => options.onDone(), 100)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { getByTestId } = render(<WelcomeScreen />)
  const foundButton = getByTestId('welcomeScreen1')

  act(() => fireEvent.press(foundButton))
  await asyncTimeout(10)
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe(1)
  expect(speakCalled).toBe(true)

  act(() => fireEvent.press(foundButton))
  await asyncTimeout(10)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(stopCalled).toBe(true)
})

it('start 2 different tts processes successively', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: t => {
      expect(t).toBe('Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu')
      global.ttsIsCurrentlyPlaying = true
      speakCalled = true
    },
    stop: () => {
      stopCalled = true
      global.ttsIsCurrentlyPlaying = false
    }
  })

  const { getByTestId } = render(<TandCScreen />)
  const foundButton1 = getByTestId('tandc1')
  const foundButton2 = getByTestId('tandc2')
  fireEvent.press(foundButton1)
  fireEvent.press(foundButton2)
  await waitFor(() => {
    expect(global.ttsIsCurrentlyPlaying).toBeTruthy()
    expect(speakCalled).toBe(true)
    expect(stopCalled).toBe(false)
  })
})

it('checks for icon color', async () => {
  let speakCalled = false
  let stopCalled = false

  TTSengine.setSpeech({
    isSpeakingAsync: async function () {
      return false
    },
    speak: (text, options) => {
      expect(text).toBe('Herzlich Willkommen zu lea online')
      speakCalled = true
      options.onStart()
      setTimeout(() => options.onDone(), 100)
    },
    stop: () => {
      stopCalled = true
    }
  })

  const { getByTestId } = render(<WelcomeScreen />)
  const foundButton = getByTestId('welcomeScreen1')

  expect(TTSengine.iconColor).toBe(Colors.primary)
  act(() => fireEvent.press(foundButton))
  await asyncTimeout(10)
  expect(TTSengine.isSpeaking).toBe(true)
  expect(TTSengine.speakId).toBe(1)
  expect(speakCalled).toBe(true)
  expect(TTSengine.iconColor).toBe(Colors.success)

  act(() => fireEvent.press(foundButton))
  await asyncTimeout(10)
  expect(TTSengine.isSpeaking).toBe(false)
  expect(TTSengine.speakId).toBe(0)
  expect(stopCalled).toBe(true)
  expect(TTSengine.iconColor).toBe(Colors.primary)
})
