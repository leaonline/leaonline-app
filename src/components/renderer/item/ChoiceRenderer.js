import React from 'react'

export const ChoiceRenderer = props => {
  console.debug('choice', props)
  const noop = () => null
  return (<>{noop()}</>)
}
