Schemas = {}

Schemas.default = new SimpleSchema({
  "createdAt": {
    type: Date,
    autoValue: function() {
      if (this.isInsert) return new Date;
      if (this.isUpsert) return {$setOnInsert: new Date};
      this.unset();
    }
  },
  "updatedAt": {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) return new Date();
    },
    denyInsert: true,
    optional: true
  }
});

Schemas.userId = new SimpleSchema({
  "userId": {
    type: String,
    optional: true,
    autoValue: function() {
      if (this.isFromTrustedCode) return; // not possible
      if (this.isInsert) return Meteor.userId();
      if (this.isUpsert) return {$setOnInsert: Meteor.userId()};
      this.unset();
    }
  }
});

Schemas.city = new SimpleSchema({
  "city": {
    type: String,
    allowedValues: CITYKEYS,
    optional: true,
    autoValue: function() {
      if (this.isFromTrustedCode) return; // not possible
      if (this.isInsert) return Meteor.user().currentCity;
      if (this.isUpsert) return {$setOnInsert: Meteor.user().currentCity};
      this.unset();
    }
  }
});


/* (auto)value modifiers */

AutoValue = {}

// make sure that urls start with http:// or https://
AutoValue.prefixUrlWithHTTP = function() {
  if (this.isSet) 
    return Url.externUrl(this.value)
}


