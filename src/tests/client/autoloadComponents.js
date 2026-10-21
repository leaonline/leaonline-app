import { Meteor } from 'meteor/meteor'
import { Components } from 'meteor/leaonline:ui/components/Components'

Components.autoLoad()
Components.contentPath(Meteor.settings.public.hosts.content.base)
