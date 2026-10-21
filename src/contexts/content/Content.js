import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { getCollection } from '../../api/utils/getCollection'

/**
 * This is a context, providing methods that simply delegate code to the
 * ContentServer API.
 *
 * It acts as a bridge between the clients and the internal API and intends
 * to prevent direct access to such internals.
 * @mobile-api
 * @deprecated We keep it alive until the mobile app is EOL
 * @category contexts
 * @namespace
 */
export const Content = {
  name: 'content',
  methods: {},
}

/**
 * Returns all relevant data for the home screen
 */
Content.methods.home = {
  name: 'content.methods.home',
  schema: {
    field: {
      type: Boolean,
      optional: true,
    },
    dimension: {
      type: Boolean,
      optional: true,
    },
    level: {
      type: Boolean,
      optional: true,
    },
  },
  run: onServerExec(() => {
    const { Field } = require('./Field')
    const { Dimension } = require('./Dimension')
    const { Level } = require('./Level')

    return async ({ field, dimension, level }) => ({
      field: field ? await getCollection(Field.name).find().fetchAsync() : [],
      dimension: dimension
        ? await getCollection(Dimension.name).find().fetchAsync()
        : [],
      level: level ? await getCollection(Level.name).find().fetchAsync() : [],
    })
  }),
}

/**
 * Returns all relevant data for the map screen
 */
Content.methods.map = {
  name: 'content.methods.map',
  schema: {
    fieldId: String,
  },
  run: onServerExec(() => {
    const { Meteor } = require('meteor/meteor')
    const { MapData } = require('../map/MapData')
    const {
      notifyUsersAboutError,
    } = require('../../api/errors/notifyUsersAboutError')
    const { DocNotFoundError } = require('../../api/errors/DocNotFoundError')

    return async ({ fieldId }) => {
      const mapData = await MapData.get({ field: fieldId })
      if (!mapData) {
        Meteor.defer(() =>
          notifyUsersAboutError(
            new DocNotFoundError('mapData.notFound', {
              fieldId,
              method: Content.methods.map.name,
            }),
            DocNotFoundError.name,
          ),
        )
        return { empty: true }
      }
      return mapData
    }
  }),
}

/**
 * Returns all relevant data for a current session to load a unit
 */
Content.methods.session = {
  name: 'content.methods.session',
  schema: {
    unitSetId: String,
  },
  run: onServerExec(() => {
    const { Session } = require('../session/Session')

    return function ({ unitSetId }) {
      const { userId } = this
      return Session.get({ unitSet: unitSetId, userId })
    }
  }),
}

/**
 * Loads a raw unit without further data
 */
Content.methods.unit = {
  name: 'content.methods.unit',
  schema: {
    unitId: String,
  },
  run: onServerExec(() => {
    const { Unit } = require('../content/Unit')

    return ({ unitId }) => {
      // TODO return unit only in staging mode
      return getCollection(Unit.name).findOneAsync({ _id: unitId })
    }
  }),
}
