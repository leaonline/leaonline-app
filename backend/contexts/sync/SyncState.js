import { Random } from 'meteor/random'
import { getCollection } from '../../api/utils/getCollection'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { ContextRegistry } from '../ContextRegistry'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * This context represents the current state of sync. If should be updated
 * after every sync for each synced context in order to provide the app with
 * information, whether to fetch new data or used the locally cached data.
 */
export const SyncState = {
  name: 'syncState',
  methods: {}
}

const log = createLog({ name: SyncState.name })

SyncState.schema = {
  updatedAt: Date,
  name: String,
  hash: String,
  version: Number
}

SyncState.update = name => {
  log('update', name)
  const hash = Random.id(8)
  const updatedAt = new Date()

  return getCollection(SyncState.name).upsert({ name }, {
    $set: { name, updatedAt, hash },
    $inc: { version: 1 }
  })
}

SyncState.get = ({ names }) => getCollection(SyncState.name)
  .find({ name: { $in: names } })
  .fetch()

SyncState.validate = names => {
  names.forEach(name => {
    const ctx = ContextRegistry.get(name)

    if (!ctx || !ctx.sync) {
      throw new Error(`Attempt to sync ${name} but it's not defined for sync!`)
    }
  })
}

SyncState.methods.getHashes = {
  name: 'syncState.methods.getHashes',
  schema: {
    names: Array,
    'names.$': String
  },
  run: onServerExec(function () {
    return function ({ names }) {
      SyncState.validate(names)
      return SyncState.get({ names })
    }
  })
}
