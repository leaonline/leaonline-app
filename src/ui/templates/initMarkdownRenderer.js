import { Template } from 'meteor/templating'
import { Blaze } from 'meteor/blaze'
import Showdown from 'showdown'
import htmljs from 'meteor/htmljs'

Template.registerHelper(
  'markdown',
  new Template('markdown', function () {
    const HTML = htmljs.HTML
    let content = ''

    if (this.templateContentBlock) {
      content = Blaze._toText(this.templateContentBlock, HTML.TEXTMODE.STRING)
    }
    const converter = new Showdown.Converter()
    return HTML.Raw(converter.makeHtml(content))
  }),
)
