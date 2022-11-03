import Meteor from '@meteorrn/core'
import React, { useEffect, useMemo, useReducer } from 'react'
import { AppSessionContext } from './AppSessionContext'

export const AppSession = {}

let currentStorage = null
const { EJSON } = Meteor
const validKeys = ['screen', 'field', 'stage', 'dimension', 'unitSet', 'unit', 'page', 'progress', 'response', 'competencies']
const validateKey = key => {
  if (!validKeys.includes(key)) {
    throw new Error(`Unknown key ${key}, allowed are only ${validKeys.toString()}`)
  }
}

/**
 * Injects a storage and creates all internals that
 * are required to run the App Session.
 * @param storage {Storage}
 * @return {{AppSessionProvider: (function({children: *}))}}
 */
AppSession.init = ({ storage }) => {
  currentStorage = storage
  const initialState = {}
  const { update, restore, remove } = createStorageApi({ storage })

  for (const key of validKeys) {
    initialState[key] = null // TODO async restore somehow
  }

  const createActions = ({ dispatch }) => {
    const actions = {
      multi: (options, onError = console.error) => {
        const stateKeys = Object.keys(options)
        try {
          stateKeys.forEach(key => validateKey(key))
        } catch (e) {
          return onError(e)
        }

        dispatch(options)
      }
    }

    validKeys.forEach(key => {
      actions[key] = (value, onError = console.error) => {
        console.debug('session action', key)
        dispatch({ [key]: value })

        // update in background
        if (value === null || value === undefined) {
          remove(key).catch(onError)
        }
        else {
          update(key, value).catch(onError)
        }
      }
    })
    return actions
  }

  const reducer = (prevState, nextState) => {
    //const stateKeys = Object.keys(nextState)
    //stateKeys.forEach(key => validateKey(key))
    //console.debug('run reducer', stateKeys)
    return {
      ...prevState,
      ...nextState
    }
  }

  const restoreKeys = async () => {
    const state = {}
    for (const key of validKeys) {
      const value = await restore(key)
      if (value !== null) {
        state[key] = value
      }
    }
    console.debug('restored', state)
  }

  const AppSessionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState, undefined)
    const actions = useMemo(() => createActions({ dispatch }), [])

    // at this point we do an initial request, where
    // we try to load non-null values from the storage
    useEffect(() => {
      restoreKeys().catch(console.error)
    }, [])

    return (
      <AppSessionContext.Provider value={[state, actions]}>
        {children}
      </AppSessionContext.Provider>
    )
  }

  return { AppSessionProvider }
}

const createStorageApi = ({ storage }) => {
  const restore = async key => {
    try {
      const value = await storage.getItem(key)
      if (typeof value === 'string') {
        return EJSON.parse(value)
      }
    } catch (e) {
      // todo log error and send to backend
      console.error(e)
    }
    return null
  }

  const update = async (key, value) => {
    const strValue = EJSON.stringify(value)
    return storage.setItem(key, strValue)
  }

  const remove = async (key) => storage.removeItem(key)

  return { restore, update, remove }
}