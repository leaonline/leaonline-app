import { AppState } from '../state/AppState'
// import AsyncStorage from '@react-native-async-storage/async-storage'
import { MemoryStorage } from '../state/MemoryStorage'

export const initAppState = async () => {
  await AppState.init(MemoryStorage)
}
