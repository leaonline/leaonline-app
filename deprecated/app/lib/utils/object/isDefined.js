/**
 * A defined value is defined as not null and not undefined.
 * @param x {*}
 * @return {boolean}
 */
export const isDefined = x => typeof x !== 'undefined' && x !== null
