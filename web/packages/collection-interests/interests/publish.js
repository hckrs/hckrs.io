Meteor.publish("interestcollection", function(searchInput, alreadySelected, limit) {
  
  var options = {sort: [["Count","desc"]], limit: limit};
  //var alreadySelected = [];
  //var user;
  //if (user= StevenInterests.findOne({globalId: userId}))
    //alreadySelected=user.interests;
  
  return (InterestCollection.find(
    {$and:
      [
      {Interest: {$regex: searchInput, $options: 'i'}},
      {Interest: {$nin: alreadySelected}}
      ]
    },
    options));
    
});

Meteor.publish("interestcount", function(searchInput) {
  var self=this;
  check(searchInput, String);
  var count=0;
  var initializing=true;
  
  var handle = InterestCollection.find(
    {Interest: {$regex: searchInput, $options: 'i'}}).observeChanges({
      added: function(id) {
	count++;
	if (!initializing)
	  self.changed("interestcount",searchInput, {count:count});
      },
      removed: function(id) {
	count--;
	if (!initializing)
	  self.changed("interestcount",searchInput, {count:count});
	
      }
    });
    
    initializing=false;
    self.added("interestcount",searchInput,{count:count});
    self.ready();
  
  self.onStop(function () {
    handle.stop()
  });
   // return (InterestCollection.find(
     // {Interest: {$regex: searchInput, $options: 'i'}}).count());    
});
