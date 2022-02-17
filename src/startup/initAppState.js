import { AppState } from '../infrastructure/AppState'
import { MemoryStorage } from '../infrastructure/MemoryStorage'

AppState.setStorage(MemoryStorage)
