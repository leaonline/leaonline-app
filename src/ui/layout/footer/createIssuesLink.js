import { Meteor } from 'meteor/meteor'
import { i18n } from '../../../api/i18n/I18n'

export const createIssuesLink = ({ url }) => {
  const { issueMail } = Meteor.settings.public
  const issuesSubject = encodeURIComponent(i18n.get('issues.subject'))
  const issuesBody = encodeURIComponent(i18n.get('issues.body', { url }))
  return `mailto:${issueMail}?subject=${issuesSubject}&body=${issuesBody}`
}
