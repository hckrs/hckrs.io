
Places = new Meteor.Collection('places');


Schemas.Place = new SimpleSchema([
  Schemas.default,
  Schemas.userId,
  Schemas.city,
  Schemas.private(false),
  Schemas.hiddenIn,
  {
    "title": {
      type: String,
      optional: true
    },
    "description": {
      type: String,
      optional: true
    },
    "url": {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Url,
      autoValue: AutoValue.prefixUrlWithHTTP,
      autoform: { type: 'url' },
    },
    "type": {
      type: "String",
      optional: true,
      allowedValues: _.pluck(PLACE_TYPE_OPTIONS, 'value'),
      autoform: { 
        options: PLACE_TYPE_OPTIONS 
      },
    },
    "location": {
      type: Object
    },
    "location.lat": {
      type: Number,
      decimal: true
    },
    "location.lng": {
      type: Number,
      decimal: true
    },
  }
]);

Places.attachSchema(Schemas.Place);