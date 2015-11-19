



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
