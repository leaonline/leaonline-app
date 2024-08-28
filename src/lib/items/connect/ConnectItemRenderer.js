import React, { useRef, useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  View
} from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { LeaText } from '../../components/LeaText'
import { Colors } from '../../constants/Colors'
import { Svg, Path, Circle, G } from 'react-native-svg'
import { UndefinedScore } from '../../scoring/UndefinedScore'
import { clearObject } from '../../utils/object/clearObject'
import { ImageRenderer } from '../../components/renderer/media/ImageRenderer'
import { Layout } from '../../constants/Layout'
import { Log } from '../../infrastructure/Log'

const debug = Log.create('ConnectItemRenderer', 'debug')

/**
 * Renders a connect item, where users have to connect
 * left elements with right elements.
 *
 * Multiple connections per element are possible.
 * Workflow:
 *
 * User selects a left element to make it `active`.
 * Selecting it again without other interaction will
 * deactivate the element. Selecting another left element
 * will switch the `active`state to the new selected one.
 *
 * Selecting a right element will establish a connection,
 * represented by a line. If the left-right pair is
 * selected again, they will be disconnected.
 *
 *
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export const ConnectItemRenderer = props => {
  const [complete, setComplete] = useState(false)
  const [selected, setSelected] = useState({})
  const [highlighted, setHighlighted] = useState(initialHighlighted())
  const [compared, setCompared] = useState(initialCompared())
  const svgContainer = useRef({
    x: 0,
    y: 0,
    w: 100,
    h: 100
  }).current
  const leftDots = useRef({}).current
  const rightDots = useRef({}).current
  const [active, setActive] = useState(null)
  const activeStyle = {
    backgroundColor: props.dimensionColor,
    borderColor: props.dimensionColor
  }

  // on contentId changed, do:
  //
  // 1. submit an initial response with undefined data
  //    to indicate this item has "started"
  //
  // 2. clear all selections when the content id changes
  //    which happens, for example, if we move to the next page
  //
  // 3. clear all connections
  useEffect(() => {
    setComplete(false)
    setActive(null)
    setSelected({})
    setCompared(initialCompared())
    setHighlighted(initialHighlighted())
    clearObject(svgContainer)
    clearObject(leftDots)
    clearObject(rightDots)

    props.submitResponse({
      responses: [UndefinedScore],
      data: props
    })
  }, [props.contentId])
  const updateSvgContainer = ({ x, y, w, h }) => {
    debug('SVG Container set layout', { x, y, w, h })
    svgContainer.x = x
    svgContainer.y = y
    svgContainer.w = w
    svgContainer.h = h
  }

  // on showCorrectResponse, do:
  // compare responses with the correct responses when
  // the parent decided to activate {showCorrectResponse}
  //
  // this is a two-step process:
  //
  // 1. Iterate props.scoreResult and compare
  //    all correct responses with selected
  //    to build a list of "correct" connection pairs.
  //    If a pair is in correct response but not in
  //    selected then it is added to the "missing" list.
  //    At the same time, add all expected correct pairs
  //    to an "expected" list
  //
  // 2. Use the "expected" list and go through all selected
  //    pairs to find connections that are not in "expected"
  //    and are thus added to the "wrong" list.
  //
  // 3. save all lists in a "compared" state-object
  useEffect(() => {
    if (!props.showCorrectResponse || !props.scoreResult) {
      return
    }

    const current = new Set()
    const expected = new Set()
    const correct = new Set()
    const wrong = new Set()
    const missing = new Set()

    // first check all right and missing
    props.scoreResult.forEach(entry => {
      entry.correctResponse.forEach(({ left, right }) => {
        const key = `${left},${right}`
        expected.add(key)

        const selection = selected[left] ?? []
        if (selection.includes(right)) {
          correct.add(key)
        }
        else {
          missing.add(key)
        }
      })
    })

    // then check all wrong
    Object.entries(selected).forEach(([left, allRight]) => {
      allRight.forEach(right => {
        const key = `${left},${right}`
        current.add(key)

        if (!expected.has(key)) {
          wrong.add(key)
        }
      })
    })

    const newCompared = {
      current: [...current],
      expected: [...expected],
      correct: [...correct],
      wrong: [...wrong],
      missing: [...missing]
    }
    setCompared(newCompared)
  }, [props.showCorrectResponse])

  // measures the layout of the "overlay" container,
  // which is used to draw the connections in an own
  // layer, to pass the correct coordinates and dimensions
  // to the `Svg` elements, when connections are to be drawn
  const onContainerLayout = (event) => {
    // we need to measure in window, in order
    // to get the correct coordinates;
    // event.nativeEvent.layout would only give
    // us the local coordinates

    event.target.measureInWindow((x, y, w, h) => {
      updateSvgContainer({ x, y, w, h })
    })
  }

  // measures the position of the invisible dots,
  // which are used to get the start and end points
  // to draw the connections
  const onDotLayout = (event, id, isLeft) => {
    const stamp = Date.now()
    debug('dot layout', isLeft ? 'L' : 'R', id, event.nativeEvent.layout, Layout.ratio(), stamp)
    event.target.measureInWindow((x, y, w, h) => {
      const centerX = x + (w / 2)
      const centerY = y + (h / 2)
      debug('dot measure', isLeft ? 'L' : 'R', id, { x, y, w, h, centerX, centerY }, stamp)
      const target = isLeft
        ? leftDots
        : rightDots
      target[id] = { x: centerX, y: centerY }

      if (
        Object.keys(leftDots).length === props.value.left.length &&
        Object.keys(rightDots).length === props.value.right.length
      ) {
        setTimeout(() => setComplete(true), 500)
      }
    })
  }

  const onPressLeft = ({ id }) => {
    if (props.showCorrectResponse) {
      return updateHighlighted(id, 'left')
    }

    if (active === id) {
      return setActive(null)
    }
    else {
      setActive(id)
    }
  }

  const onPressRight = ({ id }) => {
    if (props.showCorrectResponse) {
      return updateHighlighted(id, 'right')
    }

    // if no left is active, right has no effect
    if (active === null) {
      return
    }

    const current = { ...selected }

    // two options if active is already
    // in selected:
    if (current[active]) {
      const found = current[active].findIndex(el => el === id)

      // 1. if the same connection exists
      // then we remove it
      if (found > -1) {
        current[active].splice(found, 1)

        // if no connection is left, remove active
        // from connections
        if (current[active].length === 0) {
          delete current[active]
        }
      }
      // otherwise, establish the connection
      else {
        current[active].push(id)
      }
    }
    // if not in selected, create a new structure
    else {
      current[active] = [id]
    }

    const responses = []

    // The Response for this item is submitted in the form if
    // a list of strings with specific pattern:
    //
    // '<left>,<right 1>,...,<right n>'
    //
    // example:
    // select left 1 and right 0 and 2 results in
    // '1,0,2'
    Object.entries(current).forEach(([left, allRight]) => {
      const right = allRight.join(',')
      const value = `${left},${right}`
      responses.push(value)
    })

    props.submitResponse({
      responses,
      data: props
    })

    setSelected(current)
    setActive(null)
  }

  const updateHighlighted = (id, type) => {
    const idStr = id.toString()
    const found = new Set()
    const addToFound = entry => found.add(entry)
    let byFilterFn

    // on left get all outbound connections
    if (type === 'left') {
      byFilterFn = pair => pair.startsWith(idStr)
    }

    // on right get all inbound connections
    if (type === 'right') {
      byFilterFn = pair => pair.endsWith(idStr)
    }

    compared.current.filter(byFilterFn).forEach(addToFound)
    compared.expected.filter(byFilterFn).forEach(addToFound)

    const unset = (
      highlighted.length === found.size &&
      highlighted.every(pair => found.has(pair))
    )
    return unset
      ? setHighlighted([])
      : setHighlighted([...found])
  }

  const hasHighlighted = (
    props.showCorrectResponse &&
    highlighted.length > 0
  )

  const getHighlightedStyle = ({ index, type }) => {
    const indexStr = index.toString()
    let isIncluded

    if (type === 'left') {
      isIncluded = highlighted.some(pair => pair.startsWith(indexStr))
    }

    if (type === 'right') {
      isIncluded = highlighted.some(pair => pair.endsWith(indexStr))
    }

    if (type === 'line') {
      isIncluded = highlighted.some(pair => pair === index)
      return isIncluded ? 1.0 : 0.1
    }

    return isIncluded
      ? styles.highlightActive
      : styles.highlightPassive
  }

  const renderLeftElements = () => {
    return props.value.left.map(({ text, image }, index) => {
      const nodeStyle = [styles.node]
      const isActive = active === index && !props.showCorrectResponse
      const isSelected = index in selected && !props.showCorrectResponse

      if (isSelected) {
        nodeStyle.push(styles.nodeSelected)
      }

      if (isActive) {
        nodeStyle.push(activeStyle)
      }

      if (hasHighlighted) {
        const highlightedStyle = getHighlightedStyle({ index, type: 'left' })
        nodeStyle.push(highlightedStyle)
      }

      return (
        <Pressable
          accessibilityRole='button'
          key={`left-${index}`}
          style={styles.nodeContainer}
          onPress={() => onPressLeft({ id: index })}
          onLayout={e => {
            onDotLayout(e, index, true)
          }}
        >
          <View style={nodeStyle}>
            {
              image
                ? renderImage({ isSelected, image })
                : renderText({ isSelected, text })
            }
          </View>
        </Pressable>
      )
    })
  }

  const renderLines = () => {
    const allLines = []

    const transformToLine = color => key => {
      const [left, right] = key.split(',')
      const x1 = leftDots[left].x
      const y1 = leftDots[left].y
      const x2 = rightDots[right].x
      const y2 = rightDots[right].y
      let opacity = 1.0

      if (hasHighlighted) {
        opacity = getHighlightedStyle({ index: key, type: 'line' })
      }

      allLines.push({ x1, y1, x2, y2, color, opacity })
    }

    if (props.showCorrectResponse) {
      compared.correct.forEach(transformToLine(Colors.right))
      compared.wrong.forEach(transformToLine(Colors.wrong))
      compared.missing.forEach(transformToLine(Colors.secondary))
    }
    else {
      Object.entries(selected).forEach(([left, allRight]) => {
        const x1 = leftDots[left].x
        const y1 = leftDots[left].y

        allRight.forEach(right => {
          const x2 = rightDots[right].x
          const y2 = rightDots[right].y
          const color = props.dimensionColor
          const opacity = 1.0

          allLines.push({ x1, y1, x2, y2, color, opacity })
        })
      })
    }


    return (
      <Svg
        style={styles.svg} width={svgContainer.w} height={svgContainer.h}
        viewBox={`${svgContainer.x} ${svgContainer.y} ${svgContainer.w} ${svgContainer.h}`}
      >
        {
          allLines.map((position, index) => {
            const path = `M ${position.x1} ${position.y1} L ${position.x2} ${position.y2}`
            const lineKey = `svg-line-${index}`
            return (
              <G key={lineKey}>
                <Path
                  strokeWidth='4'
                  stroke={position.color}
                  strokeOpacity={position.opacity}
                  d={path}
                />

                <Circle
                  x={position.x2}
                  y={position.y2}
                  r={10}
                  fill={position.color}
                  fillOpacity={position.opacity}
                />
              </G>
            )
          })
        }
      </Svg>
    )
  }

  const renderRightElements = () => {
    return props.value.right.map(({ text, image }, index) => {
      const nodeStyle = [styles.node]
      const isSelected = (
        !props.showCorrectResponse &&
        Object.values(selected).some(list => list.includes(index))
      )

      if (isSelected) {
        nodeStyle.push(styles.nodeSelected)
      }

      if (hasHighlighted) {
        const highlightedStyle = getHighlightedStyle({ index, type: 'right' })
        nodeStyle.push(highlightedStyle)
      }

      return (
        <Pressable
          accessibilityRole='button'
          key={`right-${index}`}
          style={styles.nodeContainer}
          onPress={() => onPressRight({ id: index })}
          onLayout={e => {
            onDotLayout(e, index, false)
          }}
        >
          <View style={nodeStyle}>
            {
              image
                ? renderImage({ isSelected, image })
                : renderText({ isSelected, text })
            }
          </View>
        </Pressable>
      )
    })
  }

  return (
    <View style={[styles.overlay, props.style]} onLayout={onContainerLayout}>
      {renderLines()}
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {renderLeftElements()}
        </View>
        <View style={styles.centerContainer}>
          {!complete && <ActivityIndicator color={props.dimensionColor} />}
        </View>
        <View style={styles.rightContainer}>
          {renderRightElements()}
        </View>
      </View>
    </View>
  )
}

const renderText = ({ isSelected, text }) => (
  <LeaText
    fitSize
    autoScale={false}
    style={isSelected ? styles.textSelected : styles.text}
  >{text}
  </LeaText>
)

const renderImage = ({ isSelected, image }) => {
  return (
    <ImageRenderer
      width={25}
      style={isSelected ? styles.imageSelected : styles.image}
      value={image}
    />
  )
}

/**
 * @private
 */
const initialCompared = () => ({
  current: [], // all set by user
  expected: [], // all from correctResponse
  correct: [],
  wrong: [],
  missing: []
})

/**
 * @private
 */
const initialHighlighted = () => ([])

const styles = createStyleSheet({
  overlay: {
    marginTop: 25,
    borderColor: '#ff0',
  },
  svgContainer: {
    borderColor: '#0f0'
  },
  svg: {
    position: 'absolute',
    borderColor: '#0ff',
  },
  container: {
    flex: 1,
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    flexGrow: 1
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    flexGrow: 1
  },
  centerContainer: {
    flex: 1,
    maxWidth: '33%',
    flexDirection: 'column',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  node: {
    paddingTop: 10,
    paddingBottom: 10,
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.secondary,
    borderWidth: 1,
    borderRadius: 5
  },
  nodeSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary
  },
  highlightActive: {

  },
  highlightPassive: {
    opacity: 0.1
  },
  textSelected: {
    color: Colors.white
  },
  text: {
  },
  textElement: {},
  image: {
    width: '100%'
  },
  imageSelected: {
    width: '100%'
  }
})
