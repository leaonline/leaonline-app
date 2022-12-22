import { AppState } from './AppState'
import { Log } from '../infrastructure/Log'

const log = Log.create('saveState')

export const saveState = async ({ key, value }) => {
  log(key)
  return AppState.single(key, value)
}
