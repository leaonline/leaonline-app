import React from 'react'
import { View, ActivityIndicator, Dimensions } from 'react-native'
import { TTSengine } from './Tts'
import Colors from '../constants/Colors'
import { createStyleSheet } from '../styles/createStyleSheet'

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  loader: {
    marginLeft: Dimensions.get('window').width
  }
})

const Tts = TTSengine.component()

export const Loading = ({ text }) => {
  const renderText = () => {
    if (!text) return null

    return (
      <Tts text={text} />
    )
  }
  return (
    <View style={styles.loader}>
      <ActivityIndicator size='large' color={Colors.secondary} />
      {
        renderText()
      }
    </View>
  )
}
