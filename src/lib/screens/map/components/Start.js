import React from 'react'
import Svg, { G, Path, Rect } from 'react-native-svg'
import { Colors } from '../../../constants/Colors'

const STROKE_WIDTH = '1'

const MapStartComponent = props => {
  const { size = 50 } = props
  return (
    <Svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 124.59 124.62'>
      <G id='Ebene_1-2' data-name='Ebene 1'>
        <Path
          className='cls-1'
          strokeWidth={STROKE_WIDTH}
          strokeMiterlimit='10'
          stroke={Colors.dark}
          fill={Colors.light}
          d='M122,5.57A3.8,3.8,0,0,0,119,2.65,87,87,0,0,0,99.28,1C74.56,1,59.74,14.22,48.67,31.65h-25A11.49,11.49,0,0,0,13.45,38L1.62,61.66A5.73,5.73,0,0,0,6.77,70H29.54c-1.41,3.06-2.85,6.11-4.31,9A3.82,3.82,0,0,0,26,83.43L41.18,98.66a3.83,3.83,0,0,0,4.43.72c2.92-1.46,6-2.88,9-4.29v22.77A5.75,5.75,0,0,0,63,123l23.63-11.83a11.46,11.46,0,0,0,6.35-10.27v-25c17.39-11.09,30.65-26,30.65-50.56A84.85,84.85,0,0,0,122,5.57Z'
        />
        <Path
          className='cls-1'
          strokeWidth={STROKE_WIDTH}
          strokeMiterlimit='10'
          stroke={Colors.dark}
          fill={Colors.light}
          d='M83.29,3.69S91.83,22.82,97,27.28s25.42,10.13,25.42,10.13'
        />
        <Path
          className='cls-1'
          strokeWidth={STROKE_WIDTH}
          strokeMiterlimit='10'
          stroke={Colors.dark}
          fill={Colors.light}
          d='M33.88,91.36C34,91.45,97,27.28,97,27.28'
        />
        <Rect
          className='cls-1'
          strokeWidth={STROKE_WIDTH}
          strokeMiterlimit='10'
          stroke={Colors.dark}
          fill={Colors.light}
          x='78.8' y='22.64' width='6.65' height='9.28' rx='1.35'
          transform='translate(4.77 66.06) rotate(-45)'
        />
        <Rect
          className='cls-1'
          strokeWidth={STROKE_WIDTH}
          strokeMiterlimit='10'
          stroke={Colors.dark}
          fill={Colors.light}
          x='68.8' y='32.64' width='6.65' height='9.28' rx='1.35'
          transform='translate(-5.23 61.92) rotate(-45)'
        />
        <Rect
          className='cls-1'
          strokeWidth={STROKE_WIDTH}
          strokeMiterlimit='10'
          stroke={Colors.dark}
          fill={Colors.light}
          x='58.8' y='42.64' width='6.65' height='9.28' rx='1.35'
          transform='translate(-15.23 57.77) rotate(-45)'
        />
      </G>
    </Svg>
  )
}

export const MapStart = React.memo(MapStartComponent)
