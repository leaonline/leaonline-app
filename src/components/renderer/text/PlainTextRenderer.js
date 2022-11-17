import React from 'react'
import { useTts } from '../../Tts'
import { Layout } from '../../../constants/Layout'

export const PlainTextRenderer = props => {
  const { Tts } = useTts()

  return (<Tts block={true} color={props.dimensionColor} text={props.value} dontShowText={!!props.hidden}  />)
}
