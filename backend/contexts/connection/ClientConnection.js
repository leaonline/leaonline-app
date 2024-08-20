import { Mongo } from 'meteor/mongo'
import { createLog } from '../../infrastructure/log/createLog'

export const ClientConnection = {
  name: 'clientConnection',
  label: 'clientConnection.title',
  icon: 'mobile'
}

ClientConnection.schema = {
  id: {
    type: String
  },
  timestamp: {
    type: Date
  },
  clientAddress: {
    type: String
  },
  headers: {
    type: Object,
    blackbox: true
  },
  userId: {
    type: String,
    optional: true
  },
  isDev: {
    type: String,
    optional: true
  },
  isBackend: {
    type: String,
    optional: true
  }
}

ClientConnection.collection = () => connections

const connections = new Mongo.Collection(null)
const log = createLog({ name: ClientConnection.name, type: 'log' })

ClientConnection.onConnected = async function ({ id, onClose, clientAddress, httpHeaders = {} }) {
  log('on connect', id, clientAddress, httpHeaders['user-agent'])
  const timestamp = new Date()
  await connections.upsertAsync({ id }, { $set: { id, clientAddress, httpHeaders, timestamp } })
  onClose(() => ClientConnection.onDisconnect({ id, clientAddress, httpHeaders }))
}

ClientConnection.onDisconnect = async ({ id, clientAddress, httpHeaders }) => {
  log('on disconnect', id, clientAddress, httpHeaders)
  await connections.removeAsync({ id })
}

ClientConnection.onLogin = async ({ connection = {}, user = {} }) => {
  log('on login', connection.id, '=>', user._id)
  const id = connection.id
  const userId = user._id
  const isDev = !!user.isDev
  await connections.updateAsync({ id }, { $set: { userId, isDev } })
}

ClientConnection.methods = {}
ClientConnection.methods.getAll = {
  name: 'clientConnection.methods.all',
  backend: true,
  schema: {
    dependencies: {
      type: Array,
      optional: true
    },
    'dependencies.$': {
      type: Object,
      blackbox: true,
      optional: true
    }
  },
  run: async function (/* { dependencies = {} } = {} */) {
    const { userId } = this
    const docs = await connections.find({ userId: { $ne: userId } }).fetchAsync()
    return {
      [ClientConnection.name]: docs
    }
  }
}
