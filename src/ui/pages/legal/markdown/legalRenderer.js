import { i18n } from '../../../../api/i18n/I18n'
import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { Renderer } from 'marked'

export const legalRenderer = () => {
  return new LegalRenderer()
}

class LegalRenderer extends Renderer {
  constructor (options) {
    super(options)
    this.count = 0
  }

  heading (text) {
    return `<span class="lea-text-bold">${text}</span>`
  }

  paragraph (text /*, level */) {
    const transformed = text
      .replace(/§§/g, i18n.get('pages.legal.paragraphs'))
      .replace(/§/g, i18n.get('pages.legal.paragraph'))
      .replace(/<[^>]*>/g, '')

    const id = `sound-${this.count++}`

    setTimeout(() => {
      const parent = document.querySelector(`#${id}`)
      Blaze.renderWithData(Template.soundbutton, {
        text: transformed,
        outline: true,
        sm: true,
        type: 'secondary',
        class: 'border-0'
      }, parent)
    }, 1000)

    return `<p class="lea-text-sm"><span id="${id}"></span>${text}</p>`
  }
}
