import { Meteor } from 'meteor/meteor'
import { ErrorBaseSchema } from './ErrorBaseSchema'
import { normalizeError } from '../../api/errors/normalizeError'
import { getCollection } from '../../api/utils/getCollection'
import { notifyUsersAboutError } from '../../api/errors/notifyUsersAboutError'

export const ClientErrors = {
  name: 'clientErrors',
  label: 'clientErrors.title',
  icon: 'exclamation-triangle'
}

ClientErrors.schema = {
  ...ErrorBaseSchema
}

ClientErrors.methods = {}

ClientErrors.methods.send = {
  name: 'clientErrors.methods.send',
  schema: ClientErrors.schema,
  isPublic: true,
  run: async function (options = {}) {
    const userId = this.userId
    const errorDoc = normalizeError({ error: options, userId, stackLength: 3 })
    const errorDocId = await getCollection(ClientErrors.name).insertAsync(errorDoc)
    Meteor.defer(async () => notifyUsersAboutError(errorDoc, 'client'))

    return errorDocId
  }
}
