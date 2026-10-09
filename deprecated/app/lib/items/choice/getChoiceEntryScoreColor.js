import { Colors } from '../../constants/Colors'

/**
 * Returns the color for a scored choice with the following
 * rules:
 *
 * if it's selected, return "right" color if {compareState} is {1},
 * otherwise "wrong" color.
 *
 * if it's not selected but the expected value ({isCompared}) then
 * it's marked as "secondary" color, which choices use to
 * highlight the current selection in non-compare mode.
 *
 * @param isSelected {boolean}
 * @param isCompared {boolean}
 * @param compareState {number=}
 * @return {string}
 */
export const getChoiceEntryScoreColor = ({ isSelected, isCompared, compareState }) => {
  let scoredColor

  // if we have selected correctly
  if (isSelected) {
    scoredColor = compareState === 1
      ? Colors.right
      : Colors.wrong
  }

  // if we have selected the wrong one
  if (!isSelected && isCompared) {
    scoredColor = Colors.secondary
  }

  return scoredColor
}
