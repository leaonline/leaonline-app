import { createLog } from '../log/createLog'

/**
 * This mixin injects useful generic functions into the method or publication
 * environment (the funciton's this-context).
 *
 * @param options
 * @return {*}
 */
export const environmentExtensionMixin = function (options) {
  const { env } = options
  if (env === null || env === false) { return options }

  const log = createLog({ name: options.name })
  const runFct = options.run

  options.run = function run (...args) {
    // safe-assign our extensions to the environment document
    Object.assign(this, { log })

    log('call', { userId: this.userId })
    return runFct.call(this, ...args)
  }

  return options
}
