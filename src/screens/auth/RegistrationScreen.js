import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { TTSengine, useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../../contexts/AuthContext'
import { useUser } from '../../hooks/useUser'
import { ErrorMessage } from '../../components/ErrorMessage'

/**
 * Screen for registering a new user.
 * This screen should automatically run without further actions required.
 * @category Screens
 * @component
 * @returns {JSX.Element}
 */
export const RegistrationScreen = () => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const { user } = useUser()
  const { signUp } = useContext(AuthContext)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      const currentVoice = TTSengine.currentVoice
      const currentSpeed = TTSengine.currentSpeed
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
