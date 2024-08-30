import { AppSession } from '../state/AppSession'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getSessionSchema } from '../state/getSessionSchema'

export const initAppSession = () => {
  return AppSession.init({
    storage: AsyncStorage,
    schema: getSessionSchema()
  })
}
