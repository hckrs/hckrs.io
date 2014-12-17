ServiceData = {}


// fetch user information from external service
// we try to make user's info complete

// @param user {Object} (an user object)
// @param service String (facebook, github, twitter, etc.)
ServiceData.fetchUserData = function(user, service) {

  var services = {
  
    "github": function(user) {
      var fields = ["id","accessToken","email", "privateEmails","username","login","avatar_url","gravatar_id","html_url","name","company","blog","location"]
      var data = HTTP.get("https://api.github.com/user", {
        headers: {"User-Agent": "Meteor/"+Meteor.release},
        params: {access_token: user.services[service].accessToken}
      }).data;
      data.privateEmails = HTTP.get("https://api.github.com/user/emails", {
        headers: {"User-Agent": "Meteor/"+Meteor.release},
        params: {access_token: user.services[service].accessToken}
      }).data; // XXX API response format for /user/emails will change in the future
      return _.pick(data, fields);;
    },
    
    "facebook": function(user) {
      var url = "https://graph.facebook.com/me";
      var fields = ['id', 'email', 'name', 'locale', 'picture', 'link', 'username', 'location', 'birthday', 'gender', 'website', 'work'];
      return OAuth.userCall(user, 'facebook', 'GET', url, {fields: fields}).data;
    },
    
    "twitter": function(user) {
      var url = "https://api.twitter.com/1.1/account/verify_credentials.json";
      var fields = ['id','id_str','accessToken','profile_image_url','name','screen_name','location','entities'];
      var data = OAuth.userCall(user, 'twitter', 'GET', url).data;
      data.id = data.id_str;
      return _.pick(data, fields);
    }
  }

  if (!services[service])
    throw new Meteor.Error(500, "Unknow how to fetch user data from " + service);    

  // return the fetched data
  return services[service](user);
}


// transform the raw service data into a uniform format
// that is the same for all services. The transformed data
// can be used to make user's profile complete
ServiceData.unify = function(data, service) {

  var services = {
  
    "github": function(data) {

      if (data.avatar_url)
        data.picture = data.avatar_url + "&size=180"

      if (data.location)
        data.location = Util.geocode(data.location);

      // check for private mailaddress when public email isn't setted
      if (!data.email && data.privateEmails) { 
        var emails = _.filter(data.privateEmails, function(email) {
          return _.isString(email) && email.indexOf("@users.noreply.github.com") === -1;
        });
        data.email = _.first(emails);
      }

      var userData = {
        'email': data.email,
        'name': data.name,
        'picture': data.picture,
        'link': data.html_url,
        'company': data.company,
        'homepage': data.blog,
        'location': data.location,
        
        // 'username': data.login,
        // 'birthday': data.birthday || null,
        // 'city': data.location,
        // 'lang': data.lang || null
      };

      return userData;
    },
    
    "facebook": function(data) {

      if (data.birthday) {
        var p = data.birthday.split('/');
        data.birthday = new Date(p[2], p[0], p[1]);
      }

      if (data.username && data.picture && data.picture.data && !data.picture.data.is_silhouette)
        data.picture = "https://graph.facebook.com/" + data.username + "/picture?type=large";

      if (data.location && data.location.name)
        data.location = Util.geocode(data.location.name);

      if (data.work && data.work[0] && data.work[0].employer)
        data.company = data.work[0].employer.name;
      
      var userData = {
        'email': data.email,
        'name': data.name,
        'picture': data.picture,
        'link': data.link,
        'company': data.company, // XXX TODO ? working???
        'homepage': data.website,
        'location': data.location,
        
        // 'username': data.username,
        // 'birthday': data.birthday,
        // 'city': data.location && data.location.name, //XXX TODO: use additional data.location.id 
        // 'lang': data.locale && data.locale.substr(0,2)
      };

      return userData;
    },
    
    "twitter": function(data) {
    
      if (!data.default_profile_image && data.profile_image_url)
        // remove '_normal' from url to get original size
        data.picture = data.profile_image_url.replace(/_normal(.{0,5})$/, '$1');

      var urls = Util.property(data, 'entities.url.urls');
      if (urls && urls[0])
        data.homepage = urls[0].expanded_url;

      if (data.location)
        data.location = Util.geocode(data.location);

      if (data.screen_name)
        data.link = "http://twitter.com/" + data.screen_name

      var userData = {
        'email': null, // not available
        'name': data.name,
        'picture': data.picture,
        'link': data.link,
        'company': null, // not available
        'homepage': data.homepage,
        'location': data.location,
        
        // 'username': data.screen_name,
        // 'birthday': data.birthday || null,
        // 'city': data.location,
        // 'lang': data.lang
      };

      return userData;
    }
  }

  if (!services[service])
    throw new Meteor.Error(500, "Unknow service " + service);    

  // return the fetched data
  return Util.omitNull(services[service](data));
}