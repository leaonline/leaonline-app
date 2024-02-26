import React, { useCallback, useEffect, useState } from 'react'
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
  const connection = useConnection()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (showWarning && connection.connected) {
      setShowWarning(false)
    }
    if (!showWarning && !connection.connected) {
      setShowWarning(true)
    }
  }, [showWarning, connection.connected])

  const renderConnectionStatus = useCallback(() => {
    return showWarning
      ? (<Connecting connection={connection} />)
      : null
  }, [showWarning, connection.www, connection.backend])

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
      <MainNavigation onLayout={onLayoutRootView} connection={connection} />
      {renderConnectionStatus()}
    </CatchErrors>
  )
}
