import { useEffect, useState } from 'react'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { ErrorReporter } from '../errors/ErrorReporter'
import { Log } from '../infrastructure/Log'

const MAX_ATTEMPTS = 3

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
 * @return {{data: undefined, error: undefined, loading: boolean}}
 */
export const useDocs = ({ fn, runArgs = [], debug = false, allArgsRequired = false }) => {
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (allArgsRequired && runArgs.some(arg => arg === null)) {
      return
    }

    let attempts = 0
    const load = async function () {
      try {
        const data = await fn(debug)
        setData(data)
        setLoading(false)
      }
      catch (e) {
        attempts++

        if (attempts >= MAX_ATTEMPTS) {
          throw e
        }
        else {
          return load()
        }
      }
    }

    load().catch(e => {
      e.details = { attempts, env: useDocs.name, fn: String(fn) }
      ErrorReporter.send({ error: e }).catch(Log.error)
      InteractionGraph.problem({
        type: 'loadFailed',
        target: useDocs.name,
        error: e,
        details: { attempts }
      })
      setError(e)
      setLoading(false)
    })
  }, runArgs)

  return { data, error, loading }
}
