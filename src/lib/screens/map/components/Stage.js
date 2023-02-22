import React, { useEffect, useState } from 'react'
import Svg, { G } from 'react-native-svg'
import { StaticCircularProgress } from '../../../components/progress/StaticCircularProgress'
import { Diamond } from '../../../components/progress/Diamond'
import { getPositionOnCircle } from '../../../utils/trigonometry/getPositionOnCircle'
import { Pressable, Vibration } from 'react-native'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Colors } from '../../../constants/Colors'
import { ColorTypeMap } from '../../../constants/ColorTypeMap'
import { Config } from '../../../env/Config'
import { Loading } from '../../../components/Loading'

const MemoDiamond = React.memo(Diamond)
const positions = getPositionOnCircle({ n: 10, radius: 50 })
const competencies = [
  positions[6],
  positions[7],
  positions[8],
  positions[9]
]

/**
 * Represents a selectable stage on the map.
 * Renders circular progress for the overall completed
 * unitSets linked with this stage.
 * Renders for each linked unitSet (one unitSets per dimension)
 * a Diamond that represents the achieved competencies as filling gauge.
 *
 * @param props {object}
 * @param props.text {string} the label for this stage
 * @param props.onPress {function} function to be called when the stage is selected
 * @param props.unitSets {Array<Object>}
 * @param props.dimensions {Array<Object>}
 * @param props.width {number=}
 * @param props.height {number=}
 * @param props.isActive {boolean=}
 * @returns {JSX.Element}
 * @component
 */
export const Stage = props => {
  const [diamonds, setDiamonds] = useState([])
  const [pressed, setPressed] = useState(false)
  const width = props.width ?? 100
  const height = props.height ?? 100
  const viewBox = `0 0 ${width} ${height}`

  useEffect(() => {
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
    setPressed(false)
  }, [props.unitSets, props.dimensions])

  if (pressed) {
    return (<Loading style={{ width, height }} />)
  }

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

  const handlePress = async () => {
    setPressed(true)
    Vibration.vibrate(100)
    if (props.onPress) {
      await props.onPress()
      setPressed(false)
    }
  }

  return (
    <Pressable
      accessibilityRole='button'
      android_ripple={rippleConfig}
      android_disableSound={false}
      style={styles.container}
      pressRetentionOffset={0}
      hitSlop={0}
      onPress={handlePress}
    >
      <StageContent
        width={width}
        height={height}
        viewBox={viewBox}
        stageProgress={stageProgress}
        text={text}
        inverted={props.isActive}
        progress={progress}
        competencies={competencies}
        diamonds={diamonds}
      />
    </Pressable>
  )
}

const RenderStageContent = ({ width, height, viewBox, stageProgress, text, progress, competencies, diamonds, inverted }) => {
  const textColor = inverted ? Colors.white : Colors.secondary
  const fillColor = inverted ? Colors.secondary : Colors.white
  const activeStrokeColor = inverted ? Colors.white : Colors.secondary
  const inActiveStrokeColor = inverted ? Colors.secondary : Colors.white

  return (
    <Svg width={width} height={height} viewBox={viewBox}>
      <G x={stageProgress.x} y={stageProgress.y}>
        <StaticCircularProgress
          text={text}
          radius={stageProgress.radius}
          maxValue={100}
          textColor={textColor}
          fillColor={fillColor}
          activeStrokeColor={activeStrokeColor}
          inActiveStrokeColor={inActiveStrokeColor}
          inActiveStrokeOpacity={1}
          inActiveStrokeWidth={4}
          activeStrokeWidth={4}
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
              <MemoDiamond width={15} height={30} value={competencies} color={color} />
            </G>
          )
        })
      }
    </Svg>
  )
}
const StageContent = React.memo(RenderStageContent)

const styles = createStyleSheet({
  container: {}
})
