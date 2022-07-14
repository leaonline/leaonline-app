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
        throw Error(`Item "${name}" already exists`)
      }

      storage.set(name, target)
      return target
    },
    has: name => storage.has(name),
    get: name => storage.get(name),
    all: () => [...storage.values()]
  }
}
