import { useReducer, useEffect, useMemo } from 'react'
import Meteor from '@meteorrn/core'
import { loadSettingsFromUserProfile } from '../env/loadSettingsFromUserProfile'
import { Config } from '../env/Config'
import { getDeviceData } from '../analystics/getDeviceData'
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'

/** @private */
const initialState = {
  isLoading: true,
  isSignout: false,
  /**
   * we will shortly remove this
   * @deprecated
   */
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
        isSignout: false,
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
export const useLogin = ({ connection }) => {
  const { connected } = connection
  const [state, dispatch] = useReducer(reducer, initialState, undefined)
  const user = Meteor.useTracker(() => Meteor.user())

  useEffect(() => {
    if (!connected || !user || state.profileLoaded) { return }

    try {
      loadSettingsFromUserProfile(user)
    }
    catch (e) {
      ErrorReporter.send({ error: e }).catch(Log.error)
    }
    dispatch({ type: 'PROFILE_LOADED' })
  }, [connected, user])

  // Case 1: restore token already exists
  // MeteorRN loads the token on connection automatically,
  // in case it exists, but we need to "know" that for our auth workflow
  useEffect(() => {
    const authToken = Meteor.getAuthToken()
    const handleOnLogin = () => {
      dispatch({ type: 'RESTORE_TOKEN', token: Meteor.getAuthToken() })
    }

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
      Meteor.getData().on('onLogin', handleOnLogin)
      return () => Meteor.getData().off('onLogin', handleOnLogin)
    }
  }, [connected])

  // the auth can be referenced via useContext in the several
  // screens later on
  const authContext = useMemo(() => ({
    signOut: ({ onError, onSuccess }) => {
      Meteor.logout(err => {
        if (err) {
          ErrorReporter.send({ error: err }).catch(Log.error)
          return onError(err)
        }
        onSuccess && onSuccess()
        dispatch({ type: 'SIGN_OUT' })
      })
    },

    /**
     * Registers a new user account on the backend server
     * @param termsAndConditionsIsChecked {boolean?}
     * @param voice {string?} identifier of the selected voice
     * @param speed {number?} speed value for voice
     * @param onError {function}
     * @param onSuccess {function}
     * @return {Promise<void>}
     */
    signUp: async ({ termsAndConditionsIsChecked, voice, speed, onError, onSuccess }) => {
      const args = { voice, speed, termsAndConditionsIsChecked }

      if (Config.isDeveloperRelease()) {
        args.isDev = true
      }

      try {
        args.device = await getDeviceData()
      }
      catch (e) {
        Log.error(e)
        ErrorReporter
          .send({ error: e })
          .catch(Log.error)
      }

      Meteor.call(Config.methods.createUser, args, (err, res) => {
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
    restore: async ({ codes, voice, speed, onError, onSuccess }) => {
      const args = { codes, voice, speed }

      try {
        Log.debug('get device data')
        args.device = await getDeviceData()
      }
      catch (e) {
        Log.error(e)
        e.details = { ...e.details, fn: 'getDeviceData', location: 'restore' }
        await ErrorReporter.send({ error: e })
      }

      Log.debug('restore account', args)

      Meteor.call(Config.methods.restoreUser, args, (err, res) => {
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
      Meteor.call(Config.methods.deleteUser, {}, async (deleteError) => {
        if (deleteError) {
          return onError(deleteError)
        }

        // instead of calling Meteor.logout we
        // directly invoke the logout handler
        if (onSuccess) {
          try {
            await onSuccess()
          }
          catch (e) {
            onError(e)
          }
        }

        Meteor.handleLogout()
        dispatch({ type: 'SIGN_OUT' })
      })
    }
  }), [])

  return { state, user, authContext }
}
