Subscriptions = {};


/* global subscriptions */

var subscriptions = [
  'userData'
];


Subscriptions.init = function() {
  var handles = [];
  Tracker.autorun(function() {
    Meteor.userId(); // trigger
    Tracker.nonreactive(function() {
      Session.set('subscriptionsReady', false);
      _.invoke(handles, 'stop');
      handles = [];
      async.forEach(subscriptions, function(sub, cb) {
        var handle = Meteor.subscribe(sub, cb);
        handles.push(handle);
      }, function() {
        Session.set('subscriptionsReady', true);
      });  
    });
  });
}


Subscriptions.ready = function() {
  return Session.equals('subscriptionsReady', true);
}