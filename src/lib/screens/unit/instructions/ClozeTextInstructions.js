import React, { useCallback, useReducer, useRef } from 'react'
import { Animated, PixelRatio, Pressable, Vibration, View } from 'react-native'
import { Svg, G, Path, Line } from 'react-native-svg'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Loading } from '../../../components/Loading'

const defaultPosition = { x: 0, y: 0 }
const initialState = () => ({
  width: null,
  height: null,
  graphics: null,
  selected: false,
  arrow: false,
  keyboard: false
})

const reducer = (prev, next) => {
  switch (next.type) {
    case 'layout':
      return { ...prev, width: next.width, height: next.height, graphics: next.graphics }
    case 'select':
      return { ...prev, selected: true }
    case 'arrow':
      return { ...prev, arrow: true }
    case 'keyboard':
      return { ...prev, keyboard: true }
    case 'reset':
      return {
        ...prev,
        selected: false,
        arrow: false,
        keyboard: false
      }
  }
}

export const ClozeTextInstructions = props => {
  const handPosition = useRef(new Animated.ValueXY(defaultPosition)).current
  const handAnimation = useRef({ animation: null, running: false })
  const [state, dispatch] = useReducer(reducer, initialState(), undefined)
  const { selected, arrow, keyboard } = state
  const isReady = state.width !== null && state.height !== null && state.graphics !== null

  const onContainerLayout = event => {
    const { width, height } = event.nativeEvent.layout
    const size = PixelRatio.roundToNearestPixel(width / 5)
    const y = (height - size) / 2 // vertically center
    const textX = width / 2 - (size / 2)
    const arrowX = (width / 2) + (size / 2)
    const phoneX = width - size
    const graphics = {
      y,
      size,
      handToX: textX - size,
      textX,
      arrowX,
      phoneX
    }
    dispatch({ type: 'layout', width, height, graphics })
  }

  const runAnimation = useCallback(() => {
    if (handAnimation.current.running === false) {
      return
    }

    Vibration.vibrate(100)
    const anim = handAnimation.current.animation ?? Animated.timing(handPosition, {
      toValue: { x: state.graphics.handToX, y: state.graphics.y },
      duration: 1000,
      useNativeDriver: false
    })

    if (handAnimation.current.animation === null) {
      handAnimation.current.animation = anim
    }

    anim.start(() => {
      dispatch({ type: 'select' })

      setTimeout(() => {
        dispatch({ type: 'arrow' })
      }, 500)

      setTimeout(() => {
        dispatch({ type: 'keyboard' })
      }, 1000)

      setTimeout(() => {
        endAnimation()
      }, 1750)
    })
  }, [state.width, state.height, state.graphics])

  const endAnimation = () => {
    handAnimation.current.running = false
    handAnimation.current.animation.stop()
    handAnimation.current.animation.reset()
    dispatch({ type: 'reset' })
  }

  const toggleAnimation = () => {
    if (!isReady) { return }

    if (handAnimation.current.running) {
      endAnimation()
    }
    else {
      handAnimation.current.running = true
      runAnimation()
    }
  }

  const renderContent = () => {
    if (!isReady) {
      return (
        <Loading color={props.color} />
      )
    }
    return (
      <>
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
          <HandMove
            width={state.graphics.size}
            height={state.graphics.size}
          />
        </Animated.View>
        <Animated.View
          style={[
            {
              left: state.graphics.textX,
              top: state.graphics.y
            },
            styles.svgContainer
          ]}
          direction='alternate'
          easing='linear'
          iterationCount='infinite'
          useNativeDriver
        >
          <ColorListImg
            width={state.graphics.size}
            height={state.graphics.size}
            selected={selected}
          />
        </Animated.View>
        <View
          style={[
            {
              left: state.graphics.arrowX,
              top: state.graphics.y
            },
            styles.svgContainer
          ]}
        >
          <Arrow
            width={state.graphics.size}
            height={state.graphics.size}
            show={arrow}
          />
        </View>
        <View
          style={[
            {
              left: state.graphics.phoneX,
              top: state.graphics.y
            },
            styles.svgContainer
          ]}
        >
          <Mobile
            width={state.graphics.size}
            height={state.graphics.size}
            keyboard={keyboard}
          />
        </View>
      </>
    )
  }

  return (
    <Pressable
      accessibilityRole='button'
      onPress={toggleAnimation}
      onLayout={onContainerLayout}
      style={[styles.container, { height: props.height }]}
    >
      {renderContent()}
    </Pressable>
  )
}

