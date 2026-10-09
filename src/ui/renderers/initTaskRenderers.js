import { ReactiveVar } from 'meteor/reactive-var'
import { TaskRenderers } from './TaskRenderers'
import { LeaMarkdown } from '../../api/markdown/LeaMarkdown'
import { createDefaultRenderer } from './defaultMarkdownRenderer'

// register markdown renderer
const defaultMarkdownRendererName = 'default'
const renderersLoaded = new ReactiveVar()

export const initTaskRenderers = () => {
  if (renderersLoaded.get()) {
    return renderersLoaded
  }

  LeaMarkdown.addRenderer(defaultMarkdownRendererName, createDefaultRenderer)

  TaskRenderers.init({
    markdown: {
      renderer: async txt => {
        const mdOptions = { input: txt, renderer: defaultMarkdownRendererName }
        return LeaMarkdown.parse(mdOptions)
      }
    }
  })
    .then(() => renderersLoaded.set(true))
    .catch(e => console.error(e))

  return renderersLoaded
}
