/* global __DEV__ */
export const onDev = fn => {
  if (__DEV__) {
    return fn()
  }
}
