StevenController = DefaultController.extend({
  template: 'steven',
  waitOn: function () {
    return [];
  },
  onBeforeAction: function() {
    Session.set("intSearchBar","");  
    Session.set("initializedbuttons",false)
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
  ,
  'initializedButtons': function() {
    return Session.get("initializedbuttons");
    
  },
  'preferenceButtons': function() {
    console.log(Session.get("preferencebuttons"));
      return Session.get("preferencebuttons");
  }
}
);

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

Template.OrderedBox.helpers({
  'interest': function() {
      var userId = Meteor.userId();      
      return StevenInterests.findOne({globalId: userId}, {fields: {interests: 1}});
    
  }
  
  
  
});

Template.steven.events({
  "click .testbutton": function(event,template) {
    StevenInterests.remove(event.currentTarget.id);
//    Session.set("intSearchBar",Session.get("intSearchBar"));
  },
  "click .intbutton": function(event, template) {
   // console.log(this);
   //var $elm = $(event.currentTarget);
   var $par = $(event.currentTarget.parentNode);
  // console.log($elm);
   var id = $par.data('id');
   //var int = $elm.data('interest');
   //console.log(int);
   var result = StevenInterests.update({_id:id},{$pull: {interests: {Name: this.Name}}});
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
    },
    "click .initializer": function(event, template) {
	BuildButtons();
    },
    "click .leftbutton": function(event,template){      
	SetPreference(Session.get("preferencebuttons").Left,Session.get("preferencebuttons").Right);
	BuildButtons();
    },
    "click .rightbutton": function(event,template){      
      SetPreference(Session.get("preferencebuttons").Right,Session.get("preferencebuttons").Left);
      BuildButtons();
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
      for (entry in userRecord.interests)
      {	
	userInterests.push(userRecord.interests[entry].Name);
      }
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
      var userInterests=[];
      if (userRecord = StevenInterests.findOne({globalId: Meteor.userId()}))
      {
	for (entry in userRecord.interests)
	{	
	  userInterests.push(userRecord.interests[entry].Name);
	}
      }  
      var val= InterestCollection.find({Interest: {$nin: userInterests}},{sort: [["relationcount","desc"],["Count","desc"]]});     
      return val;

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
    var interests = [];
    for (entry in user.interests)
      interests.push(entry.Name);
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
var BuildButtons = function() {  
 var userRecord;
	if ((userRecord = StevenInterests.findOne({globalId: Meteor.userId()})))
	{
	  var left = Math.floor(Math.random()*(userRecord.interests.length));  
	  var right =Math.floor(Math.random()*(userRecord.interests.length));  
	  while (left==right)
	  {
	    var right =Math.floor(Math.random()*(userRecord.interests.length));  
	  }
	  Session.set("preferencebuttons",{
	    Left: userRecord.interests[left].Name, 
	    Right: userRecord.interests[right].Name});
	}
	else
	{
	    Session.set("preferencebuttons",{Left:"Links",Right: "Rechts"});
	   
	  
	}
	Session.set("initializedbuttons",true); 
  
}

var SetPreference = function(top, bottom) {
  var incompleteTop = true;
  var incompleteBottom = true;
  var topMap;
  var bottomMap;
  var userRecord;
  if ((userRecord=StevenInterests.findOne({globalId: Meteor.userId()})))
  {
      for (i=0;i<userRecord.interests.length;i++)
      {
	if (incompleteTop)
	  if (userRecord.interests[i].Name == top)
	  {
	      topMap = userRecord.interests[i].Map;
	      incompleteTop = false;
	    
	  }
	if (incompleteBottom)
	  if (userRecord.interests[i].Name== bottom)
	  {
	      bottomMap = userRecord.interests[i].Map;
	      incompleteBottom = false;
	    
	  }	
      }   
      if (incompleteTop || incompleteBottom)
      {throw "Can't find one of the two buttons in the list of interests";}
      StevenInterests.update({_id: userRecord._id},
			     {$push: {GraphRelations: {Greater: topMap, Smaller: bottomMap}}}, 
			     function(error,result) {
			       if (error) 
				 console.log(error)
			     });
	
  }
  else
  {
      throw "Geen record?!";
  }
  
}
DBTest = function(name) {
 Meteor.call('TestConnection', name); 
  
}

FillDB = function(tag1,tag2,amt) {
 Meteor.call('FillDB',tag1, tag2, amt); 
  
}

TestDB = function() {
 Meteor.call('FillTagCollection'); 
}

DestroyDB = function() {
 Meteor.call('DestroyTags'); 
  
}
TestQuery = function(tags) {
 Meteor.call('TestQuery',tags, function(error,result)
 {
   if (error)
     console.log(error);
   else
   {
    console.log("result");
   }   
 });
  
}

result = function()
{
 return Session.get("query");
  
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
	  $addToSet: {interests: {Name: interest}}
      }      
    );
    
  }
  else
  {
    StevenInterests.insert({
      globalId: userid
      ,
	interests: [{Name: interest}]
      }
    );
  }
  
}