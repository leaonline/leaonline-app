import { Field } from '../content/Field'
import { getCollection } from '../../api/utils/getCollection'
import { SyncState } from '../sync/SyncState'
import { createIdSet } from '../../api/utils/createIdSet'
import { onDependencies } from '../utils/onDependencies'

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
  run: function ({ fieldId, icons }) {
    const docId = getCollection(MapIcons.name).insert({ fieldId, icons })
    SyncState.update(MapIcons.name)
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
  run: function ({ _id, fieldId, icons }) {
    const updated = getCollection(MapIcons.name).update({ _id }, {
      $set: { fieldId, icons }
    })
    SyncState.update(MapIcons.name)
    return updated
  }
}

MapIcons.methods.remove = {
  name: 'mapIcons.methods.remove',
  schema: {
    _id: String
  },
  run: function ({ _id }) {
    const removed = getCollection(MapIcons.name).remove({ _id })
    SyncState.update(MapIcons.name)
    return removed
  }
}

MapIcons.methods.get = {
  name: 'mapIcons.methods.get',
  schema: {
    _id: String
  },
  run: function ({ _id }) {
    return getCollection(MapIcons.name).findOne({ _id })
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
  run: function ({ dependencies } = {}) {
    const docs = getCollection(MapIcons.name).find().fetch()
    const data = { [MapIcons.name]: docs }

    onDependencies()
      .add(Field, 'fieldId')
      .output(data)
      .run({ dependencies, docs })

    return data
  }
}
