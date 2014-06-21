
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
    return (city && Meteor.users.find({city: city}).count()) || ''; 
  },
  "hackers": function() { 
    var city = Session.get('currentCity');
    return city && Meteor.users.find({city: city}).fetch(); 
  },
  "transitionDelay": function() { 
    return Math.random()*1.5; 
  },
});

