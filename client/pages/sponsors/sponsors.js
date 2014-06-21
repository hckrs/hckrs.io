// Route Controller

SponsorsController = DefaultController.extend({
  template: 'sponsors',
  waitOn: function () {
    var city = Session.get('currentCity');
    return [ Meteor.subscribe('gifts', city) ];
  }
});



Template.sponsors.helpers({
  'gifts': function() {
    return Gifts.find().fetch();
  },
  'isEmpty': function() {
    return Gifts.find().count() === 0;
  }
})