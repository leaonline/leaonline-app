import { Mongo } from 'meteor/mongo'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * Stores active connection with mobile clients.
 * Data is only stored in RAM and is cleared on restart.
 */
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

/**
 * Returns the underlying MongoDB connection.
 * @return {Mongo.Collection}
 */
ClientConnection.collection = () => connections

const connections = new Mongo.Collection(null)
const log = createLog({ name: ClientConnection.name, type: 'log' })

/**
 * Stores the current connection's credentials in the DB until clients disconnect.
 * @param id
 * @param onClose
 * @param clientAddress
 * @param httpHeaders
 * @return {Promise<void>}
 */
ClientConnection.onConnected = async function ({ id, onClose, clientAddress, httpHeaders = {} }) {
  log('on connect', id, clientAddress, httpHeaders['user-agent'])
  const timestamp = new Date()
  await connections.upsertAsync({ id }, { $set: { id, clientAddress, httpHeaders, timestamp } })
  onClose(() => ClientConnection.onDisconnect({ id, clientAddress, httpHeaders }))
}

/**
 * Registers a handler to remote the DB entry when clients disconnect from the server
 * @param id
 * @param clientAddress
 * @param httpHeaders
 * @return {Promise<void>}
 */
ClientConnection.onDisconnect = async ({ id, clientAddress, httpHeaders }) => {
  log('on disconnect', id, clientAddress, httpHeaders)
  await connections.removeAsync({ id })
}

/**
 * Registers a handler that updates the entry
 * when clients have authenticated successfully
 * @param connection
 * @param user
 * @return {Promise<void>}
 */
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
