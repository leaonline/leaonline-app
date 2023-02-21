import React, { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import nextFrame from 'next-frame'
import { Vibration } from 'react-native'

/**
 * Creates a HOC that wraps a component (that has an onPress event!)
 * and delegates this event to an internal handler, which itself
 * invokes a Vibration and triggers the navigation to enter a new route.
 * @param route {string}
 * @param Component {JSX.Element}
 * @return {function():JSX.Element}
 */
export const createRoutableComponent = ({ route, Component }) => {
  /**
   *
   * @param props {object}
   * @param props.vibrate {boolean=}
   * @return {JSX.Element}
   * @component
   */
  const RoutableComponent = props => {
    const navigation = useNavigation()
    const toRoute = useCallback(async () => {
      await nextFrame()
      if (props.vibrate !== false) {
        Vibration.vibrate(100)
      }
      navigation.navigate(route)
    }, [])

    return (
      <Component onPress={toRoute} {...props} />
    )
  }

  // return
  return RoutableComponent
}
