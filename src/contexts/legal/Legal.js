import { getCollection } from '../../api/utils/getCollection'
import { SyncState } from '../sync/SyncState'
import { hasProp } from '../../api/utils/hasProp'

export const Legal = {
  name: 'legal',
  label: 'legal.title',
  icon: 'info',
  sync: true,
  isConfigDoc: true
}

Legal.schema = {
  imprint: {
    type: String,
    label: 'legal.imprint',
    richText: true,
    optional: true
  },
  privacy: {
    type: String,
    label: 'legal.privacy',
    richText: true,
    optional: true
  },
  terms: {
    type: String,
    label: 'legal.terms',
    richText: true,
    optional: true
  },
  contact: {
    type: String,
    label: 'legal.contact',
    richText: true,
    optional: true
  }
}

Legal.methods = {}

Legal.methods.update = {
  name: 'legal.methods.update',
  backend: true,
  schema: {
    _id: {
      type: String
    },
    imprint: Legal.schema.imprint,
    privacy: Legal.schema.privacy,
    terms: Legal.schema.terms,
    contact: Legal.schema.contact
  },
  run: async function ({ _id, imprint, privacy, terms, contact }) {
    const updated = await getCollection(Legal.name).updateAsync(_id, { $set: { imprint, privacy, terms, contact } })
    await SyncState.update(Legal.name)
    return updated
  }
}

Legal.methods.get = {
  name: 'legal.methods.get',
  isPublic: true,
  schema: {
    _id: {
      type: String,
      optional: true
    },
    name: {
      type: String,
      optional: true,
      allowedValues: Object.keys(Legal.schema)
    }
  },
  run: async function ({ name } = {}) {
    const config = await getCollection(Legal.name).findOneAsync()
    if (!name || !config) {
      return config
    }
    if (hasProp(config, name)) {
      return config[name]
    }
  }
}

Legal.publications = {}
