import React, { useCallback, useEffect, useReducer, useRef } from 'react'
import { Animated, PixelRatio, Pressable, Vibration } from 'react-native'
import { Svg, G, Path, Line } from 'react-native-svg'
import { createStyleSheet } from '../../../styles/createStyleSheet'

const defaultPosition = { x: 0, y: 0 }
const initialState = () => ({
  leftSelected: false,
  rightSelected: false,
  size: 0
})

const reducer = (prev, next) => {
  switch (next.type) {
    case 'layout':
      return { ...prev, size: next.size }
    case 'left':
      return { ...prev, leftSelected: true }
    case 'right':
      return { ...prev, rightSelected: true }
    case 'reset':
      return { ...prev, leftSelected: false, rightSelected: false }
  }
}

export const ConnectInstructions = props => {
  const handPosition = useRef(new Animated.ValueXY(defaultPosition)).current
  const handAnimation = useRef({ animation: null, running: false })
  const [state, dispatch] = useReducer(reducer, initialState(), undefined)
  const { leftSelected, rightSelected, size } = state

  const onContainerLayout = event => {
    const { width } = event.nativeEvent.layout
    dispatch({ type: 'layout', size: PixelRatio.roundToNearestPixel(width / 5) })
  }

  useEffect(() => {
    const listenerId = handPosition.addListener(value => {
      if (value.x === 0) {
        dispatch({ type: 'reset' })
      }
      if (value.x === props.width / 2 - 30 && !leftSelected) {
        dispatch({ type: 'left' })
      }
      if (value.x === props.width - 50 && !rightSelected) {
        dispatch({ type: 'right' })
      }
    })

    return () => handPosition.removeListener(listenerId)
  }, [])

  const runAnimation = useCallback(() => {
    if (handAnimation.current.running === false) {
      return
    }

    Vibration.vibrate(100)
    const toLeftElement = Animated.timing(handPosition, {
      toValue: { x: props.width / 2 - 30, y: 0 },
      duration: 1000,
      useNativeDriver: false
    })

    const toRightElement = Animated.timing(handPosition, {
      toValue: { x: props.width - 50, y: 30 },
      duration: 1000,
      useNativeDriver: false
    })

    const backToStart = Animated.timing(handPosition, {
      toValue: { x: 0, y: 0 },
      duration: 1000,
      useNativeDriver: false
    })

    const anim = handAnimation.current.animation ?? Animated.sequence([
      toLeftElement,
      Animated.delay(500),
      toRightElement,
      Animated.delay(500),
      backToStart
    ])

    if (handAnimation.current.animation === null) {
      handAnimation.current.animation = anim
    }

    anim.start(() => {
      endAnimation()
    })
  }, [])

  const endAnimation = () => {
    handAnimation.current.animation.stop()
    handAnimation.current.animation.reset()
    handAnimation.current.running = false
    dispatch({ type: 'reset' })
  }

  const toggleAnimation = () => {
    if (handAnimation.current.running) {
      endAnimation()
    }
    else {
      handAnimation.current.running = true
      runAnimation()
    }
  }

  return (
    <Pressable
      onLayout={onContainerLayout}
      accessibilityRole='button'
      onPress={toggleAnimation}
      style={styles.container}
    >
      <Animated.View
        style={[
          handPosition.getLayout(),
          styles.svgContainer
        ]}
        direction='alternate'
        easing='linear'
        iterationCount='infinite'
        useNativeDriver
      >
        <HandMove width={size} height={size} />
      </Animated.View>
      <Animated.View
        style={[
          {
            left: props.width / 2 - 30,
            top: 0
          },
          styles.svgContainer
        ]}
        direction='alternate'
        easing='linear'
        iterationCount='infinite'
        useNativeDriver
      >
        <ConnectionImage
          width={size}
          height={size}
          leftSelected={leftSelected}
          rightSelected={rightSelected}
        />
      </Animated.View>
    </Pressable>
  )
}

