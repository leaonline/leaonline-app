import { getCollection } from '../../api/utils/getCollection'

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
  run: function ({ _id, threshold, phrases }) {
    const query = { _id }
    const modifier = { $set: {} }

    if (typeof threshold === 'number') {
      modifier.$set.threshold = threshold
    }

    if (Array.isArray(phrases)) {
      modifier.$set.phrases = phrases
    }

    return getCollection(Feedback.name).update(query, modifier)
  }
}

Feedback.methods.insert = {
  name: 'feedback.methods.insert',
  schema: Feedback.schema,
  backend: true,
  run: function ({ threshold, phrases }) {
    return getCollection(Feedback.name).insert({ threshold, phrases })
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
  run: function ({ _id } = {}) {
    return getCollection(Feedback.name).findOne({ _id })
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
  run: function () {
    return {
      [Feedback.name]: getCollection(Feedback.name).find().fetch()
    }
  }
}

Feedback.publications = {}
