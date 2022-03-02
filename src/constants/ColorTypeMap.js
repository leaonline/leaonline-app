import Colors from './Colors'

export const ColorTypeMap = {}

ColorTypeMap.get = num => {
  switch(num) {
    case 0: return Colors.primary
    case 1: return Colors.secondary
    case 2: return Colors.success
    case 3: return Colors.warning
    case 4: return Colors.danger
    case 5: return Colors.info
    case 6: return Colors.light
    case 7: return Colors.dark
    default:
      throw new Error(`Unexpected color type ${num}`)
  }
}
