export const collectionNotInitialized = ({ name }) => () => {
  throw new Error(`Collection ${name} not initialized`)
}