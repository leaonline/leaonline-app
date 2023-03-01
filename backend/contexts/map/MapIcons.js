import { Field } from '../content/Field'
import { getCollection } from '../../api/utils/getCollection'

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
    return getCollection(MapIcons.name).insert({ fieldId, icons })
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
    return getCollection(MapIcons.name).update({ _id }, { fieldId, icons })
  }
}

MapIcons.methods.remove = {
  name: 'mapIcons.methods.remove',
  schema: {
    _id: String
  },
  run: function ({ _id }) {
    return getCollection(MapIcons.name).remove({ _id })
  }
}

MapIcons.methods.get = {
  name: 'mapIcons.methods.get',
  schema: {
    fieldId: String
  },
  run: function ({ fieldId }) {
    return getCollection(MapIcons.name).findOne({ fieldId })
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
  run: function () {
    const data = { [MapIcons.name]: getCollection(MapIcons.name).find().fetch() }
    data[Field.name] = getCollection(Field.name).find().fetch()
    return data
  }
}
