import { createRepository } from '../infrastructure/factories/createRepository'
import { makeGloballyAvailable } from '../utils/makeGloballyAvailable'

/**
 * An instance of a Repository, used to store references to all contexts and allows them
 * to be accessed by their `name` attribute.
 *
 * @category contexts
 * @namespace
 * @inheritDoc {Repository}
 */
export const ContextRegistry = createRepository()

makeGloballyAvailable({ ContextRegistry })
