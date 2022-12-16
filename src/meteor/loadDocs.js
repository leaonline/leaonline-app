import { useEffect, useState } from 'react'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'

const MAX_ATTEMPTS = 3

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
 * @return {{data: undefined, error: undefined, loading: boolean}}
 */
export const loadDocs = (fn, { runArgs = [], debug = false } = {}) => {
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      InteractionGraph.problem({
        type: 'loadFailed',
        target: loadDocs.name,
        error: e,
        details: { attempts }
      })
      setError(e)
      setLoading(false)
    })
  }, runArgs)

  return { data, error, loading }
}
