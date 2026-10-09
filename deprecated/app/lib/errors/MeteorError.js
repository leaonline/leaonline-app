import { hasOwnProp } from '../utils/object/hasOwnProp'

export class MeteorError extends Error {
  /**
   * Checks, whether an object is similar to a MeteorError
   * @param e {object} any error-like object
   * @return {boolean}
   */
  static isLike (e) {
    return e instanceof MeteorError ||
      [
        'error',
        'reason',
        'details',
        'errorType'
      ].every(prop => hasOwnProp(e, prop))
  }

  /**
   * Creates a new MeteorError from a given error e
   * @param e {object} any error-like object
   * @return {MeteorError}
   */
  static from (e) {
    const err = new MeteorError(e.error, e.reason, e.details)

    if (MeteorError.isLike(e)) {
      err.errorType = e.errorType
      err.isClientSafe = e.isClientSafe
    }
    else {
    // native errors or their subclasses
      err.errorType = e.name
      err.message = e.message
    }

    // always copy the stack
    err.stack = e.stack

    return err
  }

  /**
   * @param error {string} error code or name
   * @param reason {string} error message
   * @param details {object|string} string or EJSON-able object
   */
  constructor (error, reason = undefined, details = undefined) {
    super()
    this.errorType = 'Meteor.Error'
    this.error = error
    this.reason = reason

    if (reason) {
      this.message = `${reason} [${error}]`
    }
    else {
      this.message = `[${error}]`
    }

    this.details = details
    this.isClientSafe = true
  }
}
