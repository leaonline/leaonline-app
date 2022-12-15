import React from 'react'
import Svg, {
  Defs,
  G, Mask,
  Path,
  Polygon,
  Polyline, Rect
} from 'react-native-svg'
import { correctDiamondProgress } from './correctDiamondProgress'

/**
 * The Diamond visually represents a percent value of
 * achieved competencies within a given dimensions.
 * However, it's pure in the way, that it has no understanding
 * of "dimension" or "competency" and renders simply only
 * the given percentage value as filling.
 *
 * @param props {object}
 * @param props.color {string} the color of the outline and filling
 * @param props.color {number} the percentage value (0..100) to determine the filling height
 * @param props.width {number=30} the width of the container
 * @param props.height {number=45} the height of the container
 * @return {JSX.Element}
 * @constructor
 */
export const Diamond = props => {
  const width = props.width ?? 30
  const height = props.height ?? 45
  const mainColor = props.color

  // the inner values are used for viewbox and mask
  // and are required to be independent from width and height
  // in order to correctly compute the mask even with different
  // width and height props, which makes the diamond scalable
  const innerWidth = 28.29
  const innerHeight = 44.54
  const viewBox = `0 0 ${innerWidth} ${innerHeight}`

  const borderWidth = 5
  const percent = props.precise
    ? props.value / 100
    : correctDiamondProgress(props.value / 100)
  const maskHeight = (innerHeight * percent)

  return (
    <Svg height={height} width={width} viewBox={viewBox}>
      <Defs>
        <Mask
          id='diamond-mask'
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width={innerWidth}
          height={innerHeight}
        >
          <Rect x='0' y={innerHeight - borderWidth} width={innerWidth} height={-maskHeight + borderWidth} fill='white' />
        </Mask>
      </Defs>
      <G>
        <G>
          <Path
            fill={mainColor}
            d='M 14.15,40.81 2.37,22.27 14.15,3.73 25.92,22.27 Z'
            mask='url(#diamond-mask)'
          />
          <G>
            <G>
              <Polyline fill='rgba(0,0,0, 0.07)' points='14.14 44.54 28.29 22.27 0 22.27' />
              <Polygon fill='rgba(0,0,0, 0.07)' points='17.16 22.27 14.14 0 28.29 22.27 17.16 22.27' />
              <Polygon fill='rgba(0,0,0, 0.07)' points='17.16 22.27 14.14 44.54 28.29 22.27 17.16 22.27' />
            </G>
          </G>
          <Path
            stroke={mainColor}
            fill={mainColor}
            d='M14.15,3.73,25.92,22.27,14.15,40.81,2.37,22.27,14.15,3.73m0-3.73L0,22.27,14.15,44.54,28.29,22.27Z'
          />
        </G>
      </G>
    </Svg>
  )
}

