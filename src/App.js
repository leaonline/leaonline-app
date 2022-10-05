import React, { useCallback, useEffect, useState } from 'react'
import { View, Vibration } from 'react-native'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';

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
import { START_UP_DELAY } from './constants/App';

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
    handle = require('./assets/fonts/OpenSans-VariableFont_wdth,wght.ttf')
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
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady])

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        SplashScreen.preventAutoHideAsync();

        await startApp()

        // use this effect to make the splash screen remain
        // for a few seconds, once the font has been loaded
        await new Promise(resolve => setTimeout(resolve, START_UP_DELAY));
      } catch (e) {
        console.log(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.screen} onLayout={onLayoutRootView}>
      <Navigator loggedIn={!!loggedIn()} />
    </View>
  )
}
