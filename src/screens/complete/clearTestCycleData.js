import { AppState } from '../../state/AppState'

export const clearTestCycleData = async () => {
  await AppState.complete(null)
  await AppState.unitSet(null)
}