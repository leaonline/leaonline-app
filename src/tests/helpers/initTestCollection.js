import { getCollection } from '../../api/utils/getCollection'
import { createCollection } from '../../infrastructure/factories/createCollection'

export const initTestCollection = ctx => {
  const existingCollection = getCollection(ctx.name)
  if (existingCollection) {
    return existingCollection
  }
  return createCollection(ctx)
}
