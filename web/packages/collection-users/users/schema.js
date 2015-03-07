



// ATTENTION: when changing the model, make sure you also change
// the publish, permissions and merging rules in  this file and
// ServicesConfiguration.js

Schemas.User = new SimpleSchema([Schemas.default, {

  /* profile properties */

  "profile": { // user's public profile (visible for other users)
    optional: true,
    type: new SimpleSchema({
      "name": {  // full name of the user
        type: String,
        min: 1,
        max: 30,
      },
      "email": {  // e-mailadress (can be hidden if user want it)
        type: String,
        regEx: SimpleSchema.RegEx.Email
      },
      "skype": { // skype address
        type: String,
        optional: true,
      },
      "phone": { // phone number
        type: String,
        optional: true,
      },
      "picture": {  // url of an avatar for this user
        type: String
      },

      "location": {  // workplace (school / company)
        type: new SimpleSchema({
          lat: {type: Number, decimal: true},
          lng: {type: Number, decimal: true},
        }),
        optional: true
      },
      "homepage": { // external website of user
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true,
        autoValue: AutoValue.prefixUrlWithHTTP
      },
      "company": { // name of company
        type: String,
        optional: true
      },
      "companyUrl": {  // the website of the company
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true,
        autoValue: AutoValue.prefixUrlWithHTTP
      },

      "hacking": {    // array of types (web|apps|software|game|design|life|hardware|opensource|growth)*
        type: [ String ],
        allowedValues: HACKING,
        optional: true
      },
      "available": {  // array with items where user is available for (drink|lunch|email)*
        type: [ String ],
        allowedValues: _.pluck(AVAILABLE_OPTIONS, 'value'),
        optional: true
      },
      "skills": { // array of skill name
        type: [ String ],
        optional: true,
        allowedValues: SKILL_NAMES
      },
      "favoriteSkills": { // skills that are also marked as favorite
        type: [ String ],
        optional: true,
        allowedValues: SKILL_NAMES
      },

      "social": { // urls to user's social service profiles
        optional: true,
        type: new SimpleSchema({
          facebook: {type: String, optional: true},
          twitter: {type: String, optional: true},
          github: {type: String, optional: true},
        }),
      },

      "socialPicture": { // urls to user's social pictures
        type: new SimpleSchema({
          facebook: {type: String, optional: true},
          twitter: {type: String, optional: true},
          github: {type: String, optional: true},
        }),
      },
    })
  },

  /* user properties */

  "city": {             // the city where this hacker is registered to (lowercase)
    type: String,
    allowedValues: City.identifiers()
  },
  "currentCity": {      // the city this (admin) user is visiting
    type: String,
    allowedValues: City.identifiers()
  },
  "globalId": {       // assigned hacker number based on create-account-order of all world hackers
    type: Number
  },
  "invitationPhrase": { // uniq number that used in the invite url that this user can share with others
    type: Number
  },
  "invitations": {      // number of unused invites that this user can use to invite people
    type: Number,
    min: 0
  },

  "emails": {           // user can have multiple e-mailaddressen (internal use only)
    type: [Object],
    optional: true
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {  // e-mailadress is verified by clicking the link in enrollment mail
    type: Boolean
  },

  /* mailing options */

  "mailings": {
    type: [ String ],
    allowedValues: _.pluck(MAILING_OPTIONS, 'value'),
    optional: true
  },


  /* administration details */

  "staff": {         // additional ambassador info
    optional: true,
    type: new SimpleSchema({
      "email": { // ambassador email address @hckrs.io
        type: SimpleSchema.RegEx.Email,
        optional: true
      },
      "title": { // custom title of this ambassador
        type: String,
        optional: true
      },
    }),
  },
  "isAmbassador": {       // only when user is ambassador
    type: Boolean,
    optional: true,
  },
  "isAccessDenied": {      // user isn't allowed to enter the site unless he is invited and profile complete and email verified
    type: Boolean,
    optional: true
  },
  "isUninvited": {         // flag wheter this user is not invited
    type: Boolean,
    optional: true
  },
  "isIncompleteProfile": {     // new users starts with an incomplete profile until user pressed the 'ready' button
    type: Boolean,
    optional: true
  },
  "isHidden": {            // this user isn't visible to others (denied users & admins)
    type: Boolean,
    optional: true
  },
  "isAdmin": {             // true if this user has admin privilege
    type: Boolean,
    optional: true
  },
  "accessAt": {         // moment that user get full access to some city (complete profile & invited)
    type: Date,
    optional: true,
  },
  "isDeleted": {           // mark this account as deleted (probably merged with other account)
    type: Boolean,
    optional: true
  },
  "deletedAt": {              // date of deletion
    type: Date,
    optional: true
  },
  "mergedWith": {           // userId of the user where this accounts is merged with
    type: String,
    optional: true
  },

  /* fields assigned by meteor */

  "services": {           // meteor stores login information here...
    type: Object,
    blackbox: true,
    optional: true,
  },

}]);



// Transformer
Users._transform = function(u) {
  if (u.globalId)
    u.bitHash = Url.bitHash(u.globalId);
  return u;
}






