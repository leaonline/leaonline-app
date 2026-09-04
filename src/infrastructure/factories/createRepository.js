/**
 * Creates a simple grow-only in-memory repository.
 *
 * @param storage {Map} a Map-like object
 * @return {Repository} instance of the Repository class
 */
export const createRepository = (storage = new Map()) => new Repository(storage)

/**
 * Represents a simple in-memory repository for targets, to be stored by name.
 * Use a map implementation as storage.
 * This is a grow-only repo. Targets can be added only once for a given name and
 * cannot be deleted!
 *
 * @class
 */
class Repository {
  /**
   * Creates a new Repository
   * @constructor
   * @param  {Map} storage should implement the Map interface
   */
  constructor (storage) {
    this.storage = storage
  }

  /**
   * Adds a new target object to the repository
   * @method
   * @param name {string}
   * @param target {object}
   * @throws {Error} if target already exists by name
   * @return {object} the added target
   */
  add (name, target) {
    if (this.storage.has(name)) {
      throw Error(`Item "${name}" already exists`)
    }

    this.storage.set(name, target)
    return target
  }

  /**
   * Checks, whether a target exists by name
   * @param name {string} name / storage key
   * @return {boolean} true/false
   */
  has (name) {
    return this.storage.has(name)
  }

  /**
   * Access a target by name
   * @param name {string} name / storage key
   * @return {object|undefined} the target or undefined, if not in storage
   */
  get (name) {
    return this.storage.get(name)
  }

  /**
   * Returns all target objects in storage
   * @return {Array<Object>} an array of all target objects
   */
  all () {
    return [...this.storage.values()]
  }
}
