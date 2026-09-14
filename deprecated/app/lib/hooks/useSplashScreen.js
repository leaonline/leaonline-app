import { useCallback, useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { START_UP_DELAY } from '../constants/App'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'
import { useFonts } from 'expo-font'
import { asyncTimeout } from '../utils/asyncTimeout'

export const useSplashScreen = (initFunctions) => {
  const [initReady, setInitReady] = useState(false)
  const [fontIsReady] = useFonts({
    semicolon: require('../../assets/fonts/SemikolonPlus-Regular.ttf')
  })
  const [error, setError] = useState(null)

  const onLayoutRootView = useCallback(async () => {
    if (initReady && fontIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setInitReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [initReady, fontIsReady])

  useEffect(() => {
    const onError = e => {
      Log.error(e)
      InteractionGraph.problem({
        type: 'startup',
        error: e
      })
      setError(e)
      ErrorReporter
        .send({ error: e })
        .catch(Log.error)
    }
    async function prepare () {
      InteractionGraph.enterApp()

      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync()
        await Promise.all(initFunctions.map(fn => fn()))

        // use this effect to make the splash screen remain
        // for a few seconds, once the font has been loaded
        await asyncTimeout(START_UP_DELAY)
      }
      catch (e) {
        onError(e)
      }
      finally {
        // Tell the application to render
        setInitReady(true)
      }
    }

    prepare().catch(onError)
  }, [])

  const appIsReady = initReady && fontIsReady

  return { appIsReady, onLayoutRootView, error }
}
