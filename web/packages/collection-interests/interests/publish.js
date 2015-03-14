
this.N4JDB = Meteor.npmRequire('neo4j');
db = new N4JDB.GraphDatabase("http://Interestrelations:0NKzYBRfnnpWQ7f2dSID@interestrelations.sb04.stations.graphenedb.com:24789");

Meteor.publish("interestcollection", function(searchInput, alreadySelected, limit) {
  
  //This is currently the code for using recommendations from the Neo4J database
  //First, some variables are declared.
  //Import the Future library
  var Future = Npm.require('fibers/future');
  //Create a new future for async
  var dbFuture = new Future();
  //We will use the method of adding separate records to the cursor, so first we
  //rename this into a variable.
  var self = this;
  
  //We run a query on our Neo4j database. Almost all code will be handled in the 
  //callback function, as the results of the query are needed.
  //The query is created by buildCypherQuery, and the callback function is enclosed 
  //in a bindEnvironment, to make sure it is running in a separate Fiber.
  db.query(buildCypherQuery(alreadySelected,searchInput,limit),null, Meteor.bindEnvironment(function(error, result) {
    //On error, throw an error. Also return a standard list. 
    if (error)
    {
      console.log(error);
      var options = {sort: [["Count","desc"]], limit: limit};
      //This is the default query: It selects all interests that follow the
      //regex query that are not already an interest tagged by the user.
      return InterestCollection.find({$and:
	      [
	      {Interest: {$regex: searchInput, $options: 'i'}},
	      {Interest: {$nin: alreadySelected}}
	      ]
	    },
	    options);  
    }
    if (result)
    {
      //We want a total of 50 Interests returned. However, with a small amount of
      //Interests added by the user, it is possible that not 50 are returned.
      //The rest of the list is padded by other interests sorted on Count,
      //taken from the normal database.
      //First calculate how many are needed
      var amtleft= limit-result.length;
      //Copy the names of all Interests to another array so we can use them as input 
      //for the query.
      var foundInterests = [];
      for (i=0;i<result.length;i++)
      {
	  foundInterests.push(result[i].Interest);
      }
      //We can't simply call the query with amtleft=0, as a limit of 0 returns
      //all results instead
      if (amtleft>0)
      {
	//Run the default query but with a smaller limit, and make sure that
	//no interests are returned that were already found
	var options = {sort: [["Count","desc"]], limit: (amtleft)};
	var dbresult= InterestCollection.find({$and:
	      [
	      {Interest: {$regex: searchInput, $options: 'i'}},
	      {Interest: {$nin: alreadySelected}},
	      {Interest: {$nin: foundInterests}}
	      ]
	    },
	    options);
      }
      //Next, we wish to find the counts and ids of all interests found by the
      //Neo4j query. We do this by running a separate query that searches out
      //all those interests.
      var records= [];
      //Perform the query
      var countresult = InterestCollection.find({Interest: {$in: foundInterests}});    
      //Next we are going to merge the result of this query with the result of
      //our neo4j query. Then the completed record is added to 'this'.
      for (i=0;i<result.length;i++)
      {
	countresult.forEach( function(doc) {
	  if (result[i].Interest === doc.Interest)
	  {
	      //If the doc matches the current record, copy some values
	      result[i]._id = doc._id;
	      result[i].Count = doc.Count;	      
	  }
	});
	//Can't guarantee that we did find a match, so there is a clause to make a 
	//fake id. I highly doubt this will ever happen though.
	if (!result[i]._id)
	{
	  //self.added("interestcollection",result[i]._id,result[i]);
	  result[i]._id = "someId"+i;
	}
	records.push(result[i]);
	//else
	  //self.added("interestcollection","someId"+i,result[i]);
      }
      for (i=0;i<result.length;i++)
      {
	self.added("interestcollection",result[i]._id,result[i]);
      }
      //Lastly, we add each of the list-padders.
      if (amtleft>0)
      {	  
	  dbresult.forEach( function(doc) {
	    self.added("interestcollection",doc._id,doc);      
	});																				
      }
    //And finally, we can resume the future!
    dbFuture.return();
    }
  }
  ));  
  //Normally this code is run asynchronously from db.query, but we need it to run
  //synchronously. Therefore we wait until the future is done, and then commit
  //the cursor we created with self.ready.
  dbFuture.wait();
  self.ready();
  
    //ORIGINAL QUERY:
//   var dbresult= InterestCollection.find({$and:
//       [
//       {Interest: {$regex: searchInput, $options: 'i'}},
//       {Interest: {$nin: alreadySelected}}
//       ]
//     },
//     options);
});

var buildCypherQuery = function(tagArray, searchInput, maxAmount)
{  
   var tagsstring = '["';
    for (i=0;i<tagArray.length;i++)
    {
	if (i>0)
	  tagsstring=tagsstring.concat('","');
	tagsstring=tagsstring.concat(tagArray[i]);
    }
    tagsstring=tagsstring.concat('"]');
  var searchString = '.*'+searchInput+'.*';
  var query ='match (t:Tag) where t.name IN '+tagsstring+
  ' match (t)-[r:Relation]-(s) where (s.name =~ "'+searchString+
  '") AND (NOT s.name IN '+tagsstring+
  ') return distinct s.name as Interest,sum(r.count) as relationcount ORDER BY relationcount desc limit '+maxAmount;  
  return query;
}

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
