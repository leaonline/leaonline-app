import React from 'react'
import { useTts } from '../../Tts'
import { Colors } from '../../../constants/Colors'

/**
 * Use it to render plain text in units.
 * @param props
 * @return {JSX.Element}
 * @component
 */
export const PlainTextRenderer = props => {
  const { Tts } = useTts()

  return (
    <Tts
      block
      style={props.style}
      iconColor={props.dimensionColor}
      color={Colors.secondary}
      asButton={props.hidden}
      text={props.value}
    />
  )
}
