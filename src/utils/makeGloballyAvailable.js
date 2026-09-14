import { onClientExec } from './archUtils'
export const makeGloballyAvailable = dict => {
  onClientExec(() => {
    for (const [key, value] of Object.entries(dict)) {
      window[key] = value
    }
  })
}
