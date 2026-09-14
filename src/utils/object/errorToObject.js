export const errorToObject = (error) => {
  return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error), 0))
}
