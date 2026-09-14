import { Errors } from '../Errors'

/**
 * Returns a single error by given query
 * @param query {object}
 * @return {Promise<*>}
 */
export const getError = async query => Errors.collection().findOneAsync(query)
