import React, { useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TTSengine, useTts } from '../../components/Tts'
import { CharacterInput } from '../../components/CharacterInput'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { View } from 'react-native'
import { ActionButton } from '../../components/ActionButton'
import { ErrorMessage } from '../../components/ErrorMessage'
import { AuthContext } from '../../contexts/AuthContext'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'

export const RestoreScreen = () => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [allCodes, setAllCodes] = useState(false)
  const [error, setError] = useState(null)
  const codes = useRef([[], [], []])
  const { restore } = useContext(AuthContext)
  const updateCodes = (newCodes, index) => {
    codes.current[index] = newCodes
    const hasAllCodes = codes.current.every(entry => entry.length === 4)
    setAllCodes(hasAllCodes)
  }
  const checkCodes = () => {
    restore({
      codes: codes.current.map(entry => entry.join('')),
      voice: TTSengine.currentVoice,
      speed: TTSengine.currentSpeed,
      onError: err => {
        InteractionGraph.problem({
          type: 'rejected',
          target: InteractionGraph.toTargetGraph(RestoreScreen.name, checkCodes.name),
          error: err
        })
        setError(err)
      }
    })
  }

  return (
    <View style={styles.container}>
      <Tts text={t('restoreScreen.instructions')} />
      <CharacterInput id='row-1' length={4} onEnd={newCodes => updateCodes(newCodes, 0)} />
      <CharacterInput id='row-2' length={4} onEnd={newCodes => updateCodes(newCodes, 1)} />
      <CharacterInput id='row-3' length={4} onEnd={newCdes => updateCodes(newCdes, 2)} />
      <ErrorMessage error={error} />
      <ActionButton disabled={!allCodes} title={t('restoreScreen.checkCode')} onPress={checkCodes} />
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    marginLeft: '15%',
    marginRight: '15%',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
