import { Blaze } from 'meteor/blaze'
import { TTSEngine } from 'meteor/leaonline:corelib/tts/TTSEngine'
import { Template } from 'meteor/templating'
import sinon from 'sinon'
import { createTemplateRenderingContext } from './blazeHelpers.tests'

export const renderedText = (element) =>
  element.textContent.replace(/\s+/g, ' ').trim()

// These are supplied by consuming applications, not by leaonline:ui.
export const createRendererTestContext = () => {
  const context = createTemplateRenderingContext()
  const sandbox = sinon.createSandbox()
  let originalI18n
  let originalLoading

  return {
    ...context,
    sandbox,
    setup() {
      context.setup()
      originalI18n = Blaze._globalHelpers.i18n
      originalLoading = Template.loading
      Template.registerHelper('i18n', (key) => `translated:${key}`)
      Template.loading = new Template('uiTestLoading', () => 'Loading')
      sandbox.stub(TTSEngine, 'isConfigured').returns(false)
    },
    teardown() {
      try {
        context.teardown()
      } finally {
        sandbox.restore()
        if (originalI18n) {
          Template.registerHelper('i18n', originalI18n)
        } else {
          Template.deregisterHelper('i18n')
        }
        if (originalLoading) {
          Template.loading = originalLoading
        } else {
          delete Template.loading
        }
      }
    },
  }
}

export const waitFor = async (predicate, description) => {
  const deadline = Date.now() + 1500
  while (!predicate()) {
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for ${description}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
