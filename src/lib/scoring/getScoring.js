/**
 * Delegates scoring to the registered scoring routines for the respective
 * item type.
 *
 * @param itemDoc {object}
 * @param responseDoc {object}
 * @return {Promise<void>}
 */
import { Scoring } from './Scoring'

export const getScoring = async (itemDoc, responseDoc) => {
  try {
    return Scoring.score(itemDoc, responseDoc)
  }
  catch (error) {
    console.error(error)
    return []
  }
}
