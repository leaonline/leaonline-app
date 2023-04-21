import React, { useCallback, useReducer, useRef } from 'react'
import { Animated, Pressable, Vibration } from 'react-native'
import { Svg, G, Path, Rect, Circle } from 'react-native-svg'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'

const defaultPosition = { x: 0, y: 0 }
const initialState = () => ({
  selected: false,
  arrow: false,
  keyboard: false
})

const reducer = (prev, next) => {
  switch (next.type) {
    case 'select':
      return { ...prev, selected: true }
    case 'reset':
      return initialState()
  }
}

export const ClozeSelectInstructions = props => {
  const handPosition = useRef(new Animated.ValueXY(defaultPosition)).current
  const handAnimation = useRef({ animation: null, running: false })
  const [state, dispatch] = useReducer(reducer, initialState(), undefined)
  const { selected } = state

  const runAnimation = useCallback(() => {
    if (handAnimation.current.running === false) {
      return
    }

    Vibration.vibrate(100)
    const anim = handAnimation.current.animation ?? Animated.timing(handPosition, {
      toValue: { x: props.width / 2, y: 40 },
      duration: 1000,
      useNativeDriver: false
    })

    if (handAnimation.current.animation === null) {
      handAnimation.current.animation = anim
    }

    anim.start(() => {
      dispatch({ type: 'select' })

      setTimeout(() => {
        endAnimation()
      }, 1000)
    })
  }, [])

  const endAnimation = () => {
    handAnimation.current.running = false
    handAnimation.current.animation.stop()
    handAnimation.current.animation.reset()
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
    <Pressable accessibilityRole='button' onPress={toggleAnimation} style={styles.container}>
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
        <HandMove width={Layout.withRatio(25)} height={Layout.withRatio(25)} />
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
        <ColorListImg width={Layout.withRatio(30)} height={Layout.withRatio(30)} selected={selected} />
      </Animated.View>
    </Pressable>
  )
}

const ColorListImg = props => {
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 47.41 38.7'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <Path
          id='Rechteck_183-2'
          data-name='Rechteck 183-2'
          fill='#183b5d'
          d='M 25.14,6.58 H 44.57 A 2.42,2.42 0 0 1 47,9 v 0 a 2.42,2.42 0 0 1 -2.42,2.43 H 25.14 A 2.43,2.43 0 0 1 22.71,9 v 0 a 2.43,2.43 0 0 1 2.43,-2.42 z'
        />
        <Path
          id='Pfad_173-2'
          data-name='Pfad 173-2'
          fill='#183b5d'
          d='M 44.67,18.72 H 2.75 c -1.29,0 -2.33,0.55 -2.33,1.21 v 2.43 c 0,0.67 1,1.22 2.33,1.22 H 44.67 C 46,23.58 47,23 47,22.36 v -2.43 c 0,-0.66 -1,-1.21 -2.33,-1.21 z'
        />
        <Path
          id='Pfad_172-2'
          data-name='Pfad 172-2'
          fill='#183b5d'
          d='M 12,30.86 H 1 c -0.33,0 -0.6,0.54 -0.6,1.21 v 2.43 c 0,0.67 0.27,1.22 0.6,1.22 h 11 c 0.34,0 0.61,-0.55 0.61,-1.22 V 32.07 C 12.56,31.4 12.28,30.86 12,30.86 Z'
        />
        <Rect
          stroke='#183b5d'
          strokeMiterlimit='4'
          id='rect931'
          width='20.646244'
          height='12.590456'
          x='0.2475'
          y='0.2475'
          ry='2.5966856'
          rx='2.5966856'
        />
        <Rect
          stroke='#183b5d'
          strokeMiterlimit='4'
          id='rect1199'
          width='32.468533'
          height='12.580964'
          x='14.561449'
          y='25.869276'
          ry='2.5966899'
          rx='2.5966899'
        />
        {props.selected && (
          <>
            <Rect
              fill='#5bb984'
              id='rect1592'
              width='33.247406'
              height='19.527155'
              x='14.071423'
              y='4.4108491'
              rx='2.5966902'
              ry='2.5966899'
            />
            <Path
              fill='#5bb984'
              id='path1822'
              d='m 29.020423,29.687385 -1.029883,0 -1.029884,0 0.514942,-0.891906 0.514942,-0.891905 0.514941,0.891905 z'
              transform='matrix(1.1717393,2.115917,-2.029512,1.2216252,57.405272,-72.04037)'
            />
            <Circle
              fill='#183b5d'
              style='fill:#183b5d;fill-opacity:1;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1'
              id='path2685'
              cx='20.555887'
              cy='13.354174'
              r='2.8020096'
            />
            <Circle
              fill='#183b5d'
              style='fill:#183b5d;fill-opacity:1;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1'
              id='circle3008'
              cx='30.777037'
              cy='13.354174'
              r='2.8020096'
            />
            <Circle
              fill='#183b5d'
              style='fill:#183b5d;fill-opacity:1;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1'
              id='circle3010'
              cx='40.331192'
              cy='13.354174'
              r='2.8020096'
            />
          </>
        )}
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
