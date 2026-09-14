/**
 * Takes a list of expected "correct" responses and compares all
 * selected ones with the list.
 *
 * Detects, if selections were correct and/or
 * if selections are missing.
 *
 * This works for item types that involve selection as main
 * interaction, like {Choice} or {Highlight} and for "single",
 * as well as "multiple" variations.
 *
 * @param correctResponses {number[]}
 * @param selected {object}
 * @return {object}
 */
export const getCompareValuesForSelectableItems = ({ correctResponses, selected }) => {
  const result = {}

  // part 1 - check if all correct ones were selected
  correctResponses.forEach(index => {
    result[index] = selected[index] === true
      ? 1 // right
      : -1 // missing
  })

  // part 2 - check if others were selected that shouldn't be
  Object.entries(selected).forEach(([index, value]) => {
    if (value && result[index] === undefined) {
      result[index] = 0 // wrong
    }
  })

  return result
}
