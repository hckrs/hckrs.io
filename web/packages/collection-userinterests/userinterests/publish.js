
Meteor.publish("userinterests", function(userId){
    
  return UserInterests.find({globalId: userId});
  
});