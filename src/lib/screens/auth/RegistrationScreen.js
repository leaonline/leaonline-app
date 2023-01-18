import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { TTSengine, useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../../contexts/AuthContext'
import { useUser } from '../../hooks/useUser'
import { ErrorMessage } from '../../components/ErrorMessage'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { Loading } from '../../components/Loading'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'

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
      const voice = TTSengine.currentVoice
      const speed = TTSengine.currentSpeed
      const onError = e => {
        InteractionGraph.problem({
          target: `${RegistrationScreen.name}.register`,
          type: 'failed',
          error: e
        })
        setError(e)
      }
      const onSuccess = () => InteractionGraph.goal({
        target: `${RegistrationScreen.name}.register`,
        type: 'registered'
      })

      setTimeout(() => signUp({ voice, speed, onError, onSuccess }), 1000)
    }
  }, [user])

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage error={error}/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Loading/>
      <Tts text={t('registrationScreen.creating')}/>
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    alignItems: 'center',
    justifyContent: 'center'
  }
})
