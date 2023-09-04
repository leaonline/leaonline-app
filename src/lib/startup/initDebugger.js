import Reactotron, { networking }  from 'reactotron-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

Reactotron
  .setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
  .configure({
    name: "lea.App",
    host: Config.host,
  })
  .useReactNative()
  .use(networking())
  .connect()
