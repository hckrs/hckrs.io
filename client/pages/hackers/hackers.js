
// Route Controller

HackersController = DefaultController.extend({
  template: 'hackers',
  waitOn: function () {
    return [ 
      Meteor.subscribe('invitations'),
    ];
  }
});


/* HACKERS list */

// bind hackers to template
Template.hackers.helpers({
  "totalHackers": function() {
    var city = Session.get('currentCity');
    return (city && Meteor.users.find({city: city, isHidden: {$ne: true}}).count()) || ''; 
  },
  "hackerViews": function() { 
    var transitionDelay = 0;
    var getUserView = function(u) {
      var user = userView(u._id);
      user.transitionDelay = Math.min(transitionDelay, 3);
      transitionDelay += 0.2
      return user;
    }
    var city = Session.get('currentCity');
    var selector = hasAmbassadorPermission() ? {city: city} : {city: city, isHidden: {$ne: true}};
    return city && Users.find(selector, {fields: {_id: 1}, sort: {ambassador: -1, createdAt: -1}}).map(getUserView); 
  }
});

