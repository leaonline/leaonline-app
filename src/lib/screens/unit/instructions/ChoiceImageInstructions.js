import React, { useCallback, useRef, useState } from 'react'
import { Animated, PixelRatio, Pressable } from 'react-native'
import { Svg, G, Path } from 'react-native-svg'
import { createStyleSheet } from '../../../styles/createStyleSheet'

const defaultPosition = { x: 0, y: 0 }

/**
 *
 * @param props
 * @return {Element}
 * @constructor
 */
export const ChoiceImageInstructions = props => {
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
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 46.58 52.34'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <Path id='Pfad_163' data-name='Pfad 163' fill={props.selected ? '#5bb984' : '#183b5d'} d='M16.18,0H.85C.38,0,0,1.76,0,3.94v7.87c0,2.18.38,3.94.85,3.94H16.18c.47,0,.85-1.76.85-3.94V3.94C17,1.76,16.65,0,16.18,0Z' />
          <Path id='Pfad_164' data-name='Pfad 164' fill='#183b5d' d='M45.73,0H30.41c-.47,0-.85,1.76-.85,3.94v7.87c0,2.18.38,3.94.85,3.94H45.73c.47,0,.85-1.76.85-3.94V3.94C46.58,1.76,46.2,0,45.73,0Z' />
          <Path id='Pfad_165' data-name='Pfad 165' fill='#183b5d' d='M16.18,28.33H.85C.38,28.33,0,30.1,0,32.27v7.88c0,2.17.38,3.93.85,3.93H16.18c.47,0,.85-1.76.85-3.93V32.27C17,30.1,16.65,28.33,16.18,28.33Z' />
          <Path id='Pfad_166' data-name='Pfad 166' fill='#183b5d' d='M45.73,28.33H30.41c-.47,0-.85,1.77-.85,3.94v7.88c0,2.17.38,3.93.85,3.93H45.73c.47,0,.85-1.76.85-3.93V32.27C46.58,30.1,46.2,28.33,45.73,28.33Z' />
          <Path id='Pfad_167' data-name='Pfad 167' fill='#183b5d' d='M38.09,17.5A3.33,3.33,0,0,0,38,24.16h.12a3.33,3.33,0,0,0,0-6.66Z' />
          <Path id='Pfad_168' data-name='Pfad 168' fill={props.selected ? '#5bb984' : '#183b5d'} d='M8.24,17.5a3.33,3.33,0,1,0-.11,6.66h.11a3.33,3.33,0,1,0,.12-6.66Z' />
          <Path id='Pfad_169' data-name='Pfad 169' fill='#183b5d' d='M38.09,45.68A3.33,3.33,0,0,0,38,52.34h.12a3.33,3.33,0,0,0,0-6.66Z' />
          <Path id='Pfad_170' data-name='Pfad 170' fill='#183b5d' d='M8.24,45.68a3.33,3.33,0,1,0-.11,6.66h.11a3.33,3.33,0,1,0,.12-6.66Z' />
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
