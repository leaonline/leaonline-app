import { getCollection } from '../../api/utils/getCollection'
import { Unit } from '../content/Unit'

export const DevData = {
  name: 'devData'
}

DevData.methods = {}

DevData.methods.get = {
  name: 'devData.methods.get',
  schema: {},
  run: async function () {
    // TODO return only to dev accounts
    const units = await getCollection(Unit.name).find({}).mapAsync(({ _id, shortCode }) => ({ _id, shortCode }))
    return { units }
  }
}