const ConnectionImage = props => {
  const bothSelected = props.leftSelected && props.rightSelected
  const noneSelected = !props.leftSelected && !props.rightSelected

  const renderLeft = () => {
    if (noneSelected) {
      return (
        <G id='Gruppe_315' data-name='Gruppe 315'>
          <Path
            id='Pfad_175-3' data-name='Pfad 175-3' fill='#183b5d'
            d='M22.31,9.72H2.24A2.25,2.25,0,0,1,0,7.48V2.24A2.23,2.23,0,0,1,2.24,0H22.31a2.23,2.23,0,0,1,2.24,2.23V7.48A2.25,2.25,0,0,1,22.31,9.72ZM2.24.62A1.62,1.62,0,0,0,.62,2.24V7.48A1.61,1.61,0,0,0,2.24,9.1H22.31a1.61,1.61,0,0,0,1.62-1.62V2.24A1.62,1.62,0,0,0,22.31.62Z'
          />
        </G>
      )
    }
    return (
      <G id='Gruppe_315' data-name='Gruppe 315'>
        <Path
          id='Pfad_175-3' data-name='Pfad 175-3' fill={bothSelected ? '#5bb984' : '#183b5d'}
          d='M22.31,9.71H2.24A2.24,2.24,0,0,1,0,7.47V2.24A2.24,2.24,0,0,1,2.24,0H22.31a2.24,2.24,0,0,1,2.24,2.24V7.47A2.24,2.24,0,0,1,22.31,9.71Z'
        />
      </G>
    )
  }
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 76.15 37.72'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          {renderLeft()}
          <G id='Gruppe_316' data-name='Gruppe 316'>
            <Path
              id='Pfad_175-4' data-name='Pfad 175-4' fill='#183b5d'
              d='M73.92,9.71H53.84A2.25,2.25,0,0,1,51.6,7.47V2.24A2.25,2.25,0,0,1,53.84,0H73.92a2.23,2.23,0,0,1,2.23,2.24V7.47A2.23,2.23,0,0,1,73.92,9.71ZM53.84.62a1.62,1.62,0,0,0-1.62,1.62V7.47A1.63,1.63,0,0,0,53.84,9.1H73.92a1.63,1.63,0,0,0,1.62-1.63V2.24A1.62,1.62,0,0,0,73.92.62Z'
            />
          </G>
          <G id='Gruppe_317' data-name='Gruppe 317'>
            <Path
              id='Pfad_175-5' data-name='Pfad 175-5' fill='#183b5d'
              d='M22.31,23.72H2.24A2.25,2.25,0,0,1,0,21.48V16.24A2.23,2.23,0,0,1,2.24,14H22.31a2.23,2.23,0,0,1,2.24,2.23v5.24A2.25,2.25,0,0,1,22.31,23.72ZM2.24,14.62A1.62,1.62,0,0,0,.62,16.24v5.24A1.61,1.61,0,0,0,2.24,23.1H22.31a1.61,1.61,0,0,0,1.62-1.62V16.24a1.62,1.62,0,0,0-1.62-1.62Z'
            />
          </G>
          <G id='Gruppe_318' data-name='Gruppe 318'>
            <Path
              id='Pfad_175-6' data-name='Pfad 175-6' fill='#183b5d'
              d='M73.92,23.72H53.84a2.26,2.26,0,0,1-2.24-2.24V16.24A2.25,2.25,0,0,1,53.84,14H73.92a2.23,2.23,0,0,1,2.23,2.23v5.24A2.25,2.25,0,0,1,73.92,23.72Zm-20.08-9.1a1.63,1.63,0,0,0-1.62,1.62v5.24a1.62,1.62,0,0,0,1.62,1.62H73.92a1.62,1.62,0,0,0,1.62-1.62V16.24a1.63,1.63,0,0,0-1.62-1.62Z'
            />
          </G>
          <G id='Gruppe_319' data-name='Gruppe 319'>
            <Path
              id='Pfad_175-7' data-name='Pfad 175-7' fill='#183b5d'
              d='M22.31,37.72H2.24A2.23,2.23,0,0,1,0,35.49V30.25A2.25,2.25,0,0,1,2.24,28H22.31a2.25,2.25,0,0,1,2.24,2.24v5.24A2.23,2.23,0,0,1,22.31,37.72ZM2.24,28.63A1.62,1.62,0,0,0,.62,30.25v5.24a1.62,1.62,0,0,0,1.62,1.62H22.31a1.62,1.62,0,0,0,1.62-1.62V30.25a1.62,1.62,0,0,0-1.62-1.62Z'
            />
          </G>
          {
            props.rightSelected
              ? (
                <G id='Gruppe_320' data-name='Gruppe 320'>
                  <Path
                    id='Pfad_175-8' data-name='Pfad 175-8' fill='#5bb984'
                    d='M 73.92,37.72 H 53.85 a 2.24,2.24 0 0 1 -2.24,-2.24 v -5.23 a 2.24,2.24 0 0 1 2.24,-2.24 h 20.07 a 2.24,2.24 0 0 1 2.24,2.24 v 5.23 a 2.24,2.24 0 0 1 -2.24,2.24 z'
                  />
                </G>
                )
              : (
                <G id='Gruppe_320' data-name='Gruppe 320'>
                  <Path
                    id='Pfad_175-8' data-name='Pfad 175-8' fill='#183b5d'
                    d='M73.92,37.72H53.84a2.25,2.25,0,0,1-2.24-2.23V30.25A2.26,2.26,0,0,1,53.84,28H73.92a2.25,2.25,0,0,1,2.23,2.24v5.24A2.23,2.23,0,0,1,73.92,37.72ZM53.84,28.63a1.63,1.63,0,0,0-1.62,1.62v5.24a1.63,1.63,0,0,0,1.62,1.62H73.92a1.63,1.63,0,0,0,1.62-1.62V30.25a1.63,1.63,0,0,0-1.62-1.62Z'
                  />
                </G>
                )
          }
          {
            props.leftSelected && props.rightSelected && (
              <G>
                <Line
                  id='Linie_17' data-name='Linie 17'
                  strokeWidth='3'
                  stroke='#5bb984' x1='25' y1='5' x2='50' y2='30'
                />
              </G>
            )
          }
        </G>
      </G>
    </Svg>
  )
}
const HandMove = props => {
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36.9 32.14'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <G id='Gruppe_282' data-name='Gruppe 282'>
            <Path
              id='Pfad_171-4' data-name='Pfad 171-4' fill='#183b5d'
              d='M32.43,2.28a3.48,3.48,0,0,1,4.31,2,3.42,3.42,0,0,1-2.1,4.26l-7.15,2.51a3.74,3.74,0,0,1,1.42,5.08l-.09.16a3.47,3.47,0,0,1,.39,4.87c1.88,3.29.22,5.65-3.41,6.93l-1.15.39c-4.43,1.57-6.28-.29-9.82.36a1.81,1.81,0,0,1-2-1.19L8.48,15.39h0a3.63,3.63,0,0,1,.93-3.86c1.74-1.65,5.6-5.91,5.75-8.24A3.23,3.23,0,0,1,17.3.21a3.63,3.63,0,0,1,4.64,2.23,3.75,3.75,0,0,1,.2,1.45A11,11,0,0,1,21.75,6L32.43,2.27ZM7,14.77,11.8,28.51a1.83,1.83,0,0,1-1.12,2.32L7.25,32a1.82,1.82,0,0,1-2.32-1.12L.1,17.18a1.83,1.83,0,0,1,1.12-2.32l3.43-1.21A1.82,1.82,0,0,1,7,14.77ZM9.19,27.5a1.52,1.52,0,1,0-.93,1.93h0a1.51,1.51,0,0,0,.93-1.93Z'
            />
          </G>
        </G>
      </G>
    </Svg>
  )
}

const styles = createStyleSheet({
  container: {
    borderColor: '#00f',
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  svgContainer: {
    flex: 0,
    justifyContent: 'center',
    alignSelf: 'center'
  }
})
