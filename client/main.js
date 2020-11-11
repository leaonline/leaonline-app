import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TestCollection } from '../imports/TestCollection'
import './main.html';

Template.body.onCreated(function helloOnCreated() {
  const instance = this
  instance.count = new ReactiveVar(0)

  Meteor.subscribe('allDocs')
});

Template.body.helpers({
  docsCount() {
    return TestCollection.find().count()
  },
  allDocs () {
    return TestCollection.find()
  },
  barValue () {
    return Meteor.settings.public.foo
  }
});

Template.body.events({
  'click .add-button'(event, instance) {
    Meteor.call('add')
  },
  'click .remove-button' (event, instance) {
    const _id = instance.$(event.currentTarget).data('id')
    Meteor.call('remove', { _id })
  }
});
