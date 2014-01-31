var Future = Npm.require("fibers/future");
var Path = Npm.require('path');
var Url = Npm.require('url');

/* server methods */
// these are methods that can be called from the client
// but executed on the server because of the use of private data

Meteor.methods({

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

  // get the broadcast user associated with the given invitation phrase
  'getBroadcastUser': function(phrase) {
    check(phrase, Number);

    // fields of broadcast user to return
    var fields = {'_id': 1, 'profile.name': 1, 'profile.picture': 1};
  
    // search broadcast user
    var broadcastUser = Meteor.users.findOne({invitationPhrase: phrase}, {fields: fields});
    if (broadcastUser.mergedWith)
      broadcastUser = Meteor.users.findOne(broadcastUser.mergedWith, {fields: fields});

    if (!broadcastUser)
      throw new Meteor.Error(500, "Unknow broadcast user");

    return broadcastUser;
  },

  'requestWebPageImages': function(query, maxResults) {
    
    if (!this.userId)
      throw new Meteor.Error(500, 'not authorized');

    var url = 'https://www.google.com/search';
    var options = {
      params: {
        'tbm': 'isch', // image search
        'q': encodeURI( query ), // search keyword(s)
        'tbs': 'isz:m' // size medium
      },
      headers: { 'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.73.11 (KHTML, like Gecko) Version/7.0.1 Safari/537.73.11" }
    }
    var images = sync(function(cb) {
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




// METHODS implementations



