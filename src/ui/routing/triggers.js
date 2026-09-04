import { check } from 'meteor/check'
import { Router } from './Router'

export const createTrigger = (condition, getRedirectRoute) => {
  check(condition, Function)
  check(getRedirectRoute, Function)
  return function routeTrigger () {
    if (condition()) {
      const location = Router.location()
      const encodedLocation = encodeURIComponent(location)
      const fullPath = getRedirectRoute(encodedLocation)
      Router.go(fullPath)
      return true // indicate triggered
    }

    return false // indicate no trigger
  }
}
