export class DocNotFoundError extends Meteor.Error {
  constructor (reason, details) {
    super('errors.docNotFound', reason, details)
  }
}
