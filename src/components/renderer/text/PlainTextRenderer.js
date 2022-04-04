import React from 'react'
import { TTSengine } from '../../Tts'

const Tts = TTSengine.component()

export const PlainTextRenderer = props => {
  return (<Tts color={props.dimensionColor} text={props.value} />)
}
