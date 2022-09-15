import React, { useEffect, useRef } from 'react'
import { StyleSheet, View, TextInput } from 'react-native'
import PropTypes from 'prop-types'
import Svg, {Path,G, Rect, Circle, Defs, LinearGradient, Stop, Text } from 'react-native-svg'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'


const StaticCircularProgress = (props) => {
  const {
    value = 0,
    maxValue = 100,
    radius = 60,
    textColor = Colors.secondary,
    textStyle = {},
    fontSize = 12,
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

  const styleProps = {
    radius,
    textColor,
    fontSize,
    textStyle,
    activeStrokeColor
  }

  const half = radius + Math.max(activeStrokeWidth, inActiveStrokeWidth)
  const circumference = 2 * Math.PI * radius
  const textValue = `${valuePrefix}${Math.round(value)}${valueSuffix}`
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
        <Text x="50%" y="50%" text-anchor="middle" fontWeight="bold" fill="black" alignment-baseline="middle">
          {textValue}
        </Text>
      </Svg>
    </View>
  )
}

export const dynamicStyles = (props) => {
  return createStyleSheet({
    fromProps: {
      fontSize: props.fontSize ?? props.radius / 2,
      color: props.textColor ? props.textColor : (props.textStyle && props.textStyle?.color) ? props.textStyle?.color : props.activeStrokeColor
    },
    input: {
      fontWeight: '900',
      textAlign: 'center'
    }
  })
}

export { StaticCircularProgress }
