Schemas.UserInterests = new SimpleSchema({
  Interests: {
    type: [Object]
  },
  "Interests.$.Map": {
   type: Number,
   optional: true
  },
  "Interests.$.Name": {
   type: String
  },
  "Interests.$.Order": {
   type: Number,
   optional: true
  },
  GraphRelations: {
    type: [Object],
    optional: true
  },
  "GraphRelations.$.Smaller": {
   type: Number
  },
  "GraphRelations.$.Greater": {
    type: Number
  },
  globalId: {
    type: String,
    optional: false
  }

});

// SingleInterestSchema = new SimpleSchema({
//   Map: {
//    type:  Number,
//    optional: true
//   },
//   Order: {
//    type: Number,
//    optional: true
//   },
//   Name: {
//    type: String,
//    optional: false
//   }
// });

// GraphRelationSchema= new SimpleSchema({
//   Smaller: {
//    type: Number,
//    optional: false
//   },
//   Greater: {
//    type: Number,
//    optional: false    
//   }  
// });