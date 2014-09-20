
/* GIFTS */

Schemas.GithubDump = new SimpleSchema([
  /* to do */
]);

GithubDump = new Meteor.Collection('githubDump');





/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove deals.
// It is only allowed to attach the deals that are visible for this user.

GithubDump.allow({
  insert: function(userId, doc) {
    return hasAdminPermission(userId);
  },
  update: function(userId, doc, fieldNames, modifier) {
    return hasAdminPermission(userId);
  },
  remove: function(userId, doc) {
    return hasAdminPermission(userId);
  }
});



/* Publish */

// Publish the fits that are global and attached to the current city.

if (Meteor.isServer) {

  // Only publish GithubDump for the city the user is visiting
  Meteor.publish("githubDump", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user))
      return [];  

    return GithubDump.find({$and: [ {email: {$exists: true}}
                                  , {email: {$ne: null}}
                                  , {email: {$ne: ""}}
                                  ]
                           });
  });

}







