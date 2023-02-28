import React, { useReducer } from 'react'
import { Animated, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { LeaText } from '../../components/LeaText'
import { Colors } from '../../constants/Colors'
import { createDragDropContext } from '../../components/dragdrop/createDragDropContext'

const { Provider, Droppable, Draggable } = createDragDropContext()

const initialState = () => ({
  current: -1,
  selected: {},
  over: {},
})

const reducer = (prevState, nextState) => {
  const { type, ...rest } = nextState

  switch (nextState.type) {
    case 'dragStart':
      return {
        ...prevState,
        current: nextState.index,
      }
    case 'dragEnd':
      return {
        ...prevState,
        current: -1
      }
    case 'enterDropzone':
      return {
        ...prevState,
        over: { [nextState.leftIndex]: nextState.rightIndex }
      }
    case 'leaveDropzone':
      return {
        ...prevState,
        over: {},
        selected: {
          ...prevState.selected,
          [nextState.leftIndex]: undefined
        }
      }
    case 'drop':
      return {
        ...prevState,
        over: {},
        selected: {
          ...prevState.selected,
          [nextState.leftIndex]: nextState.rightIndex
        }
      }
    default:
      throw new Error(`Undefined reducer state ${nextState.type}`)
  }
}

export const ConnectItemRenderer2 = props => {
  const [state, dispatch] = useReducer(reducer, initialState(), undefined)
  const { selected, over, current } = state

  const renderLeftElements = () => {
    return props.value.left.map(({ text }, index) => {
      return (
        <View style={styles.draggableContainer} key={`left-${index}`}>
          <Draggable
            onDragStart={data => {
              if (typeof selected[index] === 'number') {
                console.debug(data)
              }
              else {
                dispatch({ type: 'dragStart', index })
              }
            }}
            onDragEnd={() => dispatch({ type: 'dragEnd', index })}
            payload={index}
            bounceBack={false}
          >
            {({ viewProps }) => {
              return (
                <Animated.View
                  {...viewProps}
                  style={[viewProps.style, index === current ? styles.draggableActive : styles.draggable]}
                >
                  <LeaText>{text}</LeaText>
                </Animated.View>
              )
            }}
          </Draggable>
        </View>
      )
    })
  }

  const renderRightElements = () => {
    return props.value.right.map(({ text }, index) => {
      const isOccupied = Object.values(selected).includes(index)
      return (
        <Droppable
          key={`right-${index}`}
          onEnter={({ payload }) => {
            // we dispatch only if there is no
            // other item already in this dropzone
            if (!isOccupied) {
              dispatch({ type: 'enterDropzone', leftIndex: payload, rightIndex: index })
            }
          }}
          onLeave={({ payload }) => {
            dispatch({ type: 'leaveDropzone', leftIndex: payload, rightIndex: index })
          }}
          onDrop={({ payload }) => {
            if (over[payload] === index) {
              dispatch({ type: 'drop', leftIndex: payload, rightIndex: index })
            }
          }}
        >
          {({ active, viewProps }) => {
            const draggingOver = active && current !== -1
            const dzStyles =  [viewProps.style, styles.dropzoneContainer]

            if (draggingOver && !isOccupied) {
              dzStyles.push(styles.dropzoneContainerActive)
            }
            if (isOccupied && !draggingOver) {
              dzStyles.push(styles.dropzoneContainerDropped)
            }
            return (
              <Animated.View
                {...viewProps}
                style={dzStyles}
              >
                <LeaText style={styles.textElement}>{text}</LeaText>
                <View style={styles.dropzone}></View>
              </Animated.View>
            )
          }}
        </Droppable>
      )
    })
  }

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.rightContainer}>
          {renderRightElements()}
        </View>
        <View style={styles.leftContainer}>
          {renderLeftElements()}
        </View>
      </View>
    </Provider>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    flexDirection: 'row'
  },
  leftContainer: {
    flex: 1
  },
  rightContainer: {
    flex: 1
  },
  textElement: {},
  draggableContainer: {
    flex: 0,
    padding: 10,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  draggable: {
    padding: 2,
    borderWidth: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.secondary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  draggableActive: {
    padding: 2,
    borderWidth: 1,
    backgroundColor: Colors.gray,
    color: Colors.white,
    borderColor: Colors.secondary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropzoneContainer: {
    padding: 10,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
    backgroundColor: Colors.light,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5
  },
  dropzoneContainerActive: {
    backgroundColor: Colors.gray
  },
  dropzoneContainerDropped: {
    borderColor: Colors.secondary,
  },
  dropzone: {
    flex: 1
  }
})
