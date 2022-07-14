const cache = new Map()

/**
 * Counts all occurrences of competencies in a given unit document.
 *
 * @param unitDoc {object} the unit document
 * @param log {function=} an
 * @return {*}
 */
export const countUnitCompetencies = ({ unitDoc, log = () => {} }) => {
  if (cache.has(unitDoc._id)) {
    return cache.get(unitDoc._id)
  }

  if (!unitDoc.pages?.length) {
    log('Skip unit', unitDoc.shortCode, ': no pages')
    return 0
  }

  let count = 0
  unitDoc.pages.forEach((page, pageIndex) => {
    if (!page.content?.length) {
      return log('Skip', unitDoc.shortCode, 'page', pageIndex, ': has no content')
    }

    page.content.forEach(entry => {
      if (entry.type !== 'item') return
      const scoring = entry.value?.scoring

      if (!scoring?.length) {
        return log('Skip unit', unitDoc.shortCode, 'page', pageIndex, ': item has no scoring')
      }

      scoring.forEach(score => {
        if (!score.competency) {
          return log('Skip unit', unitDoc.shortCode, 'page', pageIndex, ': item scoring has no competencies')
        }

        // competency can either be a string (single) or an array of strings
        // (multiple) so we need to count them correctly here:
        count += Array.isArray(score.competency)
          ? score.competency.length
          : 1
      })
    })
  })
  cache.set(unitDoc._id, count)
  return count
}
