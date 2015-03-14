StevenController = DefaultController.extend({
  template: 'steven',
  waitOn: function () {
    return [];
  },
  onBeforeAction: function() {
    if (!initialized)
    {
      Session.set("intSearchBar","");  
      Session.set("initializedbuttons",false);
      Session.set("notenoughrecords",false);
      Session.set("fullyordered",false);
      Session.set("interestsubnotready",false);
      Session.set("tryinitializebuttons",true);      
      initialized=true;
    }
    this.next();
  },
  subscriptions: function() {
   return [
    Meteor.subscribe("userinterests",Meteor.userId())
  ]    
  }
});

// TEMPLATE DATA
var initialized=false;

Template.steven.helpers({
  'allInfo': function() { return UserInterests.find();},
  'isIntColEmpty': function() { 
    //return (InterestCollection.find().fetch().length===0);}
  return false;}
  ,
  'initializedButtons': function() {
    return Session.get("initializedbuttons");
    
  },
  'preferenceButtons': function() {
    //console.log(Session.get("preferencebuttons"));
      return Session.get("preferencebuttons");
  },
  'recordExists': function() {      
    //console.log(!Session.get("interestsubnotready"));
    return !Session.get("interestsubnotready"); 
    
  },
  'fullyOrdered': function() {       
    return Session.get("fullyordered");  
    
  },
  'notEnoughRecords': function() {
    return Session.get("notenoughrecords");
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
      return UserInterests.findOne({globalId: userId}, {fields: {Interests: 1}});
    
  }
  
  
  
});

