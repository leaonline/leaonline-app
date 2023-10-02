export const getInvalidNumbers = () => [
  null,
  undefined,
  '1',
  Number.MAX_VALUE * 2,
  -Number.MAX_VALUE * 2,
  {},
  NaN,
  Infinity,
  () => {},
  true,
  false
]