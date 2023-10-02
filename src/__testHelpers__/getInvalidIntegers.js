import { getInvalidNumbers } from './getInvalidNumbers'

export const getInvalidIntegers = () => getInvalidNumbers().concat([
  -1.1,
  0.2 + 0.1,
  Number.MAX_SAFE_INTEGER + 1,
  -Number.MAX_SAFE_INTEGER - 1,
])