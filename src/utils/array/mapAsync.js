/**
 * Similar to array map but for async callbacks
 * @param array {*[]}
 * @param callback {function}
 * @return {Promise<*[]>}
 */
export const mapAsync = async (array, callback) => {
  const tmp = []
  tmp.length = array.length
  for (let i = 0; i < array.length; i++) {
    tmp[i] = await callback(array[i], i, array)
  }
  return tmp
}
