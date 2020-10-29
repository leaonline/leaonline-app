import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import { TestCollection } from '../imports/TestCollection'

Template.body.onCreated(function helloOnCreated() {
  const instance = this
  instance.count = new ReactiveVar(0)

  Meteor.subscribe('allDocs')
  Meteor.call('count', (err, res) => {
    instance.count.set(res)
  })
});

Template.body.helpers({
  docsCount() {
    return Template.instance().count.get();
  },
  allDocs () {
    return TestCollection.find()
  },
  barValue () {
    return Meteor.settings.public.foo
  }
});

Template.body.events({
  'click button'(event, instance) {
    Meteor.call('add')
  },
});
