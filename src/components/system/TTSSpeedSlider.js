import React from 'react'
import Slider from '@react-native-community/slider'
import { Units } from '../../utils/Units'
import Colors from '../../constants/Colors'
import { TTSengine } from '../Tts'

export const TTSSpeedSlider = (props) => {
  const updateTTSSpeed = async (newValue) => {
    TTSengine.updateSpeed(newValue)
    return TTSengine.speakImmediately(props.text)
  }
  return (
    <Slider
      style={{ width: Units.vw * 50, height: 40, ...props.style }}
      minimumValue={0.3}
      maximumValue={1.2}
      step={0.1}
      value={1}
      onSlidingComplete={updateTTSSpeed}
      minimumTrackTintColor={Colors.primary}
      maximumTrackTintColor={Colors.secondary}
    />
  )
}