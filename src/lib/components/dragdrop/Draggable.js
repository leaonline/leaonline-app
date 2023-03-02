import * as React from 'react'
import { PanResponder, Animated } from 'react-native'

export function draggable (Consumer) {
  class BaseDraggable extends React.Component {
    static defaultProps = {
      bounceBack: true
    }

    constructor (props) {
      super(props)

      this.identifier = props.customId || Symbol('draggable')

      this.state = {
        pan: new Animated.ValueXY()
      }

      this.moveHandler = Animated.event([
        null,
        {
          dx: this.state.pan.x,
          dy: this.state.pan.y
        }
      ])

      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (e, gesture) => {
          const { pageX, pageY } = e.nativeEvent

          this.props.__dndContext.handleDragMove(this.identifier, {
            x: pageX,
            y: pageY
          })

          this.moveHandler(e, gesture)
        },
        onPanResponderGrant: () => {
          this.state.pan.setOffset({
            x: this.state.pan.x._value,
            y: this.state.pan.y._value
          })
        },
        onPanResponderStart: e => {
          const { pageX, pageY } = e.nativeEvent
          this.props.__dndContext.handleDragStart(this.identifier, {
            x: pageX,
            y: pageY
          })
        },
        onPanResponderRelease: e => {
          const { pageX, pageY } = e.nativeEvent
          const update = () => {
            this.state.pan.flattenOffset()
          }

          if (this.props.bounceBack) {
            const springConfig = {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true
            }
            Animated
              .spring(this.state.pan, springConfig)
              .start(update)
          }
          else {
            update()
          }

          this.props.__dndContext.handleDragEnd(this.identifier, {
            x: pageX,
            y: pageY
          })
        }
      })
    }

    componentDidMount () {
      this.props.__dndContext.registerDraggable(this.identifier, {
        onDragStart: this.props.onDragStart,
        onDragEnd: this.props.onDragEnd,
        payload: this.props.payload
      })
    }

    componentWillUnmount () {
      this.props.__dndContext.unregisterDraggable(this.identifier)
    }

    componentDidUpdate (prevProps) {
      const updatedDraggable = {}

      if (prevProps.onDragEnd !== this.props.onDragEnd) {
        updatedDraggable.onDragEnd = this.props.onDragEnd
      }
      if (prevProps.onDragStart !== this.props.onDragStart) {
        updatedDraggable.onDragStart = this.props.onDragStart
      }
      if (prevProps.payload !== this.props.payload) {
        updatedDraggable.payload = this.props.payload
      }

      if (Object.keys(updatedDraggable).length !== 0) {
        this.props.__dndContext.updateDraggable(
          this.identifier,
          updatedDraggable
        )
      }
    }

    onLayout = (...args) => {
      if (this.props.onLayout) {
        this.props.onLayout(...args)
      }

      this.measure()
    }

    handleRef = element => {
      if (element && element.getNode) {
        this.element = element.getNode()
      }
      else {
        this.element = element
      }
    }

    measure () {
      if (this.element) {
        this.element.measureInWindow((x, y, width, height) => {
          this.props.__dndContext.updateDraggable(this.identifier, {
            layout: { x, y, width, height }
          })
        })
      }
    }

    render () {
      const { children } = this.props

      return children({
        viewProps: {
          onLayout: this.onLayout,
          ref: this.handleRef,
          // @ts-ignore
          style: {
            transform: this.state.pan.getTranslateTransform()
          },
          ...this.panResponder.panHandlers
        }
      })
    }
  }

  const Draggable = React.forwardRef((props, ref) => (
    <Consumer>
      {dndContext => (
        <BaseDraggable {...props} ref={ref} __dndContext={dndContext} />
      )}
    </Consumer>
  ))
  Draggable.displayName = 'ConnectedDraggable'

  return Draggable
}
