import React from 'react'
import Svg, { G } from 'react-native-svg'
import { StaticCircularProgress } from '../../../components/progress/StaticCircularProgress'
import { Diamond } from '../../../components/progress/Diamond'
import { getPositionOnCircle } from '../../../utils/trigonometry/getPositionOnCircle'
import { Pressable, Vibration } from 'react-native'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import Colors from '../../../constants/Colors'
import { ColorTypeMap } from '../../../constants/ColorTypeMap'

const positions = getPositionOnCircle({ n: 10, radius: 50 })
const competencies = [
  positions[6],
  positions[7],
  positions[8],
  positions[9]
]

export const Stage = props => {
  const width = props.width ?? 100
  const height = props.height ?? 100
  const viewBox = `0 0 ${width} ${height}`

  // progress circle
  const stageProgress = {}
  stageProgress.radius = width * 0.35
  stageProgress.x = width * 0.15
  stageProgress.y = height * 0.3

  const { text, progress } = props
  const rippleConfig = {
    radius: width / 2,
    borderless: true,
    color: Colors.primary
  }

  const handlePress = () => {
    Vibration.vibrate(50)
    if (props.onPress) {
      return props.onPress()
    }
  }

  return (
    <Pressable
      android_ripple={rippleConfig}
      android_disableSound={false}
      style={styles.container}
      pressRetentionOffset={0}
      hitSlop={0}
      onPress={handlePress}>
      <Svg width={width} height={height} viewBox={viewBox}>
        <G x={stageProgress.x} y={stageProgress.y}>
          <StaticCircularProgress
            text={text}
            radius={stageProgress.radius}
            maxValue={100}
            textColor={Colors.secondary}
            fillColor={Colors.white}
            activeStrokeColor={Colors.secondary}
            inActiveStrokeColor={Colors.white}
            inActiveStrokeOpacity={1}
            inActiveStrokeWidth={5}
            activeStrokeWidth={5}
            showProgressValue={false}
            valueSuffix='%'
            value={progress}
          />
        </G>
        {
        competencies.map(({ x, y }, index) => {
          const unitSet = props.unitSets[index]
          const dimensionDoc = props.dimensions[unitSet?.dimension]
          const key = `stage-${text}-${dimensionDoc ? dimensionDoc.shortCode : index}`
          const color = dimensionDoc
            ? ColorTypeMap.get(dimensionDoc.colorType)
            : Colors.light
          const progress = unitSet
            ? Math.round(((unitSet.userCompetencies || 0) / unitSet.competencies) * 100)
            : 0
          return (
            <G key={index} x={x - 7.5} y={y}>
              <Diamond key={key} width={15} height={30} value={progress} color={color} />
            </G>
          )
        })
      }
      </Svg>
    </Pressable>
  )
}

const styles = createStyleSheet({
  container: {}
})
