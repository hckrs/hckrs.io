var Future = Npm.require("fibers/future");
Path = Npm.require('path');
Url = Npm.require('url');

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

  // fetching a webpage and return metadata
  'requestWebpageMetadata': function(url) {
    if (!Meteor.userId()) 
      throw new Meteor.Error(500, "Not authorized")
    return requestWebpageMetadata(url);
  }

});




// METHODS implementations

// fetching a webpage and return the content
var requestUrlContent = function(url) {
  return HTTP.get(url).content;
}


var requestWebpageMetadata = function(url) {

  // using Yahoo YQL to query an url and
  // parse some content based on a CSS selector 
  var selector = "title, meta[name='description'], img";
  var data = YQL.queryHTML(selector, url); 

  var title = _.isString(data.title) && data.title || "";
  var description = data.meta && _.isString(data.meta.content) && data.meta.content || "";
  var images = _.isArray(data.img) ? data.img : _.isObject(data.img) ? [data.img] : [];

  // resolve image sources, remove empty ones
  images = _.filter(images, function(img) { return _.isObject(img) && img.src; })
  _.each(images, function(img) { img.src = Url.resolve(url, img.src); });
  
  // exclude image smaller than 200px
  var sizes = ProcesssImageResources(_.pluck(images, 'src'), ImageSize);
  _.each(images, function(img, i) { _.extend(img, sizes[i]); });
  images = _.reject(images, function(img) { return img.width < 200 || img.height < 200; });

  // if title contains components, split them
  // and use it to override the subtitle from above
  var titleParts = title.split(/\s[\|\-\/]\s/);
  if (titleParts.length) {
    title = _.first(titleParts);
    subtitle = _.last(titleParts);
  }

  return {
    title: title,
    subtitle: subtitle,
    description: description,
    images: images,
  };
}

