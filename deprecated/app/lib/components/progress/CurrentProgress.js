import React, { useContext, useEffect, useState } from 'react'
import { LinearProgress } from 'react-native-elements'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { getDimensionColor } from '../../screens/unit/getDimensionColor'
import { AppSessionContext } from '../../state/AppSessionContext'
import { Colors } from '../../constants/Colors'
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
  const [value, setValue] = useState(0.05)
  const [color, setColor] = useState(Colors.transparent)

  useEffect(() => {
    const { unitSet, dimension, progress = 0 } = session
    if (!unitSet || !dimension) {
      return // skip until we got enough data to compute
    }

    const max = session.unitSet?.progress ?? 1
    const dimensionColor = getDimensionColor(session.dimension)
    const currentValue = computeProgress({ current: progress, max })

    setTimeout(() => {
      if (dimensionColor !== color) {
        setColor(dimensionColor)
      }
      if (currentValue > value) {
        setValue(currentValue)
      }
    }, 500)
  }, [session.unitSet, session.dimension, session.progress])

  return (
    <LinearProgress
      style={{ borderColor: color, ...styles.progressBar }}
      trackColor='transparent'
      color={color}
      value={value}
      variant='determinate'
    />
  )
}

const styles = createStyleSheet({
  progressBar: {
    width: '70%',
    height: 16,
    borderRadius: 16,
    borderWidth: 1
  }
})
