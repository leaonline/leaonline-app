import React, { useState } from 'react'
import { Animated, Text, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { LeaText } from '../../components/LeaText'
import { Colors } from '../../constants/Colors'
import { createDragDropContext } from '../../components/dragdrop/createDragDropContext'

const { Provider, Droppable, Draggable } = createDragDropContext()

export const ConnectItemRenderer = props => {
  const [selected, setSelected] = useState({})

  const onDrop = ({ leftIndex, rightIndex }) => {
    const copy = { ...selected }
    copy[leftIndex] = rightIndex
    setSelected(copy)
  }

  const renderLeftElements = () => {
    return props.value.left.map(({ text }, index) => {
      return (
        <View style={styles.draggableContainer} key={`left-${index}`}>
          <Draggable
            payload={index}
            bounceBack={false}
          >
            {({ viewProps }) => {
              return (
                <Animated.View
                  {...viewProps}
                  style={[viewProps.style, styles.draggable]}
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
    return props.value.left.map(({ text }, index) => {
      return (
        <View style={styles.dropzoneContainer} key={`right-${index}`}>
          <LeaText style={styles.textElement}>{text}</LeaText>
          <Droppable
            onDrop={({ payload }) => {
              onDrop({ leftIndex: payload, rightIndex: index })
            }}
          >
            {({ active, viewProps }) => {
              return (
                <Animated.View
                  {...viewProps}
                  style={[
                    active ? styles.dropzoneActive : styles.dropzone,
                    viewProps.style
                  ]}
                >
                  <Text />
                </Animated.View>
              )
            }}
          </Droppable>
        </View>
      )
    })
  }

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {renderLeftElements()}
        </View>
        <View style={styles.rightContainer}>
          {renderRightElements()}
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
  textElement: {
    flexGrow: 1
  },
  draggableContainer: {
    flex: 0,
    padding: 10,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center'
  },
  draggable: {
    padding: 2,
    borderWidth: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.secondary,
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropzoneContainer: {
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  dropzone: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.light,
    flexGrow: 1,
    height: 50
  },
  dropzoneActive: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    backgroundColor: Colors.gray,
    flexGrow: 1,
    height: 50
  }
}, true)
