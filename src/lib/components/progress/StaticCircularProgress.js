import React from 'react'
import Svg, { G, Circle, Defs, LinearGradient, Stop, Text } from 'react-native-svg'
import Colors from '../../constants/Colors'

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
 * @param props.value {number=0}
 * @param props.maxValue {number=100}
 * @param props.radius {number=60}
 * @param props.text {string=}
 * @param props.textColor {string=Colors.secondary}
 * @param props.fontSize {number=14}
 * @param props.fontWeight {string='normal'}
 * @param props.strokeLinecap {string='round'}
 * @param props.valuePrefix {string=''}
 * @param props.valueSuffix {string=''}
 * @param props.fillColor {string=}
 * @param props.activeStrokeColor {string=Colors.primary}
 * @param props.activeStrokeSecondaryColor {string=Colors.secondary}
 * @param props.activeStrokeWidth {number=10}
 * @param props.inActiveStrokeColor {string='rgba(0,0,0,0.3)'}
 * @param props.inActiveStrokeWidth {number=10}
 * @param props.inActiveStrokeOpacity {number=1}
 * @param props.showProgressValue {boolean=false}
 * @return {JSX.Element}
 * @component
 */
const StaticCircularProgress = (props) => {
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
    // activeStrokeSecondaryColor = Colors.secondary,
    activeStrokeWidth = 10,
    inActiveStrokeColor = Colors.light,
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
        x='50%' y='57%' textAnchor='middle' fontSize={fontSize} fontWeight={fontWeight} fill={textColor}
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
          stroke={inActiveStrokeColor}
          strokeWidth={inActiveStrokeWidth}
          r={radius}
          fill={fillColor}
          strokeOpacity={inActiveStrokeOpacity}
        />
        <Circle
          cx='50%'
          cy='50%'
          stroke={activeStrokeColor}
          strokeWidth={activeStrokeWidth}
          r={radius}
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

export { StaticCircularProgress }
