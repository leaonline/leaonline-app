import { getCollection } from '../../api/utils/getCollection'
import { createIdSet } from '../../api/utils/createIdSet'

class DependencyBuilder {
  constructor () {
    this.added = new Map()
    return this
  }
  
  add (ctx, ...fieldNames) {
    if (!this.added.has(ctx.name)) {
      this.added.set(ctx.name, fieldNames)
    }
    return this
  }

  output(target) {
    this.destination = target
    return this
  }

  run({ docs, dependencies }) {
    if (!docs?.length || !dependencies?.length) {
      return
    }

    dependencies.forEach(dep => {
      const { name } = dep
      const fieldNames = this.added.get(name)
      if (fieldNames) {
        const collection = getCollection(name)
        const $in = [...createIdSet(docs, ...fieldNames)]
        const selector = { _id: { $in }}
        this.destination[name] = collection.find(selector).fetch()
      }
    })
  }
}

export const onDependencies = () => {
  return new DependencyBuilder()
}
