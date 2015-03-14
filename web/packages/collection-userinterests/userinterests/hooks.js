
UserInterests.before.insert(function(userId, doc)
{
  //Note: The only way a steveninterest is normally inserted is with one
  //single tag added to it. We're going to check it, just to be sure.
  if (doc.Interests.length>0)
  {
      for (i=0;i< doc.Interests.length;i++)
      {
	doc.Interests[i].Order = i;
	doc.Interests[i].Map = i;
      }
  }
  
  
});

UserInterests.before.update(function(userId, doc, fieldNames, modifier, options)
{
  if (fieldNames[0]=='Interests')
  {
         if (modifier.$addToSet)
	 {
	      var offset=1;
	      var highestOrder = 0;
	      var firstMap = 0;
	      var orderedMap = [];	      
	      for (var i=0;i<doc.Interests.length;i++)
	      {
		  
		  orderedMap.push(doc.Interests[i].Map);
		  if (doc.Interests[i].Order>=highestOrder)
		    highestOrder = doc.Interests[i].Order+1;
	      }
	      orderedMap = orderedMap.sort();	      
	      for (var i=0;i<orderedMap.length;i++)
	      {		
		if (orderedMap[i]!=i)	
		{
		    break;
		}
		firstMap=i+1;
	      }	      
	      modifier.$addToSet.Interests.Map = firstMap;
	      modifier.$addToSet.Interests.Order = highestOrder;	      
	 }
	 if (modifier.$pull)
	 {	    
	    var removedMap = 0;
	    var foundMap = false;
	    for (var i=0;i<doc.Interests.length;i++)
	    {
		if (doc.Interests[i].Name==modifier.$pull.Interests.Name)
		{
		    removedMap = doc.Interests[i].Map;
		    foundMap = true;
		    break;
		}	      
	    }
	    if (!foundMap)
	    {
	      console.log("Couldn't find map");
	      return;
	    }
	    var smaller = [];
	    var greater = [];
	    for (var i=0; i<doc.GraphRelations.length;i++)
	    {
		if (doc.GraphRelations[i].Greater==removedMap)
		{
		  smaller.push(doc.GraphRelations[i].Smaller);
		  
		}
		else if(doc.GraphRelations[i].Smaller == removedMap)
		{
		  greater.push(doc.GraphRelations[i].Greater);		  
		}
	    }
	    UserInterests.direct.update({_id:doc._id},{$pull: 
	      {GraphRelations: {$or: [{Greater:removedMap},
	      {Smaller: removedMap}]}}
// 	      {$or:
// 	      [{GraphRelations: {Greater: removedMap}},
// 	      {GraphRelations: {Smaller: removedMap}}]
	    }, function(error,result) {if (error) console.log(error);});
	    var newRelations = [];
	    for (var i=0;i<greater.length;i++)
	    {
	     for (var j=0;j<smaller.length;j++)
	     {
	      newRelations.push({Greater: greater[i], Smaller: smaller[j]});	       
	     }	      
	    }
	    UserInterests.direct.update({_id:doc._id},{$addToSet: { GraphRelations:
	      {
		$each: newRelations		
	      }}},function(error,result){if (error) console.log(error);});
	 }
  }

  
});
if (Meteor.isServer) {
UserInterests.after.update(function(userId, doc, fieldNames, modifier, options) {
  //Always have to recalculate the order!  
  
  //Code to order everything

  var reorderList = reorderFunction(doc);
  
  var newArray = [];
  for (var i=0;i<doc.Interests.length;i++)
  {
      newArray.push(
	{Name: doc.Interests[i].Name,
	Map: doc.Interests[i].Map,
	Order: reorderList[doc.Interests[i].Map]
	});	
  }
  
  UserInterests.direct.update({_id: doc._id},
	{
	  $set: {Interests: newArray}
	}, function(error,result){
	if (error)
	  console.log(error);
	}
  );
				  
  
  //Update the order 
  UserInterests.direct.update({_id: doc._id},
	{
	    $push: { Interests : 
	      { $each: [], 
		$sort: {Order: 1}, 
		$slice: (-1*doc.Interests.length)}
		    }	  
	}, function(error,result){
	if (error)
	    console.log(error);
	}
  );
  
  
});
}

