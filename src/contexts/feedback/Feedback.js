import { getCollection } from '../../api/utils/getCollection'
import { SyncState } from '../sync/SyncState'

/**
 * Feedback allows to define specific responses
 * to users after finished test cylces that
 * should motive, depending on the percentual score.
 */
export const Feedback = {
  name: 'feedback',
  label: 'feedback.title',
  icon: 'thumbs-up',
  sync: true
}

Feedback.schema = {
  threshold: {
    type: Number,
    min: 0,
    max: 1
  },
  phrases: {
    type: Array
  },
  'phrases.$': {
    type: String
  }
}

Feedback.methods = {}

const optional = { optional: true }

Feedback.methods.update = {
  name: 'feedback.methods.update',
  backend: true,
  schema: {
    _id: {
      type: String
    },
    threshold: { ...Feedback.schema.threshold, ...optional },
    phrases: { ...Feedback.schema.phrases, ...optional },
    'phrases.$': { ...Feedback.schema['phrases.$'], ...optional }
  },
  run: async function ({ _id, threshold, phrases }) {
    const query = { _id }
    const modifier = { $set: {} }

    if (typeof threshold === 'number') {
      modifier.$set.threshold = threshold
    }

    if (Array.isArray(phrases)) {
      modifier.$set.phrases = phrases
    }

    const updated = await getCollection(Feedback.name).updateAsync(query, modifier)
    await SyncState.update(Feedback.name)
    return updated
  }
}

Feedback.methods.insert = {
  name: 'feedback.methods.insert',
  schema: Feedback.schema,
  backend: true,
  run: async function ({ threshold, phrases }) {
    const insertId = await getCollection(Feedback.name).insertAsync({ threshold, phrases })
    await SyncState.update(Feedback.name)
    return insertId
  }
}

Feedback.methods.get = {
  name: 'feedback.methods.get',
  schema: {
    _id: {
      type: String,
      optional: true
    }
  },
  run: async function ({ _id } = {}) {
    return getCollection(Feedback.name).findOneAsync({ _id })
  }
}

Feedback.methods.getAll = {
  name: 'feedback.methods.getAll',
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
  run: async function () {
    const docs = await getCollection(Feedback.name).find().fetchAsync()
    return {
      [Feedback.name]: docs
    }
  }
}

Feedback.publications = {}
