var Future = Npm.require("fibers/future");
var Path = Npm.require('path');
var Url = Npm.require('url');


// implementations


//STEVENDINGEN
StevenInterests = new Mongo.Collection("steveninterests");
StevenInterests.allow({
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
StevenInterests.deny({
	'update': function(userId, doc, fieldNames, modifier) {
	    if (modifier.$addToSet)
	    {
	      if (modifier.$addToSet.interests)
	      {
		  for (entry in doc.interests)
		  {
		   if (doc.interests[entry].Name == modifier.$addToSet.interests.Name)    
		      return true;
		  }
	      }
	    }
	    return false;
	}
  
});


StevenInterests.before.insert(function(userId, doc)
{
  //Note: The only way a steveninterest is normally inserted is with one
  //single tag added to it. We're going to check it, just to be sure.
  if (doc.interests.length>0)
  {
      for (i=0;i< doc.interests.length;i++)
      {
	doc.interests[i].Order = i;
	doc.interests[i].Map = i;
      }
  }
  
  
});

StevenInterests.before.update(function(userId, doc, fieldNames, modifier, options)
{
  //oh god
  console.log(fieldNames);
  if (fieldNames[0]=='interests')
  {
         if (modifier.$addToSet)
	 {
	      var offset=1;
	      var highestOrder = 0;
	      var firstMap = 0;
	      var orderedMap = [];	      
	      for (i=0;i<doc.interests.length;i++)
	      {
		  
		  orderedMap.push(doc.interests[i].Map);
		  if (doc.interests[i].Order>=highestOrder)
		    highestOrder = doc.interests[i].Order+1;
	      }
	      orderedMap = orderedMap.sort();	      
	      for (i=0;i<orderedMap.length;i++)
	      {		
		if (orderedMap[i]!=i)	
		{
		    break;
		}
		firstMap=i+1;
	      }	      
	      modifier.$addToSet.interests.Map = firstMap;
	      modifier.$addToSet.interests.Order = highestOrder;	      
	 }
	 if (modifier.$pull)
	 {
	    console.log("Add code to make sure GraphRelations are kept");	   
	 }
  }
  else
  {
      console.log('not interests');    
  }
  
});

StevenInterests.after.update(function(userId, doc, fieldNames, modifier, options) {
  //Always have to recalculate the order!  
  //console.log(fieldNames, modifier)
  
  
  //Code to order everything
      var reorderList = reorderFunction(doc);
      
      var newArray = [];
      for (var i=0;i<doc.interests.length;i++)
      {
	 newArray.push(
	   {Name: doc.interests[i].Name,
	    Map: doc.interests[i].Map,
	    Order: reorderList[doc.interests[i].Map]
	   });	
      }
      console.log(newArray);
  StevenInterests.direct.update({_id: doc._id},
	{
	  $set: {interests: newArray}
	}, function(error,result){
	if (error)
	  console.log(error);
	}
  );
				  
  
  //Update the order 
  StevenInterests.direct.update({_id: doc._id},
	{
	    $push: { interests : 
	      { $each: [], 
		$sort: {Order: 1}, 
		$slice: (-1*doc.interests.length)}
		    }	  
	}, function(error,result){
	if (error)
	    console.log(error);
	}
  );
  
  
});

var reorderFunction = function(doc)
{
  //Result will be an array where each entry of the map will have
  //the correct position of that node
  var retval = [];
  if (!doc.GraphRelations || doc.GraphRelations.length==0)
  {
    for (i = 0; i<doc.interests.length;i++)
    {
	retval[doc.interests[i].Map] = doc.interests[i].Order;         
    }
  }
  else
  {
      var listOfNodes = []
      var listOfRoots = []
      var GraphEdges = [];
      for (var i=0;i<doc.interests.length;i++)
      {
	  listOfNodes.push(doc.interests[i].Map);
	  listOfRoots.push(doc.interests[i].Map);	
	  GraphEdges[doc.interests[i].Map] = [];
      }
      for (var i=0;i<doc.GraphRelations.length;i++)
      {
	  GraphEdges[doc.GraphRelations[i].Greater].push(doc.GraphRelations[i].Smaller);
	  for (var j=0;j<listOfRoots.length;j++)
	  {
	      if (listOfRoots[j]==doc.GraphRelations[i].Smaller)
	      {
		listOfRoots.splice(j,1);
		break;
	      }	    
	  }	
      } 
      console.log("Nodes",listOfNodes);
      console.log("Roots",listOfRoots);
      console.log("Graph",GraphEdges);
      //var longestPath = [];
      var depthArray = []
//       for (i=0;i<listOfRoots.length;i++)
//       {	
// 	//console.log("dit repeat niet");
// 	longestPath[i]=CountChildren(listOfRoots[i],GraphEdges);
//       }
      for (var i=0;i<listOfRoots.length;i++)
      {
	console.log("listofroots",i);
	depthArray = CountDepth(listOfRoots[i],GraphEdges,depthArray);
	
      }
      console.log("depthArray",depthArray);
      
      var rankingList = [];
      var largestTree = 0;
      for (var i=0;i<depthArray.length;i++)
      {
	if (depthArray[i])
	  largestTree = Math.max(largestTree,depthArray[i]);
      }
      console.log("largest tree",largestTree);
      for (var i=-largestTree+1;i<largestTree;i++)
      {
	rankingList[i] = [];	
      }
      var workingNodes = [];
      var passed = [];
      for (var i=0;i<listOfNodes.length;i++)
      {
	passed[listOfNodes[i]] = false;
      }
      console.log(passed);
      for (var i=0;i<listOfRoots.length;i++)
      {
	//console.log(i);
	  var m;
	  var odd;
	  if (depthArray[listOfRoots[i]]%2==0)
	  {
	    odd=false;
	    m= depthArray[listOfRoots[i]]/2;
	    
	  }
	  else
	  {
	    odd=true;
	    m= Math.floor(depthArray[listOfRoots[i]]/2)+1;
	  }
	  workingNodes.push(listOfRoots[i]);
	  while (workingNodes.length>0)
	  {
	    console.log("workingnodes",i,workingNodes);
	      var current = workingNodes.pop();
	      passed[current]=true;
	      var placement;
	      if (odd)
	      {
		placement = ((m-depthArray[current])*2);		
	      }
	      else
	      {
		placement = ((m-depthArray[current])*2 + 1);		
	      }
	      rankingList[placement].push(current);
	      for (j=0;j<GraphEdges[current].length;j++)
	      {
		if (!passed[(GraphEdges[current])[j]])
		  workingNodes.push((GraphEdges[current])[j]);
	      }
	  }
	
      }
      
       var orderedList = [];
      
      for (var i=-largestTree+1;i<largestTree;i++)
      {
	  if (rankingList[i].length>0)
	    {
	      rankingList[i] = rankingList[i].sort();
	    }
	  console.log(i,rankingList[i]);
	  for (j=0;j<rankingList[i].length;j++)
	  {
	      orderedList.push((rankingList[i])[j]);	    
	  }	  
      }
      console.log(orderedList);
      for (i=0;i<orderedList.length;i++)
      {
	  retval[orderedList[i]] = i;
      }
      console.log(retval);
//       for (i = 0; i<doc.interests.length;i++)
//       {
// 	retval[doc.interests[i].Map] = doc.interests[i].Order;         
//       }
  }
  
  return retval;
  
}

// var CountChildren = function(nodeMap, graph)//, depthArray)
// {  
//   //console.log("nm",nodeMap);
//   if (graph[nodeMap] == [])
//     return 1;
//   else
//   {
//       var highestNumber = 0;
//      // console.log(graph[nodeMap]);
//       for (j=0;j<graph[nodeMap].length;j++)
//       {
// 	//console.log("nj",(graph[nodeMap])[j]);
// 	highestNumber= Math.max(highestNumber,CountChildren((graph[nodeMap])[j],graph));
// 	
//       }
//       return highestNumber+1;
//   }
//   
// }

var CountDepth = function(nodeMap, graph, depthArray)
{  
  //console.log("nm",nodeMap);
  if (depthArray[nodeMap])
    return depthArray;
  if (graph[nodeMap] == [])
  {
    depthArray[nodeMap] = 1; 
    return depthArray;
  }
  else
  {
      var highestNumber = 0;
     // console.log(graph[nodeMap]);
      for (var i=0;i<graph[nodeMap].length;i++)
      {
	//console.log("nj",(graph[nodeMap])[j]);
	if (!depthArray[(graph[nodeMap])[i]])
	{
	 // console.log("called countdepth recursively")
	  depthArray = CountDepth((graph[nodeMap])[i],graph,depthArray);	  
	}
	//console.log(nodeMap,i, (graph[nodeMap])[i],depthArray[(graph[nodeMap])[i]]);
	highestNumber = Math.max(highestNumber,depthArray[(graph[nodeMap])[i]]);
	//highestNumber= Math.max(highestNumber,CountChildren((graph[nodeMap])[j],graph));
	
      }
      //console.log(nodeMap, highestNumber);
      depthArray[nodeMap]= highestNumber+1;
      return depthArray;
  }
  
}



Meteor.publish("steveninterests", function(){
    
  return StevenInterests.find();
  
});

this.N4JDB = Meteor.npmRequire('neo4j');
db = new N4JDB.GraphDatabase("http://Interestrelations:0NKzYBRfnnpWQ7f2dSID@interestrelations.sb04.stations.graphenedb.com:24789");

//END STEVENDINGEN




/* server methods */
// these are methods that can be called from the client
// but executed on the server because of the use of private data

Meteor.methods({
  
  //BEGIN STEVEN DINGEN
  'buildTagCollection': function(){
  var log = Assets.getText("Tags.xml"); 
  var parseString = xml2js.parseString;
  parseString(log, function (err, result) {
    console.log("gaatie");
    //for (var hmm in result.tags.row)
    //{
    for (i=0;i<result.tags.row.length;i++)
    {
      var tag = result.tags.row[i].$;
      if (tag.Count>100)
      {
      InterestCollection.insert(
	{
	 Interest: tag.TagName,
	 Count: parseInt(tag.Count),	  
	}, function(error, result){ if (error) {console.log(error);}
	  else {console.log(result);}
	});
      }
      
    }
    console.log("klaar!");
    
     //for (var pff in result.tags.row[1].$)
     //{
	//console.log(pff);
     //}
    //}
     
   });
  },
  
  'nukeCollection': function() {
    InterestCollection.remove({});
  },
  'TestConnection': function(name) {
    console.log(name);
    db.query('CREATE (t:Tag {name:"'+name+'"})',null,function(error,res){
     if (error)
       console.log(error);
    });
  },
  'FillDB': function(tag1, tag2, amount) {
   db.query('MERGE (t:Tag {name:"'+tag1+'"})', null, function(error,res){ 
     if (error)
       console.log(error);
    });
   db.query('MERGE (t:Tag {name:"'+tag2+'"})', null, function(error,res){ 
     if (error)
       console.log(error);
    }); 
   db.query('MATCH (t1:Tag {name:"'+tag1+'"}), (t2:Tag {name:"'+tag2+
   '"}) CREATE (t1)-[r:Relation {count:'+amount+'}]->(t2)',null, function(error,res){ 
     if (error)
       console.log(error);
    }); 
  },
  'DestroyTags': function() {
    db.query('MATCH ()-[r:Relation]-() DELETE r',null, function(error,res){
      if(error)
	console.log(error);
    });
    db.query('MATCH (t:Tag) DELETE t',null, function(error,res){
     if (error)
       console.log(error);
    }
    );    
  },
  'FillTagCollection': function() {
    var log = Assets.getText("Relations.txt");  
    var lines = log.split('\n');
    for (i=0;i<lines.length-1;i++)
    {
      if (i%100==0)
	console.log(i);
      var line = lines[i];
      var splitLine = line.split(',');
      Meteor.call('FillDB',splitLine[0],splitLine[1],parseInt(splitLine[2]));
    }   
    
  },
  'TestQuery': function(tags) {
    var tagsstring = '["';
    for (i=0;i<tags.length;i++)
    {
	if (i>0)
	  tagsstring=tagsstring.concat('","');
	tagsstring=tagsstring.concat(tags[i]);
    }
    tagsstring=tagsstring.concat('"]');
    console.log(tagsstring);
    db.query("MATCH (t:Tag) RETURN t LIMIT 50",null,function(error,result)
    {
     if (error)
     {console.log(error);
       return error;
     }
     else
     {
      console.log(result);
      return result;
     }
    }
    );
    return tagsstring;
  },
  
  
  //END STEVEN DINGEN
  
  'inviteUserAnonymous': function(userId) {
    Users.checkAmbassadorPermission();

    Account.forceInvitationOfUser(userId);
  },


  'inviteUserAmbassador': function(userId) {
    Users.checkAmbassadorPermission();

    var phrase = Users.myProp('invitationPhrase');
    
    if (!phrase || !Match.test(phrase, Number))
      throw new Meteor.Error(500, "invalid phrase");
    
    Account.verifyInvitationOfUser(phrase, userId);
  },


  // search the user that is associated with the given e-mail verification token
  'getEmailVerificationTokenUser': function(token) {
    check(token, String);

    // user fields that can be send to the client
    var fields = {'_id': 1};
    
    // search user associated with this token
    var user = Meteor.users.findOne({'services.email.verificationTokens.token': token}, {fields: fields});

    if (!user)
      throw new Meteor.Error(500, "Unknow verification token");

    return user;    
  },

  'requestWebPageImages': function(query, maxResults) { /* XXX need to INSTALL cheerio */
    Users.checkAdminPermission();

    var url = 'https://www.google.com/search';
    var options = {
      params: {
        'tbm': 'isch', // image search
        'q': encodeURI( query ), // search keyword(s)
        'tbs': 'isz:m' // size medium
      },
      headers: { 'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.73.11 (KHTML, like Gecko) Version/7.0.1 Safari/537.73.11" }
    }
    var images = Meteor.wrapAsync(function(cb) {
      HTTP.get(url, options, function(err, res) {
        if (err || !res || !res.content) return cb(err || 'error');
        var $ = cheerio.load(res.content);
        var $refs = $('img').parent('a').map(function() { return $(this).attr('href'); })
        var refs = _.first($refs.toArray(), maxResults);
        var images = _.map(refs, function(ref) { // photo data in the url
          var data = Url.parse(ref, true).query;
          return {
            src: data.imgurl,
            width: data.w,
            height: data.h
          }; 
        });
        cb(err, images);
      });
    });
    return images;
  }

});



