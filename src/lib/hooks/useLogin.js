import { useReducer, useEffect, useMemo } from 'react'
import Meteor from '@meteorrn/core'
import { loadSettingsFromUserProfile } from '../env/loadSettingsFromUserProfile'
import { useConnection } from './useConnection'

/** @private */
const initialState = {
  isLoading: true,
  isSignout: false,
  isDeleted: false,
  userToken: null
}

/** @private */
const reducer = (prevState, nextState) => {
  switch (nextState.type) {
    case 'PROFILE_LOADED':
      return {
        ...prevState,
        profileLoaded: true
      }
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        userToken: nextState.token,
        isDeleted: false,
        isLoading: false
      }
    case 'SIGN_IN':
      return {
        ...prevState,
        isSignOut: false,
        isDeleted: false,
        userToken: nextState.token
      }
    case 'SIGN_OUT':
      return {
        ...prevState,
        isSignout: true,
        isDeleted: false,
        userToken: null
      }
    case 'DELETE':
      return {
        ...prevState,
        isSignout: false,
        isDeleted: true,
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
  const { connected } = useConnection()
  const [state, dispatch] = useReducer(reducer, initialState, undefined)

  Meteor.useTracker(() => {
    if (!connected) { return }
    const user = Meteor.user()

    if (!state.profileLoaded && user) {
      loadSettingsFromUserProfile(user)
      dispatch({ type: 'PROFILE_LOADED' })
    }
  }, [connected])

  // Case 1: restore token already exists
  // MeteorRN loads the token on connection automatically,
  // in case it exists, but we need to "know" that for our auth workflow
  useEffect(() => {
    const authToken = Meteor.getAuthToken()
    const handleOnLogin = () => dispatch({ type: 'RESTORE_TOKEN', token: Meteor.getAuthToken() })

    // There may be the situation where the auth token
    // is immediately available. If so, we can safely
    // dispatch and don't need any further information.
    if (connected && authToken && !state.isDeleted) {
      handleOnLogin()
    }

    // Otherwise, we need to listen to the package's
    // DDP even 'onLogin'  and dispatch then.
    // Note, that 'onLogin'  is only fired, when the
    // package has successfully restored the login via token!
    else {
      Data.on('onLogin', handleOnLogin)
      return () => Data.off('onLogin', handleOnLogin)
    }
  }, [connected])

  // the auth can be referenced via useContext in the several
  // screens later on
  const authContext = useMemo(() => ({
    signOut: ({ onError, onSuccess }) => {
      Meteor.logout(err => {
        if (err) { return onError(err) }
        onSuccess && onSuccess()
        dispatch({ type: 'SIGN_OUT' })
      })
    },
    signUp: ({ voice, speed, onError, onSuccess }) => {
      Meteor.call('users.methods.create', { voice, speed }, (err, res) => {
        if (err) {
          return onError(err)
        }

        // the package handles the token result for us
        // and uses our defined storage to store the token
        // in order to use it for auto-login when we open
        // the app next time
        Meteor._handleLoginCallback(err, res)
        onSuccess && onSuccess()
        const token = Meteor.getAuthToken()
        const type = 'SIGN_IN'
        dispatch({ type, token })
      })
    },
    restore: ({ codes, voice, speed, onError, onSuccess }) => {
      Meteor.call('users.methods.restore', { codes, voice, speed }, (err, res) => {
        if (err) {
          return onError(err)
        }

        // the package handles the token result for us
        // and uses our defined storage to store the token
        // in order to use it for auto-login when we open
        // the app next time
        Meteor._handleLoginCallback(err, res)
        onSuccess && onSuccess()
        const token = Meteor.getAuthToken()
        const type = 'SIGN_IN'
        dispatch({ type, token })
      })
    },
    deleteAccount: ({ onError, onSuccess }) => {
      Meteor.call('users.methods.delete', {}, (deleteError) => {
        if (deleteError) {
          return onError(deleteError)
        }

        // instead of calling Meteor.logout we
        // directly invoke the logout handler
        Meteor.handleLogout()
        onSuccess && onSuccess()
        dispatch({ type: 'DELETE' })
      })
    }
  }), [])

  return { state, authContext }
}
