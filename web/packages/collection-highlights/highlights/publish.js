
// Only publish highlights for the city the user is visiting
Meteor.publish("highlights", function (city) {
  var user = Users.findOne(this.userId);

  if(!user || !Users.allowedAccess(user._id))
    return [];  

  if (city === 'all' && Users.isAdmin(user))
    return Highlights.find({});      

  if (user.city === city || Users.isAdmin(user))
    return Highlights.find({$or: [{private: false}, {city: city}]});      

  return [];
});

// Only publish sortings for the city the user is visiting
Meteor.publish("highlightsSort", function (city) {
  var user = Users.findOne(this.userId);

  if(!user || !Users.allowedAccess(user._id))
    return [];  

  if (user.city === city || Users.isAdmin(user))
    return HighlightsSort.find({city: city}); 

  return [];
});