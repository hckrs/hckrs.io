
/* Growth */


// collections

GrowthGithub = new Meteor.Collection('growthGithub');


// schemas

Schemas.GrowthGithub = new SimpleSchema({

  /* additional fields */
  "city"        :  { type: String },
  "emailId"     :  { type: String, optional: true }, /* ref: EmailsOutbound */
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


// add schema

GrowthGithub.attachSchema(Schemas.GrowthGithub);


/* Permissions */

// Only admins are allowed to insert/update/remove these collections.

GrowthGithub.allow(ADMIN);



/* Publish */

// Publish the fits that are global and attached to the current city.

if (Meteor.isServer) {

  // publish GrowthGithub
  Meteor.publish("growthGithub", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user) || !city)
      return [];  

    return GrowthGithub.find({city: city,
                            $and: [ {email: {$exists: true}}
                                  , {email: {$ne: null}}
                                  , {email: {$ne: ""}}
                                  ]
                           });
  });

}







