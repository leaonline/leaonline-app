/**
 * Use to generate a callback for certain array methods,
 * such as .find or .filter
 * @param _id {string} the _id value to target
 * @return {function(object): boolean}
 */
export const byDocId = _id => (doc = {}) => doc._id === _id