const Arrow = props => {
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26.43 7.96'>
      {props.show && (
        <G id='Ebene_2' data-name='Ebene 2'>
          <G id='Ebene_1-2' data-name='Ebene 1'>
            <G id='Gruppe_309' data-name='Gruppe 309'>
              <G id='Gruppe_257-2' data-name='Gruppe 257-2'>
                <Path id='Pfad_156-2' data-name='Pfad 156-2' fill='#5bb984' d='M19.68,8l6.75-4.24L19.39,0Z' />
              </G>
            </G>
            <Line
              id='Linie_16'
              data-name='Linie 16'
              fill='none'
              stroke='#5bb984'
              strokeLinecap='round'
              strokeWidth='2'
              x1='21' y1='4.05' x2='1' y2='4.05'
            />
          </G>
        </G>
      )}
    </Svg>
  )
}

const Mobile = props => {
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 27.72 44.35'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <G id='Gruppe_278' data-name='Gruppe 278'>
            <Path
              id='Pfad_176' data-name='Pfad 176' fill='#183b5d'
              d='M23.56,0H4.16A4.16,4.16,0,0,0,0,4.16v36a4.16,4.16,0,0,0,4.16,4.16h19.4a4.16,4.16,0,0,0,4.16-4.16v-36A4.16,4.16,0,0,0,23.56,0Zm-9.7,41.58a2.78,2.78,0,1,1,2.77-2.77h0a2.77,2.77,0,0,1-2.77,2.77Z'
            />
          </G>
          {props.keyboard && (
            <G id='Gruppe_279' data-name='Gruppe 279'>
              <Path
                id='Pfad_177' data-name='Pfad 177' fill='#ffffff'
                d='M24,19H3.84a2,2,0,0,0-2,2h0V33.07a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2h0V21A2,2,0,0,0,24,19Zm.33,14.1a.33.33,0,0,1-.33.33H3.84a.33.33,0,0,1-.33-.33h0V21a.33.33,0,0,1,.33-.33H24a.33.33,0,0,1,.33.33ZM9,27.61V26.44a.5.5,0,0,0-.5-.5H7.29a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5H8.46a.5.5,0,0,0,.5-.5Zm4,0V26.44a.5.5,0,0,0-.5-.5H11.32a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.17a.5.5,0,0,0,.5-.5Zm4,0V26.44a.5.5,0,0,0-.5-.5H15.34a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.18a.5.5,0,0,0,.5-.49Zm4,0V26.44a.5.5,0,0,0-.5-.5H19.37a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.18a.5.5,0,0,0,.5-.5ZM7,31.05V29.88a.5.5,0,0,0-.5-.5H5.27a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5H6.45a.5.5,0,0,0,.5-.49Zm16.11,0V29.88a.5.5,0,0,0-.5-.5H21.38a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.18a.49.49,0,0,0,.5-.49ZM7,24.17V23a.5.5,0,0,0-.5-.5H5.27a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5H6.45a.5.5,0,0,0,.5-.5Zm4,0V23a.5.5,0,0,0-.5-.5H9.3a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.17a.5.5,0,0,0,.51-.5h0Zm4,0V23a.5.5,0,0,0-.5-.5H13.32a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5H14.5a.51.51,0,0,0,.51-.49h0Zm4,0V23a.5.5,0,0,0-.5-.5H17.36a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.17a.5.5,0,0,0,.5-.5Zm4,0V23a.5.5,0,0,0-.5-.5H21.38a.5.5,0,0,0-.5.5v1.17a.5.5,0,0,0,.5.5h1.18a.5.5,0,0,0,.5-.49ZM19,30.8v-.67a.5.5,0,0,0-.5-.5H9.38a.5.5,0,0,0-.5.5v.67a.5.5,0,0,0,.5.5h9.07a.5.5,0,0,0,.5-.5Z'
              />
            </G>
          )}
        </G>
      </G>
    </Svg>
  )
}

