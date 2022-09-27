import React, { useEffect, useState } from 'react'
import { View, Vibration } from 'react-native'
import * as Font from 'expo-font'
import AppLoading from 'expo-app-loading'
import * as Speech from 'expo-speech'
import { Log } from './infrastructure/Log'
import { connectMeteor } from './meteor/connect'
import { loginMeteor } from './meteor/loginMeteor'
import { loggedIn } from './meteor/loggedIn'
import { TTSengine } from './components/Tts'
import Navigator from './navigation/navigator'
import { createStyleSheet } from './styles/createStyleSheet'
import { initAppState } from './startup/initAppState'
import './startup/initContexts'
import './i18n'

const log = Log.create('App')

const startApp = async () => {
  log('init App')
  await initAppState()
  await fetchFonts()
  await connect()
}

const connect = async () => {
  log('connect to meteor')
  try {
    await connectMeteor()
  } catch (connectError) {
    // if we have not a connection, we wait for
    // a longer timeout and try to reconnect
    // TODO ADD MODAL WITH CONNECTION NOTIFICATION
    Log.error(connectError)
    return setTimeout(() => connect(), 5000)
  }

  // once connected we can continue as expected
  return onConnected()
}

const onConnected = async () => {
  log('Meteor connected, attempt login')
  let loginSuccessful = false

  try {
    const loginStatus = await loginMeteor()
    loginSuccessful = !loginStatus.failed && loginStatus._id && loginStatus.username
    log('login successful:', loginSuccessful)
  } catch (loginError) {
    loginSuccessful = false
    log('login failed', loginError.message)
  }

  // if we are logged-in but the user is not available yet, we
  // set an interval and wait for the user to be available
  if (loginSuccessful && !loggedIn()) {
    throw new Error('Implement intverval to wait for logged-in user!')
  }
}

/**
 * @private used to load our custom font
 * @return {Promise<void>}
 */
const fetchFonts = async () => {
  log('fetch fonts')
  let handle = null // bad style, alternative?

  try {
    handle = require('./assets/fonts/SemikolonPlus-Regular.ttf')
  } catch (error) {
    log('WARNING: Default font not found, using fallback font.') // FIXME: isn't printed as of right now
    handle = require('./assets/fonts/arial.ttf')
  } finally {
    if (handle != null) {
      await Font.loadAsync({
        semicolon: handle
      })
    }
  }
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  screen: {
    flex: 1
  }
})

// inject expo-speech as our current
// speech-synthesis implementation
TTSengine.setSpeech(Speech, { speakImmediately: true })
TTSengine.on('beforeSpeak', () => Vibration.vibrate(150))

/**
 * Main Application entry point
 * @category Global
 * @component
 * @returns {JSX.Element}
 */
export default function App () {
  const [initialized, setInitialized] = useState(false)
  const [waitTimeout, setTimeoutComplete] = useState(false)

  // use this effect to make the splash screen remain
  // for a few seconds, once the font has been loaded
  useEffect(() => {
    if (initialized) {
      // TODO Timeout variable should be later set in a separate global environment file
      setTimeout(() => {
        setTimeoutComplete(true)
      }, 1000)
    }
  }, [initialized])

  if (!waitTimeout) {
    return (
      <AppLoading
        startAsync={startApp}
        onFinish={() => setInitialized(true)}
        onError={(error) => console.error(error)}
      />
    )
  }

  return (
    <View style={styles.screen}>
      <Navigator loggedIn={!!loggedIn()} />
    </View>
  )
}
