import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { marked, Renderer } from 'marked'
import { Random } from 'meteor/random'

export const createDefaultRenderer = {
  create: (userOptions) => new DefaultRenderer(userOptions)
}

class DefaultRenderer extends Renderer {
  constructor (userOptions) {
    super()
    this.userOptions = userOptions
  }

  heading (data) {
    const { tokens, depth } = data
    const text = this.parser.parseInline(tokens)
    return `<h${depth} class="lea-text">${text}</h${depth}>`
  }

  paragraph ({ tokens } /*, level */) {
    const text = this.parser.parseInline(tokens)
    return `<p class="lea-text">${text}</p>`
  }

  strong ({ tokens }) {
    const text = this.parser.parseInline(tokens)
    return `<span class="lea-text-bold">${text}</span>`
  }

  text ({ tokens, text }) {
    const txt = tokens
      ? this.parser.parseInline(tokens)
      : text
    const tts = !tokens && this.userOptions.useTTS
      ? createTTS(txt)
      : ''
    return tts
      ? `${tts} ${txt}`
      : txt
  }
}

const createTTS = (tokens) => {
  let text
  if (Array.isArray(tokens)) {
    text = tokens.reduce((acc, token) => {
      if (typeof token.text === 'string') {
        return acc + token.text
      }
      return acc
    }, '')
  }
  if (typeof tokens === 'string') {
    text = tokens
  }
  if (!text) {
    console.warn('Could not create TTS text for tokens', tokens)
    return ''
  }
  const ttsId = `markdown-tts-${Random.id(6)}`
  setTimeout(() => {
    const parent = document.querySelector(`#${ttsId}`)
    Blaze.renderWithData(Template.soundbutton, {
      text,
      outline: true,
      sm: true,
      type: 'secondary',
      class: 'border-0'
    }, parent)
  }, 1000)
  return `<span id="${ttsId}"></span>`
}

const defaultOptions = {
  mangle: false,
  breaks: true,
  gfm: true,
  async: true,
  headerIds: false
}

export const MarkdownRenderer = {}

MarkdownRenderer.render = async (data) => {
  if (!data?.value) return ''
  const { value, ...options } = data
  const renderer = new DefaultRenderer(options)
  return await marked.parse(
    // biome-ignore lint: noMisleadingCharacterClass
    value.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ''),
    {
      ...defaultOptions,
      renderer
    }
  )
}
