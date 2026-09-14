export const ItemRegistry = {}

const map = new Map()

ItemRegistry.register = (name, obj) => map.set(name, obj)

ItemRegistry.get = name => map.get(name)
