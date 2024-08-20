import { Dimension } from '../content/Dimension'
import { Field } from '../content/Field'
import { getCollection } from '../../api/utils/getCollection'
import { SyncState } from '../sync/SyncState'

export const Order = {
  name: 'order',
  label: 'order.title',
  icon: 'list-ol',
  isConfigDoc: true,
  sync: true
}

Order.schema = {
  fields: {
    type: Array
  },
  'fields.$': {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
  },
  dimensions: {
    type: Array
  },
  'dimensions.$': {
    type: String,
    dependency: {
      collection: Dimension.name,
      field: Dimension.representative
    }
  }
}

Order.methods = {}

Order.methods.update = {
  name: 'order.methods.update',
  backend: true,
  schema: {
    _id: {
      type: String
    },
    ...Order.schema
  },
  run: async function ({ _id, ...orderDoc }) {
    const selector = { _id }
    const modifier = { $set: orderDoc }
    const updated = await getCollection(Order.name).updateAsync(selector, modifier)
    await SyncState.update(Order.name)
    return updated
  }
}

Order.methods.get = {
  name: 'order.methods.get',
  isPublic: true,
  schema: {
    _id: {
      type: String,
      optional: true
    },
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
  run: async function ({ _id /*, dependencies */ }) {
    return getCollection(Order.name).findOneAsync()
  }
}

Order.publications = {}

Order.init = async function init () {
  const OrderCollection = getCollection(Order.name)

  if (await OrderCollection.countDocuments({}) === 0) {
    await OrderCollection.insertAsync({
      field: [],
      fields: []
    })
  }
}
