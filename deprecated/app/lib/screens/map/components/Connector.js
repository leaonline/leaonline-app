import React, { useEffect, useState } from 'react'
import Svg, { G, Path } from 'react-native-svg'
import { Colors } from '../../../constants/Colors'
import { MapIcons } from '../../../contexts/MapIcons'
import { memoize } from '../../../utils/memoize'

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
  const { from, to, width = 100, height = 100 } = props
  const path = usePath(from, to, width, height)

  return (
    <Svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G id='Ebene_1-2' data-name='Ebene 1'>
        <Path
          className='cls-1'
          strokeWidth='2'
          strokeMiterlimit='10'
          stroke={Colors.gray}
          fill={Colors.transparent}
          d={path}
        />
        <ConnectorIcon width={width} from={from} height={height} icon={props.icon} />
      </G>
    </Svg>
  )
}

const ConnectorIcon = React.memo(props => {
  if (typeof props.icon !== 'number') {
    return null
  }
  const { width, from, height, icon } = props
  const fromLeft = from === 'left'
  const part = width / 7
  const offset = fromLeft
    ? part
    : part * -1
  const xPos = width / 2 + offset
  return (
    <G x={xPos} y={height / 4} width={50} height={50}>
      {MapIcons.render(icon)}
    </G>
  )
})

/**
 *
 * @param from
 * @param to
 * @param width
 * @param height
 * @return {string}
 */
const usePath = (from, to, width, height) => {
  const [path, setPath] = useState(null)
  useEffect(() => {
    const p = pathMemo(from, to, width, height)
    setPath(p)
  }, [from, to, width, height])
  return path
}

const [pathMemo] = memoize((...args) => {
  const [from, to, width, height] = args
  const [/* to */, direction = 'up'] = to.split('-')
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

  return execution.join(' ')
})

export const Connector = React.memo(ConnectorComponent)
