import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { LinearProgress } from 'react-native-elements'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { getDimensionColor } from '../../screens/unit/getDimensionColor'
import { AppSessionContext } from '../../state/AppSessionContext'
import Colors from '../../constants/Colors'
import { computeProgress } from './computeProgress'

/**
 * Represents the progress of the current selected stage/dimension
 * combination (which is basically a UnitSet with 1..n units).
 *
 *
 * @return {JSX.Element}
 * @component
 */
export const CurrentProgress = () => {
  const [session] = useContext(AppSessionContext)
  const [value, setValue] = useState(session.progress ?? 0)
  const [color, setColor] = useState(Colors.transparent)

  useEffect(() => {
    if (!session.unitSet || !session.dimension || session.progress === undefined) {
      return null // skip until we got enough data to compute
    }

    const dimensionColor = getDimensionColor(session.dimension)
    const currentValue = computeProgress({
      current: session.progress ?? 0,
      max: session.unitSet?.progress ?? 1
    })

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
    width: '80%'
  },
  progressBar: { height: 16, borderRadius: 16, borderWidth: 1 }
})
