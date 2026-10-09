/**
 * @deprecated
 * */
export const Analytics = {
  name: 'analytics'
}

Analytics.schema = {
  timestamp: Date,
  userId: String,
  type: String,
  name: String,
  message: String,
  details: {
    type: Object,
    blackbox: true
  }
}

Analytics.methods = {}

Analytics.methods.send = {
  name: 'analytics.methods.send',
  schema: {
    logs: Array,
    'logs.$': String
  },
  run: async function () {
    return [] // we don't implement this way anymore but keep compat with the api
  }
}
