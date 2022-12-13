import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
import Colors from '../../../constants/Colors'

const STROKE_WIDTH = "1"

export const Wrench = () => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 85.88 85.88">
      <G id="Ebene_2" data-name="Ebene 2">
        <G id="Ebene_1-2" data-name="Ebene 1">
          <Path className="cls-1"
                strokeWidth={STROKE_WIDTH}
                strokeMiterlimit="10"
                stroke={Colors.secondary}
                fill={Colors.light}
                d="M84.18,18.87a2,2,0,0,0-3.29-.9L68.7,30.15,57.58,28.3,55.73,17.18,67.91,5A2,2,0,0,0,67,1.69,23.48,23.48,0,0,0,39,32l-35,35A10.49,10.49,0,1,0,18.9,81.81L53.83,46.88a23.51,23.51,0,0,0,30.35-28ZM11.49,78.33a3.94,3.94,0,1,1,3.93-3.93A3.93,3.93,0,0,1,11.49,78.33Z"/>
        </G>
      </G>
    </Svg>
  )
}