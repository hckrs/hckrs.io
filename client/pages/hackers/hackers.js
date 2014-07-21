
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
  "hackers": function() { 
    var city = Session.get('currentCity');
    var user = Meteor.user();
    var selector = user.isAdmin || user.ambassador ? {city: city} : {city: city, isHidden: {$ne: true}};
    return city && Meteor.users.find(selector, {sort: {ambassador: -1, createdAt: -1}}).fetch(); 
  },
  "transitionDelay": function() { 
    return Math.random()*1.5; 
  },
});

