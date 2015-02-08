StevenController = DefaultController.extend({
  template: 'steven',
  waitOn: function () {
    return [];
  },
  onBeforeAction: function() {
    Session.set("intSearchBar","");  
    this.next();
  },
  subscriptions: function() {
   return [
    Meteor.subscribe("steveninterests")
    //Meteor.subscribe("interestcollection",50,"",meteor.userId())
  ]    
  }
});

// TEMPLATE DATA


Template.steven.helpers({
  'allInfo': function() { return StevenInterests.find();},
  'isIntColEmpty': function() { 
    //return (InterestCollection.find().fetch().length===0);}
  return false;}
});

Template.InterestBox.helpers({
  'amtInt': function() { 
    return Template.instance().accurateInterestCount();
    //return returnRelevantInterests(false).fetch().length;
    //var countEntry = InterestCount.findOne();
    //return countEntry.count;
    //return Template.instance().interests().count();
    //return null;
  },
  'maxResults': function() { return maxResults;},
  'tooMany': function() {
      return Template.instance().accurateInterestCount()>maxResults;
    //var countEntry = InterestCount.findOne();
    //return countEntry.count>maxResults;
    //return false;
    
  },
  'int': function() {     
    return Template.instance().interests();
  },
  'subsReady': function() {
   return Template.instance().ready.get(); 
    
  }
});

Template.steven.events({
  "click .testbutton": function(event,template) {
    StevenInterests.remove(event.currentTarget.id);
//    Session.set("intSearchBar",Session.get("intSearchBar"));
  },
  "click .intbutton": function(event, template) {
   var $elm = $(event.currentTarget);
   var $par = $(event.currentTarget.parentNode);
   var id = $par.data('id');
   var int = $elm.data('interest');
   var result = StevenInterests.update({_id:id},{$pull: {interests: int}});
  },
  "click .fillCollBtn": function(event, template) {
    Meteor.call("buildTagCollection",function (error,result){console.log(error,result);});  
  },
   "click .sloop": function(event, template) {
      console.log("Hier komt de sloop!")
      Meteor.call('nukeCollection',function (error,result){console.log(error,result);});
   },
    "keyup .intSearch": function(event, template) {
     searchBarChanged(event.target.value);
      
    },    
    "click .clearSearchbar": function(event, template) {
      $sbar = $("#searchBar");
      $sbar.val("");
      searchBarChanged("");
    }
});

Template.InterestBox.events({
  "click .interestfield": function(event, template) {
     addInterest(event,template); 
    }  
  
});

Template.InterestBox.created = function() {
  
  var instance = this;
 
  instance.ready = new ReactiveVar(false);
  
  
  instance.autorun(function() {
    
    var textEntry = Session.get("intSearchBar");
    var userRecord;
    var userInterests=[];
    if (userRecord = StevenInterests.findOne({globalId: Meteor.userId()}))
    {
	userInterests = userRecord.interests;
    }
    
    var sub = Meteor.subscribe("interestcollection", 
	textEntry, userInterests, maxResults);
    if (sub.ready()){
     instance.ready.set(true); 
    }
    else
    {
     instance.ready.set(false); 
    }
    
    Meteor.subscribe("interestcount", textEntry);
    
  });
  
  
  
  instance.interests = function() {
     return InterestCollection.find({},{sort: [["Count","desc"]]});

  }
  
  instance.accurateInterestCount = function() {
  var countCol = InterestCount.findOne();
  var countEntry =0;
  if (countCol)
  {
    countEntry = countCol.count;
  }
  var searchInput = Session.get("intSearchBar");
  var amtUser = 0;
  var user;
  if (user = StevenInterests.findOne({globalId: Meteor.userId()}))
  {
    var re = new RegExp(searchInput,"i");
    var interests =  user.interests;
    amtUser = _.filter(interests, function(element){
      return re.test(element);      
    }).length;  
    
  }
  return countEntry-amtUser;
    
  }
  
}


StevenInterests = new Mongo.Collection("steveninterests");
InterestCount = new Mongo.Collection("interestcount");
//InterestCollection = new Mongo.Collection("interestcollection");
//Meteor.autorun(function() { Meteor.subscribe("steveninterests");});
//Meteor.autorun(function() { Meteor.subscribe("interestcollection");});

var amt=1;
var maxResults=50;

var searchBarChanged = function(newField) {
  if (newField!==Session.get("intSearchBar"))
  {
      Session.set("intSearchBar",newField);
  }
  
}

var addInterest = function(evt, template) {
  var $elm = $(evt.currentTarget);
  var interest = $elm.data('interest');
  var userid = Meteor.userId();
  var intId;
  if ((intId = StevenInterests.findOne({globalId: userid})))
  {
    StevenInterests.update({_id: intId._id},
      {
	  $addToSet: {interests: interest}
      }      
    );
    
  }
  else
  {
    StevenInterests.insert({
      globalId: userid
      ,
	interests: [interest]
      }
    );
  }
  
}