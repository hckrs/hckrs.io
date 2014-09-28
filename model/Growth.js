
/* Growth */


// collections

GithubDump = new Meteor.Collection('githubDump');
GrowthMessages = new Meteor.Collection('growthMessages');
GrowthSubjects = new Meteor.Collection('growthSubjects');


// schemas

Schemas.GithubDump = new SimpleSchema([ /* to do */ ]);
Schemas.GrowthMessages = new SimpleSchema([ /* to do */ ]);
Schemas.GrowthSubjects = new SimpleSchema([ /* to do */ ]);




/* Permissions */

// Only admins are allowed to insert/update/remove these collections.

GithubDump.allow(ADMIN);
GrowthMessages.allow(ADMIN);
GrowthSubjects.allow(ADMIN);



/* Publish */

// Publish the fits that are global and attached to the current city.

if (Meteor.isServer) {

  // publish GithubDump
  Meteor.publish("githubDump", function () {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user))
      return [];  

    return GithubDump.find({$and: [ {email: {$exists: true}}
                                  , {email: {$ne: null}}
                                  , {email: {$ne: ""}}
                                  ]
                           });
  });

  // publish GrowthMessages
  Meteor.publish("growthMessages", function () {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user))
      return [];  

    return GrowthMessages.find();
  });

  // publish GrowthSubjects
  Meteor.publish("growthSubjects", function () {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user))
      return [];  

    return GrowthSubjects.find();
  });

}







