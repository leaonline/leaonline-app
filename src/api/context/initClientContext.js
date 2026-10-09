import { createCollection } from '../../infrastructure/factories/createCollection'
import { ContextRegistry } from '../../contexts/ContextRegistry'
import 'meteor/aldeed:collection2/static'

const created = new Set()

/**
 * Lightweight initialization for contexts on the client-side.
 *
 * @param context {object} a context definition object
 * @param debug {function}
 * @return {object} the transformed context
 */
export const initClientContext = (context, debug = console.debug) => {
  if (created.has(context.name)) {
    return context
  }

  createCollection(context, debug)
  created.add(context.name)
  ContextRegistry.add(context.name, context)

  return context
}
