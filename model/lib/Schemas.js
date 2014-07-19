Schemas = {}

Schemas.default = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) return new Date;
      if (this.isUpsert) return {$setOnInsert: new Date};
      this.unset();
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) return new Date();
    },
    denyInsert: true,
    optional: true
  }
});

Schemas.userId = new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      if (this.isInsert) return Meteor.userId();
      if (this.isUpsert) return {$setOnInsert: Meteor.userId()};
      this.unset();
    }
  }
});

Schemas.city = new SimpleSchema({
  city: {
    type: String,
    autoValue: function() {
      if (this.isInsert) return Meteor.user().currentCity;
      if (this.isUpsert) return {$setOnInsert: Meteor.user().currentCity};
      this.unset();
    }
  }
});