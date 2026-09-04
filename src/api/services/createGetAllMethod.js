import { onServerExec } from '../../utils/archUtils'
import { getCollection } from '../utils/getCollection'

/**
 * Creates a method to get all documents from a collection.
 * Supports sync state hashes so clients do not need to re-fetch all docs
 * unless sync state has changed
 * @param context {object}
 * @param run {function=}
 * @param backendOnly {boolean=}
 * @param defaultQuery {object=}
 * @return {{schema: {'dependencies.$': (function(String, String)), 'ids.$': (function(String, String)), ids: {optional: boolean, type: ArrayConstructor}, dependencies: {optional: boolean, type: ArrayConstructor}}, name: string, backend: boolean, run: *}}
 */
export const createGetAllMethod = ({ context, run, defaultQuery, backendOnly = true }) => {
  const { name } = context
  return {
    name: `${name}.methods.getAll`,
    backend: backendOnly,
    schema: {
      ids: {
        type: Array,
        optional: true
      },
      'ids.$': String,
      dependencies: {
        type: Array,
        optional: true
      },
      'dependencies.$': Object,
      'dependencies.$.name': String,
      'dependencies.$.query': {
        type: Object,
        optional: true,
      },
    },
    run: onServerExec(() => {
      import  { getCollection } from '../utils/getCollection'

      return run ?? async function ({ ids, dependencies = [] }) {

        // return value
        const output = {}

        // get main documents, if hashes do not match
        const collection = getCollection(name)
        const query = defaultQuery ?? Object.create(null)
        if (ids) query._id = { $in: ids }
        output[name] = await collection.find(query).fetchAsync()

        // dependencies
        for (const dep of dependencies) {
          const depName = dep.name
          const depCollection = getCollection(depName)
          const depQuery = dep.query ?? Object.create(null)
          output[depName] = await depCollection.find(depQuery).fetchAsync()
        }

        return output
      }
    })
  }
}
