
/* Permissions */

// Debug settings; Later this should be expanded upon
//UserInterests.attachSchema(Schemas.UserInterests);
var uiContext = Schemas.UserInterests.namedContext("userInterests");

UserInterests.allow({
	'insert': function(userId, doc) {
		return true
		},
	'remove': function(userId, doc) {
		return true
		},
	'update': function(userId, doc) {
		return true
	}
});
UserInterests.deny({
	'update': function(userId, doc, fieldNames, modifier) {
	    if (modifier.$addToSet)
	    {
	      if (modifier.$addToSet.Interests)
	      {
		  for (entry in doc.Interests)
		  {
		   if (doc.Interests[entry].Name == modifier.$addToSet.Interests.Name)    
		      return true;
		  }
	      }
	    }
	    return false;
	},
	'update': function(userId, doc, fieldNames, modifier) {
// 	  console.log("modifier",modifier);
// 	  console.log("valid",uiContext.validate(modifier,{modifier:true}));
// 	  //console.log('validation?',uiContext.validate(modifier,{modifier:true}),modifier);
// 	  console.log(uiContext.invalidKeys());
	 return !uiContext.validate(modifier,{modifier:true});
	}
  
});