Template.steven.events({
  "click .testbutton": function(event,template) {
    UserInterests.remove(event.currentTarget.id);
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
   var result = UserInterests.update({_id:id},{$pull: {Interests: {Name: this.Name}}});
   Session.set("initializedbuttons",false)
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
	Session.set("initializedbuttons",false);
    },
    "click .rightbutton": function(event,template){      
      SetPreference(Session.get("preferencebuttons").Right,Session.get("preferencebuttons").Left);
      Session.set("initializedbuttons",false);
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
   // maxResults=50;
    if (userRecord = UserInterests.findOne({globalId: Meteor.userId()}))
    {
      for (entry in userRecord.Interests)
      {	
	userInterests.push(userRecord.Interests[entry].Name);
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
      if (userRecord = UserInterests.findOne({globalId: Meteor.userId()}))
      {
	for (entry in userRecord.Interests)
	{	
	  userInterests.push(userRecord.Interests[entry].Name);
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
  if (user = UserInterests.findOne({globalId: Meteor.userId()}))
  {
    var re = new RegExp(searchInput,"i");
    var interests = [];
    for (entry in user.Interests)
      interests.push(entry.Name);
    amtUser = _.filter(interests, function(element){
      return re.test(element);      
    }).length;  
    
  }
  return countEntry-amtUser;
    
  }
 instance.autorun( function() {
  if (Session.get("initializedbuttons")==false && Session.get("tryinitializebuttons")==true)
  {
    
      if ((userRecord = UserInterests.findOne({globalId: Meteor.userId()})))
	{
	  var searchResult = searchBestOrderImprovements(userRecord);
	  if (searchResult.hasOwnProperty("Left") && searchResult.hasOwnProperty("Right"))
	  {
	    
	    Session.set("preferencebuttons",searchResult);
	    Session.set("initializedbuttons",true);
	    Session.set("notenoughrecords",false);
	    Session.set("fullyordered",false);
	  }
	  else if (searchResult.hasOwnProperty("NotEnoughRecords"))
	  {
	    Session.set("notenoughrecords",true);	    
	  }
	  else if (searchResult.hasOwnProperty("FullyOrdered"))
	  {
	    Session.set("fullyordered",true); 
	  }
	  Session.set("interestsubnotready",false);

	}
	else
	{
	  
	    Session.set("interestsubnotready",true);
	  
	}
  }
 });
}

var maxResults=50;

InterestCount = new Mongo.Collection("interestcount");
//InterestCollection = new Mongo.Collection("interestcollection");
//Meteor.autorun(function() { Meteor.subscribe("steveninterests");});
//Meteor.autorun(function() { Meteor.subscribe("interestcollection");});

var amt=1;


var searchBarChanged = function(newField) {
  if (newField!==Session.get("intSearchBar"))
  {
      Session.set("intSearchBar",newField);
  }
  
}

var searchBestOrderImprovements = function(doc) {
  if (doc.Interests.length<2)
  {
      return {NotEnoughRecords: 1};
    
  }
  if (!doc.GraphRelations || doc.GraphRelations.length==0)
  {
    var left = Math.floor(Math.random()*(userRecord.Interests.length));  
    var right =Math.floor(Math.random()*(userRecord.Interests.length));  
    while (left==right)
    {
      var right =Math.floor(Math.random()*(userRecord.Interests.length));  
    }
    return { Left: userRecord.Interests[left].Name, 
	    Right: userRecord.Interests[right].Name};         
  }
  else
  {    
      var listOfNodes = [];      
      var GraphEdges = [];
      var ParentEdges = [];
      var listOfNonRelatives = [];
      for (var i=0;i<doc.Interests.length;i++)
      {
	  listOfNodes.push(doc.Interests[i].Map);	  	
	  listOfNonRelatives[doc.Interests[i].Map]=[];
	  GraphEdges[doc.Interests[i].Map] = [];
	  ParentEdges[doc.Interests[i].Map] = [];
      }  
      for (var i=0;i<doc.GraphRelations.length;i++)
      {
	  GraphEdges[doc.GraphRelations[i].Greater].push(doc.GraphRelations[i].Smaller);	  	
      } 
      for (var i=0;i<listOfNodes.length;i++)
      {
	for (var j=0;j<GraphEdges[listOfNodes[i]].length;j++)
	{
	    ParentEdges[(GraphEdges[listOfNodes[i]])[j]].push(listOfNodes[i]);
	}	
      }
      for (var i=0;i<listOfNodes.length;i++)
      {		
	if (GraphEdges[listOfNodes[i]].length==0 && ParentEdges[listOfNodes[i]].length==0)
	{	  
	  continue;
	}
	var passed = [];
	for (var j =0; j<listOfNodes.length;j++)
	{
	  passed[listOfNodes[j]] = false; 	  	  
	}
	passed[listOfNodes[i]]= true;
	var actionlist = [];
	//First we handle children
	for (var j=0;j<GraphEdges[listOfNodes[i]].length;j++)
	{
	    actionlist.push((GraphEdges[listOfNodes[i]])[j]);	  
	}
	
	while (actionlist.length>0)
	{
	  var activeChild = actionlist.pop();
	  passed[activeChild]=true;
	  
	  for (var j=0;j<GraphEdges[activeChild].length;j++)
	  {
	   if (!passed[(GraphEdges[activeChild])[j]])
	   {
	     actionlist.push((GraphEdges[activeChild])[j]);
	   }
	  }	  
	}	
	//Then we handle forefathers
	for (var j=0;j<ParentEdges[listOfNodes[i]].length;j++)
	{	   
	  if (!passed[(ParentEdges[listOfNodes[i]])[j]])
	   {
	    actionlist.push((ParentEdges[listOfNodes[i]])[j]);	
	   }
	}
	//console.log(listOfNodes[i],actionlist, passed);
	while (actionlist.length>0)
	{
	  var activeChild = actionlist.pop();
	  passed[activeChild]=true;
	  for (var j=0;j<ParentEdges[activeChild].length;j++)
	  {
	   if (!passed[(ParentEdges[activeChild])[j]])
	   {
	     actionlist.push((ParentEdges[activeChild])[j]);
	   }
	  }	  
	}
	for (var j=0;j<passed.length;j++)
	{
	  if (passed[j]==false)	    
	    listOfNonRelatives[listOfNodes[i]].push(j);
	  
	}
      }
      //console.log(listOfNonRelatives);
      //Find the nodes with the largest amount of nodes that are not direct relatives
      var largestSize = 0
      for (var i=0;i<listOfNonRelatives.length;i++)
      {
	if (listOfNonRelatives[i])
	{
	  largestSize = Math.max(largestSize,listOfNonRelatives[i].length);
	}
      }      
      if (largestSize == 0)
      {
	return {FullyOrdered:1};
      }
      var largestSizeNodes = []
      for (var i=0;i<listOfNonRelatives.length;i++)
      {
	if (listOfNonRelatives[i])
	  if (listOfNonRelatives[i].length==largestSize)
	    largestSizeNodes.push(i);	
      }      
      var leftpos = Math.floor(Math.random()*(largestSizeNodes.length));  
      var left = largestSizeNodes[leftpos];      
      var rightpos = Math.floor(Math.random()*(listOfNonRelatives[left].length));
      var right = listOfNonRelatives[left][rightpos];      
      var retval = {};
      for (var i=0;i<doc.Interests.length;i++)
      {
	if (doc.Interests[i].Map==left)
	  retval.Left = doc.Interests[i].Name;
	if (doc.Interests[i].Map == right)
	  retval.Right = doc.Interests[i].Name;
      }
      //console.log(retval);
      return retval;
  }
  
  
  
};

var SetPreference = function(top, bottom) {
  var incompleteTop = true;
  var incompleteBottom = true;
  var topMap;
  var bottomMap;
  var userRecord;
  if ((userRecord=UserInterests.findOne({globalId: Meteor.userId()})))
  {
      for (i=0;i<userRecord.Interests.length;i++)
      {
	if (incompleteTop)
	  if (userRecord.Interests[i].Name == top)
	  {
	      topMap = userRecord.Interests[i].Map;
	      incompleteTop = false;
	    
	  }
	if (incompleteBottom)
	  if (userRecord.Interests[i].Name== bottom)
	  {
	      bottomMap = userRecord.Interests[i].Map;
	      incompleteBottom = false;
	    
	  }	
      }   
      if (incompleteTop || incompleteBottom)
      {throw "Can't find one of the two buttons in the list of interests";}
      UserInterests.update({_id: userRecord._id},
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

IntroduceCycle = function() {
 var id = Meteor.userId();
 var gr = UserInterests.findOne({globalId: id}).GraphRelations;
 var flippedCycle = {Greater: gr[0].Smaller, Smaller: gr[0].Greater};
     UserInterests.update({globalId: id},{$push: {GraphRelations: flippedCycle}}, 
   function(error, result) {if (error){console.log(error);}});   
    

  
}

Rerun = function() {
 var asdf = UserInterests.findOne();
  UserInterests.update({_id: asdf._id},{$push: {GraphRelations: {$each: []}}});
  
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
  if ((intId = UserInterests.findOne({globalId: userid})))
  {
    UserInterests.update({_id: intId._id},
      {
	  $addToSet: {Interests: {Name: interest}}
      }, function(error, result){ if(error){console.log(error)}}      
    );
    
  }
  else
  {
    UserInterests.insert({
      globalId: userid
      ,
	Interests: [{Name: interest}]
      }, function(error, result){ if(error){console.log(error)}}
    );
  }
  
}