import { Errors } from '../Errors'

/**
 * Removes errors by given query
 * @param query {object}
 * @return {Promise<number>}
 */
export const removeError = async query => Errors.collection().removeAsync(query)
