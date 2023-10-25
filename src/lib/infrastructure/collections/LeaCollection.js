/**
 * Wrapper for Meteor Mongo Collection
 * and to promisify their calls.
 */
export class LeaCollection {
  constructor ({ name, collection, isLocal }) {
    this.name = name
    this._name = name
    this.collection = collection
    this.isLocal = isLocal
  }

  find (selector, options) {
    return this.collection.find(selector, options)
  }

  findOne (selector, options) {
    return this.collection.findOne(selector, options)
  }

  /**
   *
   * @async
   * @param doc {object}
   * @return {Promise<string>}
   */
  insert (doc) {
    const { collection, isLocal } = this
    return new Promise((resolve, reject) => {
      const callback = getCallback(isLocal, resolve, reject)
      const id = collection.insert(doc, callback)
      return isLocal && resolve(id)
    })
  }

  update (id, modifier, options) {
    const { collection, isLocal } = this
    return new Promise((resolve, reject) => {
      const callback = getCallback(isLocal, resolve, reject)
      const updated = collection.update(id, modifier, options, callback)
      return isLocal && resolve(updated)
    })
  }

  remove (id) {
    const { collection, isLocal } = this
    return new Promise((resolve, reject) => {
      const callback = getCallback(isLocal, resolve, reject)
      const removed = collection.remove(id, callback)
      return isLocal && resolve(removed)
    })
  }
}

const getCallback = (isLocal, res, rej) => isLocal
  ? () => {}
  : (err, res) => err ? rej(err) : res(res)
