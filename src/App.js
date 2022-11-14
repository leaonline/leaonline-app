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
import { useAppState } from './hooks/useAppState'

const {AppSessionProvider } = AppSession.init({
  storage: AsyncStorage
})

const initFunction = [
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
  const { connectionError, connected } = useConnection()

  // splashscreen is still active...
  if (!appIsReady) { return null }

  const anyError = error ?? connectionError

  if (anyError) {
    return (
      <ViewContainer onLayout={onLayoutRootView}>
        <ErrorMessage message={anyError.message} onLayout={onLayoutRootView} />
      </ViewContainer>
    )
  }

  if (!connected) {
    return (
      <ViewContainer onLayout={onLayoutRootView}>
        <Connecting />
      </ViewContainer>
    )
  }

  return (
    <AppSessionProvider>
      <MainNavigation onLayout={onLayoutRootView} />
    </AppSessionProvider>
  )
}
