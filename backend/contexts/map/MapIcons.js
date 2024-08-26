import { Field } from '../content/Field'
import { getCollection } from '../../api/utils/getCollection'
import { SyncState } from '../sync/SyncState'

export const MapIcons = {
  name: 'mapIcons',
  label: 'mapIcons.title',
  icon: 'wrench',
  sync: true
}

MapIcons.schema = {
  fieldId: {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
  },
  icons: {
    type: Array
  },
  'icons.$': {
    type: String
  }
}

MapIcons.methods = {}

MapIcons.methods.insert = {
  name: 'mapIcons.methods.insert',
  schema: MapIcons.schema,
  backend: true,
  run: async function ({ fieldId, icons }) {
    const docId = await getCollection(MapIcons.name).insertAsync({ fieldId, icons })
    await SyncState.update(MapIcons.name)
    return docId
  }
}

MapIcons.methods.update = {
  name: 'mapIcons.methods.update',
  schema: {
    _id: {
      type: String
    },
    ...MapIcons.schema
  },
  backend: true,
  run: async function ({ _id, fieldId, icons }) {
    const updated = await getCollection(MapIcons.name).updateAsync({ _id }, {
      $set: { fieldId, icons }
    })
    await SyncState.update(MapIcons.name)
    return updated
  }
}

MapIcons.methods.remove = {
  name: 'mapIcons.methods.remove',
  schema: {
    _id: String
  },
  run: async function ({ _id }) {
    const removed = await getCollection(MapIcons.name).removeAsync({ _id })
    await SyncState.update(MapIcons.name)
    return removed
  }
}

MapIcons.methods.get = {
  name: 'mapIcons.methods.get',
  schema: {
    _id: String
  },
  run: async function ({ _id }) {
    return await getCollection(MapIcons.name).findOneAsync({ _id })
  }
}

MapIcons.methods.getAll = {
  name: 'mapIcons.methods.getAll',
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
  backend: true,
  run: async function ({ dependencies } = {}) {
    return {
      [MapIcons.name]: await getCollection(MapIcons.name).find().fetchAsync(),
      [Field.name]: await getCollection(Field.name).find().fetchAsync()
    }
  }
}
