import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
import { Colors } from '../../../constants/Colors'
import { MapIcons } from '../../../contexts/MapIcons'

/**
 * A connector renders an SVG-based, L-shaped line from one
 * side (left, right) to the opposite and takes a curve
 * either up or down.
 *
 * Additionally, it can render dynamic icons, based on args.
 *
 * @param props {object}
 * @param props.to {string} the target direction to draw
 * @param props.width {number=}
 * @param props.width {height=}
 * @param props.icon {number=} optional icon index to be used with {MapIcons}
 * @returns {JSX.Element|null}
 * @component
 */
const ConnectorComponent = props => {
  // TODO put in effect + state
  const { from, width = 100, height = 100 } = props
  const [/* to */, direction = 'up'] = props.to.split('-')
  const halfHeight = Math.round(height / 2)
  const fromLeft = from === 'left'
  const startX = fromLeft
    ? 0
    : width
  const stopX = fromLeft
    ? width - 1
    : 1
  const endX = fromLeft
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

    const part = width / 7
    const offset = fromLeft
      ? part
      : part * -1
    const xPos = width / 2 + offset
    return (
      <G x={xPos} y={height / 4} width={50} height={50}>
        {MapIcons.render(props.icon)}
      </G>
    )
  }

  return (
    <Svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G id='Ebene_1-2' data-name='Ebene 1'>
        <Path
          className='cls-1'
          strokeWidth='2'
          strokeMiterlimit='10'
          stroke={Colors.gray}
          fill={Colors.transparent}
          d={execution.join(' ')}
        />
        {renderIcon()}
      </G>
    </Svg>
  )
}

export const Connector = React.memo(ConnectorComponent)
