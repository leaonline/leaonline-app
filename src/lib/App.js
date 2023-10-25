import React, { useCallback } from 'react'
import './i18n'
import { useSplashScreen } from './hooks/useSplashScreen'
import { useConnection } from './hooks/useConnection'
import { ErrorMessage } from './components/ErrorMessage'
import { initContexts } from './startup/initContexts'
import { initTTs } from './startup/initTTS'
import { Connecting } from './components/Connecting'
import { ViewContainer } from './components/ViewContainer'
import { MainNavigation } from './navigation/MainNavigation'
import { initExceptionHandling } from './startup/initExceptionHandling'
import { CatchErrors } from './components/CatchErrors'
import { initSound } from './startup/initSound'
import { validateSettingsSchema } from './schema/validateSettingsSchema'
import { initFonts } from './startup/initFonts'

const initFunctions = [
  initFonts,
  initExceptionHandling,
  validateSettingsSchema,
  initContexts,
  initTTs,
  initSound
]

/**
 * Main Application entry point
 * @category Global
 * @component
 * @returns {JSX.Element}
 */
export const App = function App () {
  const { appIsReady, error, onLayoutRootView } = useSplashScreen(initFunctions)
  const { connected } = useConnection()
  const renderConnectionStatus = useCallback(() => {
    if (connected) {
      return null
    }
    return (<Connecting />)
  }, [connected])

  // splashscreen is still active...
  if (!appIsReady) { return null }

  if (error) {
    return (
      <CatchErrors>
        <ViewContainer onLayout={onLayoutRootView}>
          <ErrorMessage error={error} onLayout={onLayoutRootView} />
        </ViewContainer>
      </CatchErrors>
    )
  }

  return (
    <CatchErrors>
      <MainNavigation onLayout={onLayoutRootView} />
      {renderConnectionStatus()}
    </CatchErrors>
  )
}
