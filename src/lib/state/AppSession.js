import React, { useEffect, useMemo, useReducer } from 'react'
import { AppSessionContext } from './AppSessionContext'
import { Log } from '../infrastructure/Log'
import { createStorageAPI } from './createStorageAPI'
import { createSessionValidator } from '../startup/createSessionValidator'


/**
 * Contains the state for an app's current session.
 * @type {object}
 */
export const AppSession = {}

const debug = Log.create('AppSession', 'debug')

/**
 * Injects a storage and creates all internals that
 * are required to run the App Session.
 * @param storage {Storage}
 * @param schema {object}
 * @return {{AppSessionProvider: (function({children: *}))}}
 */
AppSession.init = ({ storage, schema }) => {
  const initialState = {}
  const validator = createSessionValidator({ schema })
  const storageAPI = createStorageAPI({ storage })
  const sessionKeys = Object.keys(schema)

  for (const key of sessionKeys) {
    initialState[key] = null // TODO async restore somehow
  }

  const createActions = ({ dispatch }) => ({
    update: async (doc) => {
      const keys = Object.keys(doc)
      const key = keys[0]
      const value = doc[key]

      debug('action', `(${key})`, value)

      if (value === null || value === undefined) {
        validator.validateKey(key)
        await storageAPI.remove(key)
      }
      else {
        validator.validateDoc({ [key]: value })
        await storageAPI.update(key, value)
      }

      dispatch({ [key]: value })
    },
    multi: async (options) => {
      debug('action (multi)', options)
      validator.validateDoc(options)
      await storageAPI.updateMulti(options)
      dispatch(options)
    }
  })

  const reducer = (prevState, nextState) => {
    debug('run reducer', nextState)
    // const stateKeys = Object.keys(nextState)
    // stateKeys.forEach(key => validateKey(key))
    return {
      ...prevState,
      ...nextState
    }
  }

  const restoreKeys = async () => {
    const state = {}
    for (const key of sessionKeys) {
      const value = await storageAPI.restore(key)
      if (value !== null) {
        state[key] = value
      }
    }
  }

  const getInitialState = () => ({ ...initialState })

  const AppSessionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, getInitialState(), undefined)
    const actions = useMemo(() => createActions({ dispatch }), [])

    useEffect(() => {
      console.debug('<<<<<<<<<<< STATE CHANGED >>>>>>>>>>>')
      console.debug(JSON.stringify(state, null, 2))
    }, [state])

    // at this point we do an initial request, where
    // we try to load non-null values from the storage
    useEffect(() => {
      restoreKeys().catch(Log.error)
    }, [])

    return (
      <AppSessionContext.Provider value={[state, actions]}>
        {children}
      </AppSessionContext.Provider>
    )
  }

  return { AppSessionProvider }
}



