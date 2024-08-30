/**
 * Determines, whether the current screen should render a story.
 * @param sessionDoc
 * @param unitSetDoc
 * @return {boolean}
 */
export const shouldRenderStory = ({ sessionDoc, unitSetDoc }) => {
  if (!sessionDoc || !unitSetDoc) {
    throw new Error('Requires sessionDoc and unitSetDoc')
  }

  // no story when there is a current unit
  // or the session is complete
  // or the unit set has no story
  if (sessionDoc.unit || sessionDoc.completedAt || !unitSetDoc.story?.length) {
    return false
  }

  // only show the story if the upcoming unit is the first in the list
  return sessionDoc.nextUnit === unitSetDoc.units[0]
}
