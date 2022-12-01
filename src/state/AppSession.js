import Meteor from '@meteorrn/core'
import React, { useEffect, useMemo, useReducer } from 'react'
import { AppSessionContext } from './AppSessionContext'
import { Log } from '../infrastructure/Log'

/**
 * Contains the state for an app's current session.
 * @type {object}
 */
export const AppSession = {}

const { EJSON } = Meteor
const validKeys = ['screen', 'field', 'stage', 'dimension', 'unitSet', 'unit', 'page', 'progress', 'response', 'competencies', 'loadUserData']
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
  const initialState = {}
  const { update, restore, remove, updateMulti } = createStorageApi({ storage })

  for (const key of validKeys) {
    initialState[key] = null // TODO async restore somehow
  }

  const createActions = ({ dispatch }) => {
    const actions = {
      multi: (options, onError = Log.error) => {
        const stateKeys = Object.keys(options)
        try {
          stateKeys.forEach(key => validateKey(key))
        }
        catch (e) {
          return onError(e)
        }

        dispatch(options)

        updateMulti(options).catch(onError)
      }
    }

    validKeys.forEach(key => {
      actions[key] = (value, onError = Log.error) => {
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
    // const stateKeys = Object.keys(nextState)
    // stateKeys.forEach(key => validateKey(key))
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
  }

  const AppSessionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState, undefined)
    const actions = useMemo(() => createActions({ dispatch }), [])

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

const createStorageApi = ({ storage }) => {
  const restore = async key => {
    try {
      const value = await storage.getItem(key)
      if (typeof value === 'string') {
        return EJSON.parse(value)
      }
    }
    catch (e) {
      Log.error(e)
    }
    return null
  }

  const update = async (key, value) => {
    const strValue = EJSON.stringify(value)
    return storage.setItem(key, strValue)
  }

  const remove = async (key) => storage.removeItem(key)

  const updateMulti = async (options) => {
    const entries = Object.entries(options)
    const removePairs = entries.filter(([key, value]) => value === null)
    const updatePairs = entries.filter(([key, value]) => value !== null)

    if (removePairs.length > 0) {
      await storage.multiRemove(removePairs.map(toRemovePairs))
    }
    if (updatePairs.length > 0) {
      await storage.multiSet(updatePairs.map(toStoragePairs))
    }
  }

  return { restore, update, remove, updateMulti }
}

const toRemovePairs = pair => pair[0]
const toStoragePairs = ([key, value]) => {
  return [key, JSON.stringify(value)]
}
