import React from 'react'
import { View } from 'react-native'
import Svg, { G, Circle, Defs, LinearGradient, Stop, Text } from 'react-native-svg'
import Colors from '../constants/Colors'

const StaticCircularProgress = (props) => {
  const {
    value = 0,
    maxValue = 100,
    radius = 60,
    textColor = Colors.secondary,
    fontSize = 14,
    fontWeight = 'normal',
    strokeLinecap = 'round',
    valuePrefix = '',
    valueSuffix = '',
    activeStrokeColor = '#2ecc71',
    activeStrokeSecondaryColor = Colors.secondary,
    activeStrokeWidth = 10,
    inActiveStrokeColor = 'rgba(0,0,0,0.3)',
    inActiveStrokeWidth = 10,
    inActiveStrokeOpacity = 1,
    showProgressValue = true
  } = props

  const half = radius + Math.max(activeStrokeWidth, inActiveStrokeWidth)
  const circumference = 2 * Math.PI * radius
  const maxPercent = (100 * value) / maxValue
  const strokeDashoffset = circumference - (circumference * maxPercent) / 100

  const renderSecondaryStroke = () => {
    return (
      <Defs>
        <LinearGradient id='grad' x1='0%' y1='0%' x2='0%' y2='100%'>
          <Stop offset='0%' stopColor={activeStrokeColor} />
          <Stop offset='100%' stopColor={activeStrokeColor} />
        </LinearGradient>
      </Defs>
    )
  }

  const renderTextValue = () => {
    if (!showProgressValue) { return null }
    const textValue = `${valuePrefix}${Math.round(value)}${valueSuffix}`

    return (
      <Text x='50%' y='50%' text-anchor='middle' fontSize={fontSize} fontWeight={fontWeight} fill={textColor || 'black'} alignment-baseline='middle'>
        {textValue}
      </Text>
    )
  }

  return (
    <View>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${half * 2} ${half * 2}`}
      >
        {renderSecondaryStroke()}
        <G rotation='-90' origin={`${half}, ${half}`}>
          <Circle
            cx='50%'
            cy='50%'
            stroke={inActiveStrokeColor}
            strokeWidth={inActiveStrokeWidth}
            r={radius}
            fill='transparent'
            strokeOpacity={inActiveStrokeOpacity}
          />
          <Circle
            cx='50%'
            cy='50%'
            stroke={activeStrokeSecondaryColor ? 'url(#grad)' : activeStrokeColor}
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
    </View>
  )
}

export { StaticCircularProgress }