var reorderFunction = function(doc)
{
  //Result will be an array where each entry of the map will have
  //the correct position of that node
  var retval = [];
  if (!doc.GraphRelations || doc.GraphRelations.length==0)
  {
    for (i = 0; i<doc.Interests.length;i++)
    {
	retval[doc.Interests[i].Map] = doc.Interests[i].Order;         
    }
  }
  else
  {
      var listOfNodes = []
      var listOfRoots = []
      var GraphEdges = [];
      var isNode = []
      var ViolatingEdges = [];
      for (var i=0;i<doc.Interests.length;i++)
      {
	  listOfNodes.push(doc.Interests[i].Map);
	  listOfRoots.push(doc.Interests[i].Map);
	  isNode[doc.Interests[i].Map]= true;
	  GraphEdges[doc.Interests[i].Map] = [];
      }
      for (var i=0;i<doc.GraphRelations.length;i++)
      {
	  if (isNode[doc.GraphRelations[i].Greater] && isNode[doc.GraphRelations[i].Smaller])
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
	  else
	  {
	    ViolatingEdges.push(doc.GraphRelations[i]);
	  }
	  
      } 
      var cycleresult = CheckCycles(listOfNodes,GraphEdges,ViolatingEdges);
      GraphEdges = cycleresult.Graph;
      var depthArray = []
      for (var i=0;i<listOfRoots.length;i++)
      {	
	depthArray = CountDepth(listOfRoots[i],GraphEdges,depthArray,0,listOfNodes.length);	
      }            
      var rankingList = [];
      var largestTree = 0;
      for (var i=0;i<depthArray.length;i++)
      {
	if (depthArray[i])
	  largestTree = Math.max(largestTree,depthArray[i]);
      }
      
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
      
      for (var i=0;i<listOfRoots.length;i++)
      {	
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
	  for (j=0;j<rankingList[i].length;j++)
	  {
	      orderedList.push((rankingList[i])[j]);	    
	  }	  
      }
      for (i=0;i<orderedList.length;i++)
      {
	  retval[orderedList[i]] = i;
      }
      if (ViolatingEdges.length>0)
      {
       UserInterests.direct.update({_id:doc._id},{$pullAll: 
	      {GraphRelations:ViolatingEdges}}, function(error, result){ if(error){console.log(error)} else console.log(result)});
      }
  }
  
  return retval;
  
}


var CountDepth = function(nodeMap, graph, depthArray, iteration, maxEdges)
{  
  if (iteration>maxEdges)
  {
    console.log("cycle detected!");
      return depthArray;
  }  
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
      for (var i=0;i<graph[nodeMap].length;i++)
      {	
	if (!depthArray[(graph[nodeMap])[i]])
	{	
	  depthArray = CountDepth((graph[nodeMap])[i],graph,depthArray,iteration+1, maxEdges);	  
	}	
	highestNumber = Math.max(highestNumber,depthArray[(graph[nodeMap])[i]]);
      }      
      depthArray[nodeMap]= highestNumber+1;
      return depthArray;
  }
  
}

var CheckCycles = function(nodeMap, graph, ViolatingEdges)
{  
  for (var i=0;i<nodeMap.length;i++)
  {
    var passed = [];
    var actionRay = [];
    var checkingNode = nodeMap[i];
    var parent = [];
    var foundCycle=false;
    passed[checkingNode]=true;
    for (var j=0;j<graph[checkingNode].length;j++)
    {
      actionRay.push((graph[checkingNode])[j]);      
      parent[(graph[checkingNode])[j]] = checkingNode;
    }
    while (actionRay.length>0)
    {
      var child = actionRay.pop();
      if (child==checkingNode)
      {	
	for (var j=0;j<graph[parent[child]].length;j++)
	{
	  if ((graph[parent[child]])[j]==child)
	  {
	    graph[parent[child]].splice(j,1);	    
	    break;
	  }	  
	}
	
	ViolatingEdges.push({Greater: parent[child],Smaller: child});
	foundCycle=true;
	break;
      }
      else
      {
	if (!passed[child])
	{
	  for (var j=0;j<graph[child].length;j++)
	  {
	      actionRay.push((graph[child])[j]);
	      if (!parent[(graph[child])[j]])
	      {
		parent[(graph[child])[j]]=child;		
	      }
	  }
	  passed[child]=true;
	} 
      }      
    }
    if (foundCycle)
    {
     i--; 
    }
  }
  var retval= {};
  retval.Graph = graph;
  retval.ViolatingEdges = ViolatingEdges  
  return retval;
}
