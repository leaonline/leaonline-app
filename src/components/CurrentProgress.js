import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { LinearProgress } from 'react-native-elements'
import { createStyleSheet } from '../styles/createStyleSheet'
import { getDimensionColor } from '../screens/unit/getDimensionColor'
import { AppSessionContext } from '../state/AppSessionContext'
import Colors from '../constants/Colors'

export const CurrentProgress = () => {
  const [value, setValue] = useState(0)
  const [color, setColor] = useState(Colors.transparent)
  const [session] = useContext(AppSessionContext)

  useEffect(() => {
    if (!session.unitSet || !session.dimension || session.progress === undefined) {
      return null // skip until we got enough data to compute
    }

    const dimensionColor = getDimensionColor(session.dimension)
    const current = session.progress ?? 0
    const max = session.unitSet?.progress ?? 1
    let currentValue = (current + 1) / (max + 1)

    if (currentValue < 0) currentValue = 0
    if (currentValue > 1) currentValue = 1
    if (Number.isNaN(currentValue) || !Number.isFinite(currentValue)) {
      currentValue = 0
    }

    setTimeout(() => {
      setColor(dimensionColor)
      setValue(currentValue)
    }, 500)
  }, [session.unitSet, session.dimension, session.progress])

  return (
    <View style={styles.progressContainer}>
      <LinearProgress
        style={{ borderColor: color, ...styles.progressBar }}
        trackColor='transparent'
        color={color}
        value={value}
        variant='determinate'
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