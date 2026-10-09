/**
 * Determines, if an object owns a property directly (ignores inherited props).
 * @param obj
 * @param prop
 * @return {boolean}
 */
export const hasOwnProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
