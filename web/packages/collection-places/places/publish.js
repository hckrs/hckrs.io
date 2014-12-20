
Meteor.publish("places", function (city) {
  var user = Users.findOne(this.userId);

  if(!user || !Users.allowedAccess(user._id))
    return [];  

  if (city === 'all' && Users.isAdmin(user))
    return Places.find({});      
    
  if (user.city === city || Users.isAdmin(user))
    return Places.find({$or: [{private: false}, {city: city}]});      

  return [];
});