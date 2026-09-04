/**
 * Use as generic .map callback
 * @param doc {object} a mongo document
 * @return {string} the _id value of the doc
 */
export const toDocId = doc => doc._id
