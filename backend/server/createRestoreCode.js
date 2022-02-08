import { Random } from 'meteor/random'

const internal = {
  length: 4,
  uppercase: true,
  forbidden: /[0oq17ij5s]+/gi,
  maxRetries: 50
}

export const createRestoreCode = () => {
  let count = 0
  let isValid = false
  let code = undefined

  while (!isValid && count++ < internal.maxRetries) {
    code = Random.id(internal.length)
    isValid = internal.forbidden.test(code) === false
  }

  return internal.uppercase
    ? code.toUpperCase()
    : code
}
