import { useEffect, useState } from 'react'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { ErrorReporter } from '../errors/ErrorReporter'
import { Log } from '../infrastructure/Log'
import { isDefined } from '../utils/object/isDefined'
import { asyncTimeout } from '../utils/asyncTimeout'
import { useTranslation } from 'react-i18next'

// TODO move to hooks folder

/**
 * This method is a common wrapper for data loading on any of our Screens.
 * It wraps a (potentially async) loading function with three states:
 *
 * - data/setData => contains the loaded data, once the fn is completed
 * - error/setError => is set, in case an error occurred during invokation
 * - loading/setLoading => indicates, whether the fn is still awaited or completed
 *
 * Awaited means the fn is still in execution (similar to a pending promise)
 * Completed means the fn is resolved and not pending.
 *
 * @param fn {function} the function to actually load data.
 * @param runArgs {array=} optional run args for the internal useEffect
 * @param debug {boolean=} optional boolean flag for debugging
 * @param allArgsRequired {boolean=} optional boolean flag to skip loading until all given args are non-null
 * @param reload {number?} optional count that can invoke a new load cycle, usually incremented when the
 * @param dataRequired {boolean?} optional flag, leading to throw an error, if fn returns null/undefined
 * @param maxAttempts {number?} optional count, allows to run fn multiple times before continueing
 * @return {{data: undefined, error: undefined, loading: boolean}}
 */
export const useDocs = ({
  fn,
  runArgs = [],
  debug = false,
  allArgsRequired = false,
  dataRequired = false,
  reload = 0,
  maxAttempts = 1,
  message
}) => {
  const { t } = useTranslation()
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const [loadMessage, setLoadMessage] = useState()

  useEffect(() => {
    if (message) {
      setLoadMessage(t(message))
    }
  }, [message])

  useEffect(() => {
    if (allArgsRequired && runArgs.some(arg => arg === null)) {
      return
    }


    const loadWrapper = async () => {
      let error
      let attempts = 0

      setLoading(true)
      setError(null)

      // enable states to take effect
      // in consuming components, so users
      // are aware we are (re-)loading
      await asyncTimeout(3000)

      while (attempts < maxAttempts) {
        try {
          return await load()
        } catch (e) {
          error = e
        } finally {
          attempts++
        }
      }
      error.attempts = attempts
      throw error
    }

    const load = async function () {
      const result = await fn(debug)
      if (dataRequired && !isDefined(result)) {
        throw new Error('errors.noDataReceived')
      }
      return result
    }

    loadWrapper()
      .then(result => {
        setData(result)
        setError(null)
      })
      .catch(e => {
        const { attempts = 1 } = e
        e.details = { attempts, env: useDocs.name, fn: String(fn) }
        ErrorReporter.send({ error: e }).catch(Log.error)
        setError(e)
      })
      .finally(() => setLoading(false))
  }, [...runArgs, reload])

  return { data, error, loading, loadMessage }
}