const ColorListImg = props => {
  return (
    <Svg width={props.width} height={props.height} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 47.41 38.7'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <G id='Gruppe_283' data-name='Gruppe 283'>
            <Path
              id='Pfad_172-2' data-name='Pfad 172-2' fill='#183b5d'
              d='M12,30.86H1c-.33,0-.6.55-.6,1.22V34.5c0,.67.27,1.22.6,1.22H12c.33,0,.61-.55.61-1.22V32.08C12.56,31.41,12.28,30.86,12,30.86Z'
            />
          </G>
          <G id='Gruppe_284' data-name='Gruppe 284'>
            <Path
              id='Rechteck_183-2' data-name='Rechteck 183-2' fill='#183b5d'
              d='M25.14,6.58H44.57A2.42,2.42,0,0,1,47,9h0a2.42,2.42,0,0,1-2.42,2.43H25.14A2.43,2.43,0,0,1,22.71,9h0A2.43,2.43,0,0,1,25.14,6.58Z'
            />
          </G>
          <G id='Gruppe_285' data-name='Gruppe 285'>
            <Path
              id='Pfad_173-2' data-name='Pfad 173-2' fill='#183b5d'
              d='M44.67,18.72H2.75c-1.29,0-2.33.55-2.33,1.22v2.42c0,.67,1,1.22,2.33,1.22H44.67C46,23.58,47,23,47,22.36V19.94C47,19.27,46,18.72,44.67,18.72Z'
            />
          </G>
          <G id='Gruppe_287' data-name='Gruppe 287'>
            <Path
              id='Pfad_175-2' data-name='Pfad 175-2' fill='#183b5d'
              d='M44.38,38.7H17.14a3,3,0,0,1-3-3v-7.1a3,3,0,0,1,3-3H44.38a3,3,0,0,1,3,3v7.1A3,3,0,0,1,44.38,38.7ZM17.14,26.37a2.2,2.2,0,0,0-2.2,2.2h0v7.1a2.21,2.21,0,0,0,2.2,2.2H44.38a2.21,2.21,0,0,0,2.2-2.2h0v-7.1a2.2,2.2,0,0,0-2.2-2.2H17.14Z'
            />
          </G>
          {props.selected
            ? (
              <Path
                fill='#5bb984'
                d='M18.14,13.17H3a3,3,0,0,1-3-3V3A3,3,0,0,1,3,0H18.14a3,3,0,0,1,3,3v7.1A3,3,0,0,1,18.14,13.17Z'
              />
              )
            : (
              <Path
                fill='#183b5d'
                d='M18.14,0H3A3,3,0,0,0,0,3v7.1a3,3,0,0,0,3,3H18.14a3,3,0,0,0,3-3V3A3,3,0,0,0,18.14,0Zm2.37,9.79a2.78,2.78,0,0,1-2.84,2.73H3.51A2.8,2.8,0,0,1,.66,9.79V3.38A2.8,2.8,0,0,1,3.51.65H17.67a2.78,2.78,0,0,1,2.84,2.73Z'
              />
              )}
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
    flex: 0,
    borderColor: '#00f',
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  svgContainer: {
    position: 'absolute',
    flex: 0,
    justifyContent: 'center',
    alignSelf: 'center'
  }
})
