/**
 * Safely checks, whether an object has a certain property.
 * Use this in favour of obj.hasOwnProperty.
 *
 * @method
 * @param obj {object} the object to check it has an own property
 * @param prop {string} the name of the property
 * @return {boolean}
 */
export const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
