import React from 'react'
import { TTSengine } from '../../Tts'

const Tts = TTSengine.component()

export const PlainTextRenderer = props => {
  return (<Tts text={props.value} />)
}
