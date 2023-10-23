/**
 * Creates a default handler that throws when called.
 * This indicates an uninitialized collection.
 * @param name {string} name of the parent context
 * @return {function}
 */
export const collectionNotInitialized = ({ name }) => () => {
  throw new Error(`Collection ${name} not initialized`)
}
