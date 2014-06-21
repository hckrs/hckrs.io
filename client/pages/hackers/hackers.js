
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
  "hackers": function() { return Meteor.users.find().fetch(); },
  "transitionDelay": function() { return Math.random()*1.5; },
  "totalHackers": function() { 
    return Meteor.users.find().count() || ''; 
  },
});

