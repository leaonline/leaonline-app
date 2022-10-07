import { AppState } from '../../state/AppState'

export const collectScoreForComplete = async (score) => {
  console.debug('collectScoreForComplete', score)
  if (score === true) {
    await AppState.complete(1)
  }
}
