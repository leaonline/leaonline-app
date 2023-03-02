import * as Font from 'expo-font'
import { fetchFonts } from '../../lib/startup/initFonts'

describe(fetchFonts.name, function () {
  it('successfully loads at least one font from assets', async () => {
    await fetchFonts()
    const isLoaded = Font.isLoaded('semicolon')
    expect(isLoaded).toBe(true)
  })
})
