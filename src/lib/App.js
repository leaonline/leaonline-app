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
import { initExceptionHandling } from './startup/initExceptionHandling'
import { CatchErrors } from './components/CatchErrors'
import { initSound } from './startup/initSound'

const initFunction = [
  initExceptionHandling,
  initContexts,
  initAppState,
  fetchFonts,
  initTTs,
  initSound
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
      <MainNavigation onLayout={onLayoutRootView} />
    </CatchErrors>
  )
}