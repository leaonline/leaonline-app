import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { TTSengine } from '../../components/Tts'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../../contexts/AuthContext'
import { useUser } from '../../hooks/useUser'
import { ErrorMessage } from '../../components/ErrorMessage'

/**
 *
 * @param props
 * @constructor
 */
export const RegistrationScreen = props => {
  const { t } = useTranslation()
  const { user } = useUser()
  const { signUp } = useContext(AuthContext)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      const currentVoice = TTSengine.currentVoice
      const currentSpeed = TTSengine.currentSpeed
      console.debug(currentVoice, currentSpeed)
      const onError = e => setError(e)
      signUp({ currentVoice, currentSpeed, onError })
    }
  }, [user])

  if (error) {
    return (<ErrorMessage error={error} />)
  }

  return (
    <>
      <ActivityIndicator />
      <Tts text={t('registerScreen.creatingAccount')} />
    </>
  )
}

const styles = createStyleSheet({

})

const Tts = TTSengine.component()
