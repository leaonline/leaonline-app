import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

const STROKE_WIDTH = '1'

export const Anchor = (props) => {
  return (
    <Svg xmlns='http://www.w3.org/2000/svg' width={props.width} height={props.height} viewBox='0 0 95.7 88'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <Path
            className='cls-1'
            strokeWidth={STROKE_WIDTH}
            strokeMiterlimit='10'
            stroke={props.stroke}
            fill={props.fill}
            d='M3,60.13H8.25C11.81,77.38,30.54,87,47.85,87s36.05-9.64,39.6-26.87h5.29a2,2,0,0,0,1.38-3.44L83.18,45.43a1.91,1.91,0,0,0-2.77,0L69.47,56.69a2,2,0,0,0,1.39,3.44h5.73c-3.31,9.12-13.86,14.54-23.52,15.79V44h8.49a2,2,0,0,0,2-2V35.27a2,2,0,0,0-2-2H53.07v-.92a16.09,16.09,0,0,0,10.45-15.2A16,16,0,0,0,48.07,1,15.9,15.9,0,0,0,32.18,17.13a16.09,16.09,0,0,0,10.45,15.2v.92H34.14a2,2,0,0,0-2,2V42a2,2,0,0,0,2,2h8.49V75.92C33,74.68,22.42,69.25,19.11,60.13h5.73a2,2,0,0,0,1.39-3.44L15.29,45.43a1.91,1.91,0,0,0-2.77,0L1.58,56.69A2,2,0,0,0,3,60.13ZM47.85,11.75a5.38,5.38,0,1,1-5.22,5.38A5.3,5.3,0,0,1,47.85,11.75Z'
          />
        </G>
      </G>
    </Svg>
  )
}
