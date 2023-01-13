import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Svg, Path } from 'react-native-svg'

const RATIO = 576 / 512 // 1,125

/**
 * Icon: Font Awesome 5.1.4 volume-up
 * Licensed under Font Awesome's license
 * https://fontawesome.com/v5/icons/volume-up?s=solid&f=classic
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export const SoundIcon = props => {
  const width = props.size * RATIO
  const height = props.size
  const animating = useRef(false) // prevents re
  const [count, setCount] = useState(3)
  const [intervalId, setIntervalId] = useState(-1)

  const startAnimation = () => {
    const newIntervalId = setInterval(() => {
      setCount(oldCount => oldCount === 3 ? 0 : oldCount + 1)
    }, 250)
    setIntervalId(newIntervalId)
  }

  // we don't use animated api here
  // to sync the counter with the
  // array indexes and render the
  // elements
  useEffect(() => {
    if (props.animated && !animating.current) {
      animating.current = true
      startAnimation()
    }
    else if (animating.current && !props.animated) {
      animating.current = false
      clearInterval(intervalId)
      setIntervalId(-1)
      setCount(3)
    }
  }, [props.animated])

  const renderVolume = () => {
    return [
      (<Path key={0}
             d="m 338.23,179.12043 c -11.58,-6.33 -26.19,-2.16 -32.61,9.45001 -6.39,11.61 -2.16,26.2 9.45,32.61 12.91,7.09 20.93,20.44 20.93,34.81 0,14.38 -8.02,27.71999 -20.92,34.80999 -11.61,6.41 -15.84,21 -9.45,32.61 6.43,11.66 21.05,15.8 32.61,9.45 28.23,-15.55 45.77,-45 45.77,-76.87999 0,-31.88 -17.54,-61.32 -45.78,-76.86001 z"
             fill={props.color}
             id="volume-low"/>),
      (<Path key={1}
             d="m 480,255.98922 c 0,-63.52999 -32.06002,-121.93999 -85.77002,-156.239981 -11.19,-7.14 -26.03,-3.82 -33.12,7.459991 -7.09,11.28 -3.78,26.21 7.41,33.36 39.75,25.39 63.48,68.52999 63.48,115.41999 0,46.89 -23.73,90.03 -63.48,115.42 -11.19,7.14 -14.5,22.07 -7.41,33.36 6.51,10.36 21.12,15.14 33.12,7.46 53.71,-34.3 85.77002,-92.7 85.77002,-156.24 z"
             fill={props.color}
             id="volume-med"/>),
      (<Path key={2}
             d="m 448.35,19.963358 c -11.17,-7.33 -26.18,-4.24 -33.51,6.95 -7.34,11.17 -4.22,26.18 6.95,33.51 66.27,43.490002 105.82,116.599992 105.82,195.579992 0,78.98 -39.55,152.09 -105.82,195.58 -11.17,7.32 -14.29,22.34 -6.95,33.5 7.04,10.71 21.93,14.56 33.51,6.95 79.92,-52.46 127.65,-140.71 127.65,-236.04 0,-95.33 -47.73,-183.569984 -127.65,-236.029992 z"
             fill={props.color}
             id="volume-high"/>)
    ].slice(0, count)
  }

  return (
    <Svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512">
      {renderVolume()}
      <Path
        d="M 215.03,71.047688 126.06,159.99768 H 24 c -13.26,0 -24,10.74 -24,24 v 144 c 0,13.25 10.74,24 24,24 h 102.06 l 88.97,88.95 c 15.03,15.03 40.97,4.47 40.97,-16.97 V 88.017688 c 0,-21.46 -25.96,-31.98 -40.97,-16.97 z"
        fill={props.color}
        id="speaker"/>
    </Svg>
  )
}
