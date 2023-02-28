import React, {Component} from 'react'
import Svg, {Line} from 'react-native-svg'
import {
  StyleSheet,
  View,
  Platform,
  Text,
  PanResponder,
  Image,
  Dimensions,
} from 'react-native';

var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export class Connector extends Component {
  constructor() {
    super();
    //initialize state
    this.panResponder;
    this.state = {
      startTouchX: 0,
      startTouchY: 0,

      endTouchX: 0,
      endTouchY: 0,
    };

    //panResponder initialization
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onStartShouldSetPanResponderCapture: (event, gestureState) => {
        this.setState({
          startTouchX: event.nativeEvent.locationX.toFixed(2),
          startTouchY: event.nativeEvent.locationY.toFixed(2),
        });
      },
      onMoveShouldSetPanResponder: (event, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (event, gestureState) => false,
      onPanResponderGrant: (event, gestureState) => false,
      onPanResponderMove: (event, gestureState) => {},
      onPanResponderRelease: (event, gestureState) => {
        this.setState({
          endTouchX: event.nativeEvent.locationX.toFixed(2),
          endTouchY: event.nativeEvent.locationY.toFixed(2),
        });
      },
    });
    this.setState({
      startTouchX: 0,
      startTouchY: 0,

      endTouchX: 0,
      endTouchY: 0,
    });
  }
  render() {
    return (
        <View style={styles.childView}>
          <Svg height={height} width={width} position="absolute">
            <Line
              x1={this.state.startTouchX}
              y1={this.state.startTouchY}
              x2={this.state.endTouchX}
              y2={this.state.endTouchY}
              stroke="red"
              strokeWidth="8"
            />
          </Svg>
          <View
            style={{flex: 1, backgroundColor: 'transparent'}}
            {...this.panResponder.panHandlers}
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
  },

  childView: {
    flex: 1,
    overflow: 'hidden',
    width: 20,
    height: 20,
    borderRadius: 14,
    backgroundColor: '#afeeee',
  },
  point: {
    height: 22,
    width: 22,
    marginTop: 5,
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: '#afeeee',
  },
});