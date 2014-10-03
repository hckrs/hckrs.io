
/* Growth */


// collections

GithubDump = new Meteor.Collection('githubDump');
GrowthMessages = new Meteor.Collection('growthMessages');
GrowthSubjects = new Meteor.Collection('growthSubjects');


// schemas

Schemas.GithubDump = new SimpleSchema({

  /* additional fields */
  "city"        :  { type: String },
  "batchId"     :  { type: String, optional: true },
  "invitedAt"   :  { type: Date, optional: true },
  "signupAt"    :  { type: Date, optional: true },
  
  /* original github fields */
  "id"          :  { type: Number },
  "username"    :  { type: String },
  "email"       :  { type: String },
  "avatarUrl"   :  { type: String },
  "createdAt"   :  { type: Date },
  "updatedAt"   :  { type: Date },
  "followers"   :  { type: Number },
  "following"   :  { type: Number },
  "repos"       :  { type: Number },
  "gists"       :  { type: Number },
  "hireable"    :  { type: Boolean },
  "biography"   :  { type: String, optional: true },
  "name"        :  { type: String, optional: true },
  "website"     :  { type: String, optional: true },
  "company"     :  { type: String, optional: true },
  "location"    :  { type: String, optional: true },

});

Schemas.GrowthMessages = new SimpleSchema([ /* to do */ ]);
Schemas.GrowthSubjects = new SimpleSchema([ /* to do */ ]);


// add schema

GithubDump.attachSchema(Schemas.GithubDump);


/* Permissions */

// Only admins are allowed to insert/update/remove these collections.

GithubDump.allow(ADMIN);
GrowthMessages.allow(ADMIN);
GrowthSubjects.allow(ADMIN);



/* Publish */

// Publish the fits that are global and attached to the current city.

if (Meteor.isServer) {

  // publish GithubDump
  Meteor.publish("githubDump", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user) || !city)
      return [];  

    return GithubDump.find({city: city,
                            $and: [ {email: {$exists: true}}
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







