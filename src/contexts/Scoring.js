import { Scoring } from 'meteor/leaonline:corelib/scoring/Scoring'

Scoring.init()
  .catch(e => console.error(e))

export { Scoring }
