import { Meteor } from 'meteor/meteor'

class DocNotFoundError extends Meteor.Error {
  constructor (name, details) {
    super(`${name}.error`, DocNotFoundError.reason, details)
  }
}

DocNotFoundError.reason = 'errors.docNotFound'

export { DocNotFoundError }
