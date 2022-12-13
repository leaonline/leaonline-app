import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
import Colors from '../../../constants/Colors'

export const MapFinish = () => {
  return (
    <Svg width={100} height={100} viewBox='0 0 220 217'>
      <G>
        <G>
          <Path
            fill={Colors.primary}
            d='M105.19,67.44,93.92,90.3,68.69,94a5.53,5.53,0,0,0-3.06,9.43l18.25,17.78-4.32,25.13a5.53,5.53,0,0,0,8,5.82l22.57-11.87,22.57,11.87a5.53,5.53,0,0,0,8-5.82l-4.32-25.13,18.25-17.78a5.52,5.52,0,0,0,.1-7.82A5.45,5.45,0,0,0,151.61,94L126.38,90.3,115.1,67.44a5.52,5.52,0,0,0-9.91,0Z'
          />
        </G>
      </G>
    </Svg>
  )
}
