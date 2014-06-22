// Route Controller
// path: "/ambassador"

AmbassadorController = DefaultController.extend({
  template: 'ambassador',
  waitOn: function () {
    var city = Session.get('currentCity');
    return [ 
      Meteor.subscribe('highlights', city),
      Meteor.subscribe('gifts', city),
    ];
  }
});


Template.ambassadorHackers.helpers({
  'hackers': function() {
    var city = Session.get('currentCity');
    return Users.find({city: city}).fetch();
  }
});

Template.ambassadorHighlights.helpers({
  'highlights': function() {
    return Highlights.find().fetch();
  },
});

Template.ambassadorGifts.helpers({
  'gifts': function() {
    return Gifts.find().fetch();
  },
});