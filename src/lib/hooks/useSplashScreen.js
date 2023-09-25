import { useCallback, useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { START_UP_DELAY } from '../constants/App'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'

export const useSplashScreen = (initFunctions) => {
  const [appIsReady, setAppIsReady] = useState(false)
  const [error, setError] = useState(null)

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  useEffect(() => {
    const onError = e => {
      Log.error(e)
      InteractionGraph.problem({
        type: 'startup',
        error: e
      })
      setError(e)
      ErrorReporter
        .send({ error:e })
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
        await new Promise(resolve => setTimeout(resolve, START_UP_DELAY))
      }
      catch (e) {
        onError(e)
      }
      finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare().catch(onError)
  }, [])

  return { appIsReady, onLayoutRootView, error }
}
