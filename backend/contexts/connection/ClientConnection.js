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
  clientAddress: {
    type: String
  },
  headers: {
    type: Object,
    blackbox: true
  }
}

const connections = new Mongo.Collection(null)
const log = createLog({ name: ClientConnection.name, type: 'log' })

ClientConnection.onConnected = function ({ id, onClose, clientAddress, httpHeaders }) {
  log('on connect', id, clientAddress, httpHeaders)
  const timestamp = new Date()
  connections.upsert({ id }, { id, clientAddress, httpHeaders, timestamp })
  onClose(() => ClientConnection.onDisconnect({ id, clientAddress, httpHeaders }))
}

ClientConnection.onDisconnect = ({ id, clientAddress, httpHeaders }) => {
  log('on disconnect', id, clientAddress, httpHeaders)
  connections.remove({ id })
}

ClientConnection.onLogin = ({ connection, user }) => {
  const id = connection.id
  const userId = user._id
  connections.update({ id }, { userId })
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
  run: function ({ dependencies = {} } = {}) {
    return {
      [ClientConnection.name]: connections.find().fetch()
    }
  }
}