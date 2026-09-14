export const ScoringTypes = {

  /**
   * Most strict scoring, only an exact match of all values in the given set
   * lead to a true score.
   */
  all: {
    name: 'all',
    value: 1,
    label: 'scoring.requires.all'
  },

  /**
   * Scores to true if any of the given values occur. Very loose but also
   * very beginner friendly.
   */
  any: {
    name: 'any',
    value: 2,
    label: 'scoring.requires.any'
  },

  /**
   * Requires any of a given set. Values outside of the set will evaluate
   * the whole score to false.
   */
  allInclusive: {
    name: 'all',
    value: 3,
    label: 'scoring.requires.allInclusive'
  }
}
