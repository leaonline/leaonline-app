import { Log } from '../../infrastructure/Log'
import { Colors } from '../../constants/Colors'

export const getLogData = async () => {
  const stack = await Log.stack()
  return (stack || []).map(([type, timestamp, ...args]) => {
    const color = Log.color(type) ?? Colors.primary
    const message = args.map(arg => {
      if (arg instanceof Error) {
        return JSON.stringify(arg, Object.getOwnPropertyNames(arg))
      }
      try {
        return JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    })
      .join(' ')
    return [color, type, timestamp, message]
  })
}