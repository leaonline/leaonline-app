import React from 'react'
import WelcomeScreen from '../../screens/WelcomeScreen'
import TandCScreen from '../../screens/TermsAndConditionsScreen'
import { TTSengine } from '../../components/Tts'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

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

it('stop tts process if its already active ', async () => {
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
  fireEvent.press(foundButton)
  fireEvent.press(foundButton)
  await waitFor(() => {
    expect(global.ttsIsCurrentlyPlaying).toBe(false)
    expect(speakCalled).toBe(true)
    expect(stopCalled).toBe(true)
  })
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
