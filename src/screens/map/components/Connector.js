import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
import Colors from '../../../constants/Colors'
import { Anchor } from '../icons/Anchor'
import { MapIcons } from '../MapIcons'

export const Connector = props => {
  if (props.width === null) {
    return null
  }

  const { from, width = 100, height = 100 } = props
  const [to, direction = 'up'] = props.to.split('-')
  const halfHeight = Math.round(height / 2)

  const startX = from === 'left'
    ? 0
    : width
  const stopX = from === 'left'
    ? width - 1
    : 1
  const endX = from === 'left'
    ? width - 1
    : 1
  const endY = direction === 'up'
    ? 0
    : height

  const execution = [
    `M ${startX} ${halfHeight}`,
    `L ${stopX} ${halfHeight}`,
    `L ${endX} ${endY}`
  ]

  const renderIcon = () => {
    if (typeof props.icon !== 'number') {
      return null
    }

    const part = width / 5
    const offset = from === 'left'
      ? part
      : part * -1
    const xPos = width / 2 + offset
    return (
      <G x={xPos} y={height/4} width={50} height={50}>
        {MapIcons.render(props.icon)}
      </G>
    )
  }

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G id="Ebene_1-2" data-name="Ebene 1">
        <Path className="cls-1"
              strokeWidth="1"
              strokeMiterlimit="10"
              stroke={Colors.gray}
              fill={Colors.transparent}
              d={execution.join(' ')}/>
        {renderIcon()}
      </G>
    </Svg>
  )
}
