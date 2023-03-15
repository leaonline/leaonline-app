import React, { useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TTSengine, useTts } from '../../components/Tts'
import { CharacterInput } from '../../components/CharacterInput'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { ActionButton } from '../../components/ActionButton'
import { ErrorMessage } from '../../components/ErrorMessage'
import { AuthContext } from '../../contexts/AuthContext'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import { Loading } from '../../components/Loading'
import { Log } from '../../infrastructure/Log'

export const RestoreScreen = (props) => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [allCodes, setAllCodes] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)
  const [error, setError] = useState(null)
  const codes = useRef([[], [], []])
  const row1 = useRef([null, null])
  const row2 = useRef([null, null])
  const row3 = useRef([null, null])
  const { restore } = useContext(AuthContext)

  const jumpBack = (index) => {
    if (index === 2 && row2.current[1]) {
      row2.current[1].focus()
    }

    if (index === 1 && row1.current[1]) {
      row1.current[1].focus()
    }
  }

  const updateCodes = (newCodes, index) => {
    codes.current[index] = newCodes
    const hasAllCodes = codes.current.every(entry => entry.length === 4)
    setAllCodes(hasAllCodes)

    if (index === 0 && row2.current[0]) {
      row2.current[0].focus()
    }

    if (index === 1 && row3.current[0]) {
      row3.current[0].focus()
    }
  }
  const checkCodes = async () => {
    setCheckingCode(true)
    restore({
      codes: codes.current.map(entry => entry.join('')),
      voice: TTSengine.currentVoice,
      speed: TTSengine.currentSpeed,
      onError: err => {
        Log.error(err)
        setCheckingCode(false)
        InteractionGraph.problem({
          type: 'rejected',
          target: InteractionGraph.toTargetGraph(RestoreScreen.name, checkCodes.name),
          error: err
        })
        setError(err)
      },
      onSuccess: () => {
        setCheckingCode(false)
        setError(null)
        InteractionGraph.goal({
          target: `${RestoreScreen.name}`,
          type: 'restored'
        })

        setTimeout(() => {
          try {
            props.navigation.navigate('home')
          }
          catch (e) {
            Log.error(e)
          }
        }, 400)
      }
    })
  }

  const renderFailure = () => {
    if (!error && !checkingCode) { return }

    if (checkingCode) {
      return (<Loading />)
    }

    // in case we get any weird 500 errors etc.
    if (!error.error.includes('permissionDenied')) {
      return (<ErrorMessage error={error} />)
    }

    return (
      <View style={styles.errorMessage}>
        <Tts
          block
          iconColor={Colors.white}
          color={Colors.white}
          text={t(error.reason)}
        />
      </View>
    )
  }

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <Tts block text={t('restoreScreen.instructions')} style={styles.instructions} />
        <CharacterInput
          id='row-1' refs={row1} play length={4} onEnd={newCodes => updateCodes(newCodes, 0)}
          disabled={checkingCode}
        />
        <CharacterInput
          id='row-2' refs={row2} play length={4} onEnd={newCodes => updateCodes(newCodes, 1)}
          onNegativeEnd={() => jumpBack(1)} disabled={checkingCode}
        />
        <CharacterInput
          id='row-3' refs={row3} play length={4} onEnd={newCodes => updateCodes(newCodes, 2)}
          onNegativeEnd={() => jumpBack(2)} disabled={checkingCode}
        />
        {renderFailure()}
        <ActionButton
          block
          disabled={!allCodes}
          waiting={checkingCode}
          title={t('restoreScreen.checkCode')}
          style={styles.checkButton}
          onPress={checkCodes}
        />
      </SafeAreaView>
    </ScrollView>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  instructions: {
    marginBottom: 10
  },
  errorMessage: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 15
  },
  checkButton: {
    marginTop: 10
  }
})
