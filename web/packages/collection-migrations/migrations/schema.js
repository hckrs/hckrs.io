
// database migrations on deploying new app versions
// When changing the model the existing database must fit the new model
// After running the migration the data should be up to date.
// This collection stores the already processed migrations
Migrations = new Meteor.Collection('migrations');


Schemas.Migration = new SimpleSchema([
  Schemas.default,
  {
    "processedAt": { // The date this migration is processed
      type: Date
    },
    "name": { // the name of the migration
      type: String
    },
    "status": { // processing status (inProgress|done) 
      type: String
    }
  }
]);


Migrations.attachSchema(Schemas.Migration);
