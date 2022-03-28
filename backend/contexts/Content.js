import { ContentServer } from '../api/remotes/content/ContentServer'
import { onServerExec } from '../infrastructure/arch/onServerExec'

/**
 * This is a context, providing methods that simply delegate code to the
 * ContentServer API.
 *
 * It acts as a bridge between the clients and the internal API and intends
 * to prevent direct access to such internals.
 */
export const Content = {
  name: 'content',
  methods: {}
}

/**
 * Returns all relevant data for the home screen
 */
Content.methods.home = {
  name: 'content.methods.home',
  schema: {
    field: {
      type: Boolean,
      optional: true
    },
    dimension: {
      type: Boolean,
      optional: true
    },
    level: {
      type: Boolean,
      optional: true
    }
  },
  run: onServerExec(function () {
    return function ({ field, dimension, level }) {
      return {
        field: field && ContentServer.get({ name: 'field', query: {} }),
        dimension: dimension && ContentServer.get({
          name: 'dimension',
          query: {}
        }),
        level: level && ContentServer.get({ name: 'dimension', query: {} })
      }
    }
  })
}

/**
 * Returns all relevant data for the map screen
 */
Content.methods.map = {
  name: 'content.methods.map',
  schema: {
    fieldId: String,
    level: {
      type: Number,
      optional: true
    }
  },
  run: onServerExec(function () {
    import { MapData } from './map/MapData'

    return function ({ fieldId }) {
      return MapData.get({ field: fieldId })
    }
  })
}

/**
 * Returns all relevant data for a unit
 */
Content.methods.unit = {
  name: 'content.methods.unit',
  schema: {
    unitSetId: String
  },
  run: onServerExec(function () {
    import { Session } from './session/Session'

    return function ({ unitSetId }) {
      const { userId } = this
      return Session.get({ unitSet: unitSetId, userId })
    }
  })
}