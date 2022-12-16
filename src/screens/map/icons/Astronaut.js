import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

const STROKE_WIDTH = '1'
export const Astronaut = (props) => {
  return (
    <Svg xmlns='http://www.w3.org/2000/svg' width={props.width} height={props.height} viewBox='0 0 77.19 87.93'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <Path
            className='cls-1'
            strokeWidth={STROKE_WIDTH}
            strokeMiterlimit='10'
            stroke={props.stroke}
            fill={props.fill}
            d='M11.74,38.6H14a26.81,26.81,0,0,0,49.17,0h2.27a2.7,2.7,0,0,0,2.69-2.69V19.8a2.7,2.7,0,0,0-2.69-2.69H63.18a26.81,26.81,0,0,0-49.17,0H11.74A2.69,2.69,0,0,0,9.06,19.8V35.91A2.69,2.69,0,0,0,11.74,38.6Zm6.72-14.77c0-3.71,3.6-6.72,8.05-6.72H50.68c4.45,0,8.06,3,8.06,6.72v4A16.12,16.12,0,0,1,42.62,44h-8A16.12,16.12,0,0,1,18.46,27.85ZM30.54,35.91l2-6,6.05-2-6.05-2-2-6-2,6-6.05,2,6.05,2ZM56,54.94a32,32,0,0,1-34.77,0A22.51,22.51,0,0,0,1,77.27v1.61a8.05,8.05,0,0,0,8.06,8.05H22.48V76.19a5.36,5.36,0,0,1,5.37-5.37H49.34a5.36,5.36,0,0,1,5.37,5.37V86.93H68.14a8.05,8.05,0,0,0,8-8.05V77.27A22.51,22.51,0,0,0,56,54.94ZM46.65,76.19a2.69,2.69,0,1,0,2.69,2.69A2.7,2.7,0,0,0,46.65,76.19Zm-16.11,0a2.7,2.7,0,0,0-2.69,2.69v8.05h5.38V78.88A2.7,2.7,0,0,0,30.54,76.19Z'
          />
        </G>
      </G>
    </Svg>
  )
}
