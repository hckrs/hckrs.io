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
    //return returnRelevantInterests(false).fetch().length;
    return Template.instance().interests(0).count();
    //return null;
  },
  'maxResults': function() { return maxResults;},
  'tooMany': function() {
    return Template.instance().interests(0).count()>maxResults;
    //return false;
    
  },
  'int': function() { 
    //return returnRelevantInterests(true);
    return Template.instance().interests(maxResults);
    //return null;
  },
  'subsReady': function() {
   return Template.instance().ready.get(); 
    
  }
});

Template.steven.events({
  "click .testbutton": function(event,template) {
    StevenInterests.remove(event.currentTarget.id);
  },
  "click .intbutton": function(event, template) {
   var $elm = $(event.currentTarget);
   var $par = $(event.currentTarget.parentNode);
   var id = $par.data('id');
   var int = $elm.data('interest');
   //var id = event.currentTarget.parentNode.classList[1];
   //var int =  event.currentTarget.classList[2];
   var result = StevenInterests.update({_id:id},{$pull: {interests: int}});
   //var allInterests = StevenInterests.findOne({_id: id}).interests;
   //var newInterests = _.without(allInterests, int);
   //console.log(StevenInterests.update({_id:id},{$set: {interests:newInterests}}));
  },
  "click .fillCollBtn": function(event, template) {
    Meteor.call("buildTagCollection",function (error,result){console.log(error,result);});  
  },
   "click .sloop": function(event, template) {
      console.log("Hier komt de sloop!")
      Meteor.call('nukeCollection',function (error,result){console.log(error,result);});
      
     // while(col=InterestCollection.findOne())
      //{
//	console.log("Boem!");
//	InterestCollection.remove({_id:col._id},function(error,result){if(error) {console.log(error);}});
  //    }
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
    var sub = Meteor.subscribe("interestcollection", textEntry, Meteor.userId());
    
    if (sub.ready()){
     instance.ready.set(true); 
    }
    else
    {
     instance.ready.set(false); 
    }
    
  });
  instance.interests = function(limit) {
   return InterestCollection.find({},{limit: limit}); 
    
  }
}

StevenInterests = new Mongo.Collection("steveninterests");
InterestCollection = new Mongo.Collection("interestcollection");

//Meteor.autorun(function() { Meteor.subscribe("steveninterests");});
//Meteor.autorun(function() { Meteor.subscribe("interestcollection");});

var amt=1;
var maxResults=50;


var returnRelevantInterests = function(limited) {
  var options = {};
  if (limited)
    options = {sort: [["Count","desc"]],
		limit: maxResults};
  else		  
    options = {sort: [["Count","desc"]]};
  
  var alreadySelected = [];
  var user;
  if (user = StevenInterests.findOne({globalId: Meteor.userId()}))
  {
      alreadySelected= user.interests;     
  }
  var textEntry = Session.get("intSearchBar");
    if (textEntry==="")
    {
      return (InterestCollection.find(
		{Interest: {$nin: alreadySelected} },
		options)
	     );
    }
    else
    {
      return (InterestCollection.find(
		{$and:
		  [
		    {Interest: {$regex: textEntry, $options: 'i'}},
		    {Interest: {$nin: alreadySelected}}
		  ]
		},
		options)
	     );          
    }
}

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