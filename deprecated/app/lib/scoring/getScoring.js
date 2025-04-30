import { Scoring } from './Scoring'
import { ErrorReporter } from '../errors/ErrorReporter'
import { Log } from '../infrastructure/Log'

/**
 * Delegates scoring to the registered scoring routines for the respective
 * item type.
 *
 * @param itemDoc {object}
 * @param responseDoc {object}
 * @return {Promise<void>}
 */
export const getScoring = async (itemDoc, responseDoc) => {
  try {
    return Scoring.score(itemDoc, responseDoc)
  }
  catch (error) {
    Log.error(error)
    ErrorReporter
      .send({ error })
      .catch(Log.error)
    return []
  }
}
