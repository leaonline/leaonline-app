import React from 'react'
import { View } from 'react-native'

import { Tooltip, Text } from 'react-native-elements'
import { Colors } from '../constants/Colors'
import { makeTransparent } from '../styles/makeTransparent'
import { LeaText } from '../components/LeaText'
import { createStyleSheet } from '../styles/createStyleSheet'

const data = {
  value: {
    left: [
      { text: 'z.B. 1000 g' },
      { text: 'z.B. 10000 g' }
    ],
    right: [
      { text: 'z.B. 10 kg' },
      { text: 'z.B. 1 kg' }
    ]
  }
}

export const MapDevScreen = () => {
  return (
    <View style={styles.container}>
      <Tooltip
        skipAndroidStatusBar={true}
        height={100}
        width={200}
        popover={<View style={styles.actionsContainer}><LeaText style={styles.text}>{'hellooooo'}</LeaText></View>}
        withOverlay={false}
        withPointer={true}
        backgroundColor={Colors.dark}
        containerStyle={styles.tooltip}
        overlayColor={makeTransparent(Colors.white, 0.3)}
      >
        <LeaText style={styles.text}>{'hellooooo'}</LeaText>
      </Tooltip>

    </View>
  )
}

const styles = createStyleSheet({
  tooltip: {},
  text: {}
})