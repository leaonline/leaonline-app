import { createRepository } from '../infrastructure/factories/createRepository'

/**
 * An instance of a Repository, used to store references to all contexts and allows them
 * to be accessed by their `name` attribute.
 *
 * @category contexts
 * @namespace
 * @inheritDoc {Repository}
 */
export const ContextRegistry = createRepository()
