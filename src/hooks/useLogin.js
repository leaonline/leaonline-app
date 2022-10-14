import { useReducer, useEffect, useMemo } from 'react'
import Meteor from '@meteorrn/core'

/** @private */
const initialState = {
  isLoading: true,
  isSignout: false,
  userToken: null
}

/** @private */
const reducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        isLoading: false
      }
    case 'SIGN_IN':
      return {
        ...state,
        isSignOut: false,
        userToken: action.token
      }
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null
      }
  }
}

/** @private */
const Data = Meteor.getData()

/**
 * Provides a state and authentication context for components to decide, whether
 * the user is authenticated and also to run several authentication actions.
 *
 * The returned state contains the following structure:
 * {{
 *   isLoading: boolean,
 *   isSignout: boolean,
 *   userToken: string|null
 * }
 * }}
 *
 * the authcontext provides the following methods:
 * {{
 *   signIn: function,
 *   signOut: function,
 *   signUp: function
 * }}
 *
 * @returns {{
 *   state:object,
 *   authContext: object
 * }}
 */
export const useLogin = () => {
  const [state, dispatch] = useReducer(reducer, initialState, undefined)

  // Case 1: restore token already exists
  // MeteorRN loads the token on connection automatically,
  // in case it exists, but we need to "know" that for our auth workflow
  useEffect(() => {
    const handleOnLogin = () => dispatch({ type: 'RESTORE_TOKEN', token: Meteor.getAuthToken() })
    Data.on('onLogin', handleOnLogin)
    return () => Data.off('onLogin', handleOnLogin)
  }, [])

  // the auth can be referenced via useContext in the several
  // screens later on
  const authContext = useMemo(() => ({
    signIn: ({ codes, onError }) => {
      
    },
    signOut: () => {
      Meteor.logout(err => {
        if (err) {
          // TODO display error, merge into the above workflow
          return console.error(err)
        }
        dispatch({ type: 'SIGN_OUT' })
      })
    },
    signUp: ({ onError }) => {

    }
  }), [])

  return { state, authContext }
}