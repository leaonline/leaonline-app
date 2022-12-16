/**
 * Creates a simple grow-only repository.
 *
 * @param storage {Map} a Map-like object
 * @return {{add: (function(string, *=): *), get: (function(string): any)}}
 */
export const createRepository = (storage = new Map()) => {
  return {
    add: (name, target) => {
      if (storage.has(name)) {
        throw Error(`Entry "${name}" already exists`)
      }

      storage.set(name, target)
      return target
    },
    get: name => storage.get(name),
    has: name => storage.has(name)
  }
}
