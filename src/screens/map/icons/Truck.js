import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

const STROKE_WIDTH = "1"


export const Truck = (props) => {
  return  (
    <Svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height}  viewBox="0 0 106.86 75.4">
      <G id="Ebene_2" data-name="Ebene 2">
        <G id="Ebene_1-2" data-name="Ebene 1">
          <Path className="cls-1"
                strokeWidth={STROKE_WIDTH}
                strokeMiterlimit="10"
                stroke={props.stroke}
                fill={props.fill}
                d="M103.24,42.94h-2.62V32.46a5.25,5.25,0,0,0-5.25-5.25H87.51L69.69,4.94A10.49,10.49,0,0,0,61.5,1H42.94A5.25,5.25,0,0,0,37.7,6.24v21H11.49a5.25,5.25,0,0,0-5.25,5.25V42.94H3.62A2.62,2.62,0,0,0,1,45.57v5.24a2.62,2.62,0,0,0,2.62,2.62h8.13a18.75,18.75,0,0,0-.26,2.62,18.35,18.35,0,0,0,36.7,0,17.36,17.36,0,0,0-.27-2.62h11a17.36,17.36,0,0,0-.27,2.62,18.36,18.36,0,0,0,36.71,0,17.36,17.36,0,0,0-.27-2.62h8.13a2.62,2.62,0,0,0,2.62-2.62V45.57A2.62,2.62,0,0,0,103.24,42.94Zm-55-31.45H61.5L74.08,27.21H48.19ZM29.84,63.92a7.87,7.87,0,1,1,7.86-7.87A7.88,7.88,0,0,1,29.84,63.92Zm47.18,0a7.87,7.87,0,1,1,7.87-7.87A7.88,7.88,0,0,1,77,63.92Z"/>
        </G>
      </G>
    </Svg>
  )
}
