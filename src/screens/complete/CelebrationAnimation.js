import React from "react";
import { View, Animated, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
const { width } = Dimensions.get("screen");

/** this component Show falling down star top to in the cup animation
 *  on LesenLevelWinnerScreen
 *  it inteface with lifecycle method because start animation imidediately after load component
 **/

const range = (count) => {
  const array = [];
  for (let i = 0; i < count; i++) {
    array.push(i);
  }
  return array;
};

export default class CelebrationAnimation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parentWidth: 0,
      parentHeight: 0,
      animation: new Animated.Value(1),
    };
    this.increasingValue = 19;
  }
  getStatusOfAnimation = () => {
    this.props.updateState();
  };
  componentDidMount() {
    this.animatIonTimer = setTimeout(() => {
      this.getStatusOfAnimation();
    }, 9000);
    Animated.timing(this.state.animation, {
      toValue: 0,
      duration: 11000,
      useNativeDriver: false,
    }).start(() => {
      this.getStatusOfAnimation();
    });
  }


  componentWillUnmount() {
    clearTimeout(this.animatIonTimer);

  }

  _onLayout = (event) => {
    this.setState({
      parentWidth: event.nativeEvent.layout.width,
      parentHeight: event.nativeEvent.layout.height,
    });
  };
  _FailAnimation = ({ style, duration, delay, startY, endY, children }) => {
    return (
      <Animatable.View
        style={style}
        duration={duration}
        delay={delay}
        animation={{
          from: { translateY: startY, translateX: 10 },
          to: {
            translateY: endY + 80,
            translateX: -20,
          },
        }}
        easing={(t) => Math.pow(t, 1.2)}
        useNativeDriver
      >
        {children}
      </Animatable.View>
    );
  };
  _SwingAnimation = ({ animationEffect, delay, duration, children }) => {
    return (
      <Animatable.View
        animation={animationEffect}
        delay={delay}
        duration={duration}
        direction="alternate"
        easing="linear"
      >
        {children}
      </Animatable.View>
    );
  };
  _imgRandom = (imgs) => {
    let r = Math.ceil(Math.random() * imgs.length);
    return imgs[r - 1];
  };
  _getAnimationEffect = (animationEffectAry) => {
    return animationEffectAry[
      Math.floor(Math.random() * animationEffectAry.length)
      ];
  };
  render() {
    let FailAnimation = this._FailAnimation;
    let SwingAnimation = this._SwingAnimation;
    const animationEffectAry = [
      "flash",
      "jello",
      "pulse",
      "rotate",
      "rubberBand",
      "swing",
      "tada",
    ];
    const {
      imgs,
      count,
      duration,
      startY = 0,
      speed = 50,
      stopAnimarion,
    } = this.props;
    return (
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: width / 3,
          right: width / 3,
          top: 0,
        }}
        testID="swingAnimation1"
        onLayout={this._onLayout}
      >
        {range(count).map((i) => (
          <FailAnimation
            key={i + "test"}
            startY={startY}
            speed={speed}
            endY={stopAnimarion}
            style={{
              position: "absolute",
              left:
                Math.random() * this.state.parentWidth == 0
                  ? 50
                  : Math.random() * this.state.parentWidth,
            }}
            duration={duration}
            delay={i * (duration / count)}
          >
            <SwingAnimation
              animationEffect={this._getAnimationEffect(animationEffectAry)}
              delay={Math.random() * duration}
              duration={duration}
            >
              <Animated.View
                key={i}
                style={{
                  opacity: this.state.animation,
                  bottom: this.state.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 1],
                  }),
                }}
                delay={3000}
                duration={1000}
                direction="alternate"
                easing="fadeOut"
                iterationCount={1}
              >
                {this._imgRandom(imgs)}
              </Animated.View>
            </SwingAnimation>
          </FailAnimation>
        ))}
      </View>
    );
  }
}
