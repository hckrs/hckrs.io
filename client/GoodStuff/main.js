// Session variables
Session.set('initialLoad', true);
Session.set('today', new Date());
Session.set('view', 'top');
Session.set('postsLimit', getSetting('postsPerPage', 10));
Session.set('settingsLoaded', false);
Session.set('sessionId', Meteor.default_connection._lastSessionId);

// Subscriptions

// note: here we only subscribe to subscriptions that we need to be available all the time.
// For subscriptions depending on specific pages, see the router. 

// TODO: add session variable that tracks when all global subscriptions have loaded


// Categories
Meteor.subscribe('categories');


// Subscribe to all users for now to make user selection autocomplete work
Meteor.subscribe('allUsersAdmin');

// Notifications - only load if user is logged in
// Not mandatory, because server won't publish anything even if we try to load.
// Remember about Deps.autorun - user can log in and log out several times
Deps.autorun(function() {
  // userId() can be changed before user(), because loading profile takes time
  if(Meteor.userId()) {
    Meteor.subscribe('notifications');
  }
})

STATUS_PENDING=1;
STATUS_APPROVED=2;
STATUS_REJECTED=3;

