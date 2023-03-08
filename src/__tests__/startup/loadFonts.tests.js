import * as Font from 'expo-font'
import { initFonts } from '../../lib/startup/initFonts'

describe(initFonts.name, function () {
  it('successfully loads at least one font from assets', async () => {
    await initFonts()
    const isLoaded = Font.isLoaded('semicolon')
    expect(isLoaded).toBe(true)
  })
})
