
// collections
GrowthGithub = new Meteor.Collection('growthGithub');


Schemas.GrowthGithub = new SimpleSchema({

  /* additional fields */
  "city"        :  { type: String },
  "messageId"   :  { type: String, optional: true }, /* ref: Mandrill's message ID (also defined in EmailsOutbound) */
  "open"        :  { type: Boolean, optional: true },
  "clicks"      :  { type: Number, optional: true },
  "invitedAt"   :  { type: Date, optional: true },
  "signupAt"    :  { type: Date, optional: true },
  "userId"      :  { type: String, optional: true },
  

  
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
