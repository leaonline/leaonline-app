import { useCallback, useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { START_UP_DELAY } from '../constants/App'

const useSplashScreen = (initFunctions) => {
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
    async function prepare () {
      try {
        // Keep the splash screen visible while we fetch resources
        SplashScreen.preventAutoHideAsync()

        await Promise.all(initFunctions.map(fn => fn()))

        // use this effect to make the splash screen remain
        // for a few seconds, once the font has been loaded
        await new Promise(resolve => setTimeout(resolve, START_UP_DELAY))
      }
      catch (e) {
        console.error(e)
        setError(e)
      }
      finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  return {
    appIsReady, onLayoutRootView, error
  }
}

export default useSplashScreen
