import React from 'react'
import Svg, { G, Circle, Defs, LinearGradient, Stop, Text } from 'react-native-svg'
import { Colors } from '../../constants/Colors'

/**
 * Renders a circular progress, where the value determines the
 * filling of the borders.
 *
 * Additionally, it can render the given value with- or without
 * a percent character within the circle.
 *
 * If a `text` prop is passed, then it will favour this over
 * the percentage value.
 *
 * @param props
 * @param {number} [props.value=0]
 * @param {number} [props.maxValue=100]
 * @param {number} [props.radius=60]
 * @param props.text {string=}
 * @param {string} [props.textColor=Colors.secondary]
 * @param {number} [props.fontSize=14]
 * @param {string} [props.fontWeight='normal']
 * @param {string} [props.strokeLinecap='round']
 * @param {string} [props.valuePrefix='']
 * @param {string} [props.valueSuffix='']
 * @param {string} [props.fillColor=Colors.transparent]
 * @param {string} [props.activeStrokeColor=Colors.primary]
 * @param {string} [props.activeStrokeSecondaryColor=Colors.secondary]
 * @param {number} [props.activeStrokeWidth=10]
 * @param {number} [props.inActiveStrokeWidth=10]
 * @param {number} [props.inActiveStrokeOpacity=1]
 * @param {boolean} [props.showProgressValue=false]
 * @return {JSX.Element}
 * @component
 */
const CircularProgress = (props) => {
  const {
    value = 0,
    maxValue = 100,
    radius = 60,
    text,
    textColor = Colors.secondary,
    fontSize = 20,
    fontWeight = 'bold',
    strokeLinecap = 'round',
    valuePrefix = '',
    valueSuffix = '',
    fillColor = Colors.transparent,
    activeStrokeColor = Colors.primary,
    activeStrokeWidth = 10,
    inActiveStrokeWidth = 10,
    inActiveStrokeOpacity = 1,
    showProgressValue = false
  } = props

  const half = radius + Math.max(activeStrokeWidth, inActiveStrokeWidth)
  const circumference = 2 * Math.PI * radius
  const maxPercent = (100 * value) / maxValue
  const strokeDashoffset = circumference - (circumference * maxPercent) / 100
  const renderTextValue = () => {
    if (!showProgressValue && !text) { return null }
    const textValue = showProgressValue || !text
      ? `${valuePrefix}${Math.round(value)}${valueSuffix}`
      : text

    return (
      <Text
        x='49%' y='52%' textAnchor='middle' fontSize={fontSize} fontWeight={fontWeight} fill={textColor}
        alignmentBaseline='middle'
      >
        {textValue}
      </Text>
    )
  }

  return (
    <Svg
      style={props.style}
      width={radius * 2}
      height={radius * 2}
      viewBox={`0 0 ${half * 2} ${half * 2}`}
    >
      <Defs>
        <LinearGradient id='grad' x1='0%' y1='0%' x2='0%' y2='100%'>
          <Stop offset='0%' stopColor={activeStrokeColor} />
          <Stop offset='100%' stopColor={activeStrokeColor} />
        </LinearGradient>
      </Defs>
      <G rotation='-90' origin={`${half}, ${half}`}>
        <Circle
          cx='50%'
          cy='50%'
          stroke={Colors.gray}
          strokeWidth={0.5}
          r={radius}
          fill={fillColor}
          strokeOpacity={inActiveStrokeOpacity}
        />
        <Circle
          cx='50%'
          cy='50%'
          stroke={activeStrokeColor}
          strokeWidth={activeStrokeWidth}
          r={radius - activeStrokeWidth / 2}
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap={strokeLinecap}
        />
      </G>
      {renderTextValue()}
    </Svg>
  )
}

export const StaticCircularProgress = React.memo(CircularProgress)
