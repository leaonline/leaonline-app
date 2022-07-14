import Colors from '../../constants/Colors'

/**
 * This helper is used to determine the current compare state of a
 * response value and what should be displayed to the user.
 *
 * There are basically three types:
 *
 * -1 (missing): the response value is empty or __undefined__
 *  0 (wrong): the response has been scored as false
 *  1 (right): the response has been scored as true
 *
 *  This does not account multiple scores for a single response, which
 *  is to be solved by the item-specific implementations.
 */
export const CompareState = {}

const colors = {
  '-1': Colors.missing,
  0: Colors.wrong,
  1: Colors.right
}

/**
 * Get the compare value for a given single response value and score.
 * @param score
 * @param responseValue
 * @return {number}
 */
CompareState.getValue = (score, responseValue) => {
  if (responseValue === '__undefined__') {
    return -1
  }

  return score ? 1 : 0
}

/**
 * Returns the corresponding color value for a given compare value
 * @param compareValue
 * @return {*}
 */
CompareState.getColor = (compareValue) => colors[compareValue]
