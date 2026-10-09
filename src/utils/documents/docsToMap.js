/**
 * Takes an array of documents or document-like objects and
 * creates a Map / WeakMap from it.
 *
 * If no other key is specified in the options, `_id` will be used
 * as default key for the map entries.
 *
 * If not `weak` is explicilty set to `true` a `Map` will be used,
 * otherwise a `WeakMap` is used.
 *
 * @param {Array|Mongo.Cursor} docs
 * @param {string} key
 * @param {boolean} weak
 * @return {Map|WeakMap}
 */
export const docsToMap = (docs, { key = '_id', weak = false } = {}) => {
  const map = weak === true
    ? new WeakMap()
    : new Map()
  docs.forEach(doc => map.set(doc[key], doc))
  return map
}
