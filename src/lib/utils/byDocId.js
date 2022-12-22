/**
 * Use to generate a search callback for .find
 * @param _id {string}
 * @return {function(object): boolean}
 */
export const byDocId = _id => (doc = {}) => doc._id === _id
