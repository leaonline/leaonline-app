import { getCollection } from '../../api/utils/getCollection'
import { createIdSet } from '../../api/utils/createIdSet'

class DependencyBuilder {
  constructor ({ allowEmptyDocs = false, allowEmptyDeps = false } = {}) {
    this.added = new Map()
    this.allowEmptyDocs = allowEmptyDocs
    this.allowEmptyDeps = allowEmptyDeps
    return this
  }

  add (ctx, ...fieldNames) {
    if (!this.added.has(ctx.name)) {
      this.added.set(ctx.name, fieldNames)
    }
    return this
  }

  output (target) {
    this.destination = target
    return this
  }

  async run ({ docs, dependencies }) {
    const skipDocs = !docs?.length && !this.allowEmptyDocs
    const skipDeps = !dependencies?.length && !this.allowEmptyDeps
    if (skipDocs || skipDeps) {
      return
    }
    for (const dep of dependencies) {
      const { name } = dep
      const fieldNames = this.added.get(name)
      if (fieldNames) {
        const collection = getCollection(name)
        const $in = [...createIdSet(docs, fieldNames)]
        const selector = { _id: { $in } }
        this.destination[name] = await collection.find(selector).fetchAsync()
      }
    }
  }
}

export const onDependencies = (options) => {
  return new DependencyBuilder(options)
}
