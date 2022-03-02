import React from 'react'
import { TTSengine } from '../../Tts'

const Tts = TTSengine.component()

export const PlainText = props => {
  return (<Tts text={props.value} />)
}
