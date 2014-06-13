// Route Controller

SponsorsController = DefaultController.extend({
  template: 'sponsors',
  waitOn: function () {
    return [ Meteor.subscribe('gifts') ];
  }
});



Template.sponsors.helpers({
  'gifts': function() {
    return Gifts.find().fetch();
  }
})