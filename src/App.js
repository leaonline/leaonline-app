import React from 'react'
import './i18n'
import useSplashScreen from './hooks/useSplashScreen'
import { useConnection } from './hooks/useConnection'
import { ErrorMessage } from './components/ErrorMessage'
import { initContexts } from './startup/initContexts'
import { initAppState } from './startup/initAppState'
import { fetchFonts } from './startup/initFonts'
import { initTTs } from './startup/initTTS'
import { Connecting } from './components/Connecting'
import { ViewContainer } from './components/ViewContainer'
import { MainNavigation } from './navigation/MainNavigation'
import { AppSession } from './state/AppSession'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initExceptionHandling } from './startup/initExceptionHandling'
import { CatchErrors } from './components/CatchErrors'

const { AppSessionProvider } = AppSession.init({
  storage: AsyncStorage
})

const initFunction = [
  initExceptionHandling,
  initContexts,
  initAppState,
  fetchFonts,
  initTTs
]

/**
 * Main Application entry point
 * @category Global
 * @component
 * @returns {JSX.Element}
 */
export default function App () {
  const { appIsReady, error, onLayoutRootView } = useSplashScreen(initFunction)
  const { connected } = useConnection()

  // splashscreen is still active...
  if (!appIsReady) { return null }

  if (error) {
    return (
      <CatchErrors>
        <ViewContainer onLayout={onLayoutRootView}>
          <ErrorMessage error={error.message} onLayout={onLayoutRootView} />
        </ViewContainer>
      </CatchErrors>
    )
  }

  if (!connected) {
    return (
      <CatchErrors>
        <ViewContainer onLayout={onLayoutRootView}>
          <Connecting />
        </ViewContainer>
      </CatchErrors>
    )
  }

  return (
    <CatchErrors>
      <AppSessionProvider>
        <MainNavigation onLayout={onLayoutRootView} />
      </AppSessionProvider>
    </CatchErrors>
  )
}
