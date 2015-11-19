var Future = Npm.require("fibers/future");
var Path = Npm.require('path');
var Url = Npm.require('url');


// implementations


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



