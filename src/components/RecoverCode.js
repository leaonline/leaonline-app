import React from 'react'
import { StyleSheet, View } from 'react-native'
import { TTSengine } from './Tts'

/**
 * @private
 */
const Tts = TTSengine.component()


export const RecoverCode = () => {
  const user = Meteor.user()
  const renderCodes = () => {
    return user.recover.map(code => {
      return (
        <View>
          <Tts text={code} dontShowText />
        </View>
      )
    })
  }

  return (
    <View>
      {renderCodes()}
    </View>
  )
}
