import React, { useCallback, useRef, useState } from 'react'
import { Animated, PixelRatio, Pressable, Vibration } from 'react-native'
import { Svg, G, Path } from 'react-native-svg'
import { createStyleSheet } from '../../../styles/createStyleSheet'

const defaultPosition = { x: 0, y: 0 }

export const ChoiceTextInstructions = props => {
  const handPosition = useRef(new Animated.ValueXY(defaultPosition)).current
  const handAnimation = useRef({ animation: null, running: false })
  const [selected, setSelected] = useState(false)
  const [size, setSize] = useState(0)

  const onContainerLayout = event => {
    const { width } = event.nativeEvent.layout
    setSize(PixelRatio.roundToNearestPixel(width / 5))
  }

  const runAnimation = useCallback(() => {
    if (handAnimation.current.running === false) {
      return
    }

    Vibration.vibrate(100)
    const anim = handAnimation.current.animation ?? Animated.timing(handPosition, {
      toValue: { x: props.width / 2 - 30, y: 0 },
      duration: 1000,
      useNativeDriver: false
    })

    if (handAnimation.current.animation === null) {
      handAnimation.current.animation = anim
    }

    anim.start(() => {
      setSelected(true)
      anim.reset()
      setTimeout(() => {
        endAnimation()
      }, 750)
    })
  }, [])

  const endAnimation = () => {
    handAnimation.current.running = false
    handAnimation.current.animation.stop()
    handAnimation.current.animation.reset()
    setSelected(false)
  }

  const toggleAnimation = () => {
    if (handAnimation.current.running) {
      endAnimation()
    }
    else {
      handAnimation.current.running = true
      runAnimation()
    }
    if (props.onPress) {
      props.onPress({ running: handAnimation.current.running })
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
        <ColorListImg width={size} height={size} selected={selected} />
      </Animated.View>
    </Pressable>
  )
}

const ColorListImg = props => {
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 35.83 30'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <Path
            id='Pfad_181' data-name='Pfad 181' fill='#183b5d'
            d='M3.52,23.08A3.46,3.46,0,0,0,3.4,30h.12a3.46,3.46,0,0,0,0-6.92Zm31.15,1.15H13.91a1.16,1.16,0,0,0-1.16,1.15v2.31a1.16,1.16,0,0,0,1.16,1.16H34.67a1.16,1.16,0,0,0,1.16-1.16V25.38A1.16,1.16,0,0,0,34.67,24.23Zm0-11.54H13.91a1.16,1.16,0,0,0-1.16,1.16v2.3a1.16,1.16,0,0,0,1.16,1.16H34.67a1.16,1.16,0,0,0,1.16-1.16v-2.3A1.16,1.16,0,0,0,34.67,12.69ZM3.52,11.54a3.46,3.46,0,0,0-.12,6.92h.12a3.46,3.46,0,0,0,0-6.92Z'
          />
          <Path
            id='Pfad_183' data-name='Pfad 183' fill={props.selected ? '#5bb984' : '#183b5d'}
            d='M34.67,1.15H13.91a1.16,1.16,0,0,0-1.16,1.16V4.62a1.16,1.16,0,0,0,1.16,1.15H34.67a1.16,1.16,0,0,0,1.16-1.15V2.31A1.16,1.16,0,0,0,34.67,1.15ZM3.52,0A3.46,3.46,0,0,0,3.4,6.92h.12A3.46,3.46,0,0,0,3.52,0Z'
          />
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
