/**
 * Should be thrown on any unexpected errors that are related to the connection
 * between this app and one of the server applications.
 *
 * @extends {Error}
 */
export class ConnectionError extends Error {

  /**
   * Use the message for the main error message.
   * Messages should not be in plain text but an i18n compatible
   * codename.
   *
   * Examples are:
   *
   * - notConnected
   * - connectionTimeout
   * - connectionAborted
   *
   * @param message {string} the error message as i18n compatible code
   * @param details {object?} optional, EJSON-able object
   */
  constructor (message, details = undefined) {
    super()

    this.name = 'ConnectionError'
    this.message = message
    this.details = details
  }
}
