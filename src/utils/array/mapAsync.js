/**
 * Similar to array map but for async callbacks
 * @param {Array.<*>} array
 * @param {Function} callback
 * @return {Promise.<Array.<*>>}
 */
export const mapAsync = async (array, callback) => {
  const tmp = []
  tmp.length = array.length
  for (let i = 0; i < array.length; i++) {
    tmp[i] = await callback(array[i], i, array)
  }
  return tmp
}
