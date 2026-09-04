/**
 * Safely checks, whether an object has a certain OWN property.
 * Returns false on properties that are inherited!
 * Use this in favour of obj.hasOwnProperty.
 * @example
 * hasProp({}, 'a') // false
 * hasProp({ a: 1 }, 'a') // true
 * hasProp('foo', toString) // false
 * @category api
 * @module hasProp
 * @param obj {object} the object to check it has an own property
 * @param prop {string} the name of the property
 * @return {boolean}
 */
export const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
