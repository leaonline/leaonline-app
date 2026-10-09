import { marked } from 'marked'

export const LeaMarkdown = {}

const renderers = new Map()
const defaultOptions = {
  mangle: false,
  breaks: true,
  gfm: true,
  async: true,
  headerIds: false
}

LeaMarkdown.addRenderer = (name, impl) => {
  renderers.set(name, impl)
}

LeaMarkdown.parse = async ({ input, options, renderer }) => {
  if (!input?.value) return ''
  const { value, ...definitions } = input
  const rendererImpl = renderers.get(renderer).create(definitions)
  return await marked.parse(
    // biome-ignore lint: noMisleadingCharacterClass
    value.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ''),
    {
      ...defaultOptions,
      renderer: rendererImpl
    }
  )
}
