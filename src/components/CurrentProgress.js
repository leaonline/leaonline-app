import React from 'react'
import { View } from 'react-native'
import { LinearProgress } from 'react-native-elements'
import { createStyleSheet } from '../styles/createStyleSheet'
import { getDimensionColor } from '../screens/unit/getDimensionColor'

export const CurrentProgress = (props) => {
  const dimensionColor = getDimensionColor(props.dimension)

  return (
    <View style={styles.progressContainer}>
      <LinearProgress
        style={{ borderColor: dimensionColor, ...styles.progressBar }}
        trackColor='transparent'
        color={dimensionColor} value={props.value} variant='determinate'
      />
    </View>
  )
}

const styles = createStyleSheet({
  progressContainer: {
    width: '80%',
  },
  progressBar: { height: 16, borderRadius: 16, borderWidth: 1 }
})