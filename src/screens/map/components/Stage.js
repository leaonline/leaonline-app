import React, { useEffect, useState } from 'react'
import Svg, { G } from 'react-native-svg'
import { StaticCircularProgress } from '../../../components/progress/StaticCircularProgress'
import { Diamond } from '../../../components/progress/Diamond'
import { getPositionOnCircle } from '../../../utils/trigonometry/getPositionOnCircle'
import { Pressable, Vibration } from 'react-native'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import Colors from '../../../constants/Colors'
import { ColorTypeMap } from '../../../constants/ColorTypeMap'
import { Config } from '../../../env/Config'

const positions = getPositionOnCircle({ n: 10, radius: 50 })
const competencies = [
  positions[6],
  positions[7],
  positions[8],
  positions[9]
]

/**
 * Represents a selectable stage on the map.
 * Renders a circular progress for the overall completed
 * unitSets linked with this stage.
 * Renders for each linked unitSet (one unitSets per dimension)
 * a Diamond that represents the achieved competencies as filling gauge.
 *
 * @param props {object}
 * @param props.text {string} the label for this stage
 * @param props.onPress {function} function to be called when the stage is selected
 * @param props.unitSets {[object]}
 * @param props.dimensions {[object]}
 * @param props.width {number=}
 * @param props.height {number=}
 * @returns {JSX.Element}
 * @constructor
 */
export const Stage = props => {
  const [diamonds, setDiamonds] = useState([])
  const width = props.width ?? 100
  const height = props.height ?? 100
  const viewBox = `0 0 ${width} ${height}`

  useEffect(() => {
    if (!props.unitSets || !props.dimensions) {
      return
    }

    const diamondData = Config.dimensions.order.map(shortCode => {
      const key = `stage-${props.text}-${shortCode}`
      const unitSet = props.unitSets.find(u => {
        const dimension = props.dimensions[u.dimension]
        return dimension.shortCode === shortCode
      })

      if (unitSet) {
        return {
          color: ColorTypeMap.get(props.dimensions[unitSet.dimension].colorType),
          competencies: Math.round(((unitSet.userCompetencies || 0) / unitSet.competencies) * 100),
          key
        }
      }

      return {
        color: Colors.light,
        competencies: 0,
        key
      }
    })

    setDiamonds(diamondData)
  }, [props.unitSets, props.dimensions])

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
    Vibration.vibrate(100)
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
      onPress={handlePress}
    >
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
          const { color, competencies, key } = diamonds[index] || {
            color: Colors.light,
            competencies: 0,
            key: index
          }
          return (
            <G key={key} x={x - 7.5} y={y}>
              <Diamond width={15} height={30} value={competencies} color={color} />
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
