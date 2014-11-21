var _busy = false;

// fetch usernames from github related to all cities from hckrs.io
var fetchGithubUsersInAllCities = function() {
  async.forEachSeries(CITYKEYS, Meteor.bindEnvironment(fetchGithubUsersInCity));
}

// fetch from github all usersnames related to the given city.
// These usernames will be stored in the database.
var fetchGithubUsersInCity = function(city) {
  check(city, Match.In(CITYKEYS));
  
  if (_busy)
    throw new Meteor.Error(500, "busy");

  // don't wait on response
  this.unblock();
  
  // query
  var cityName = CITYMAP[city].name;
  var query = "type:user location:" + cityName.replace(' ', '+');


  var callback = function(err) {
    _busy = false;
  }

  _busy = true;

  // fetch and store each user
  forEachQueriedUser(query, 1, _.partial(fetchSingleUser, city), callback);
}



var forEachQueriedUser = function(query, page, iterator, cb) {
  
  if (page > 10) 
    return cb && cb();

  console.log('fetch github search', query, page);

  var params = {
    per_page: 100,
    page: page,
    q: query,
  }
  
  // make reruest
  var users = request('GET', "https://api.github.com/search/users", params).items || [];
  users = _.pluck(users, 'login');
  
  // store users
  _.each(users, iterator);  

  // recurse
  if (users.length) {
    setTimeout(Meteor.bindEnvironment(function(){
      forEachQueriedUser(query, page + 1, iterator, cb);
    }), 60 * 1000); // 80s timeout because rate limit is fetching 5.000 users per hour
  }
  else 
    cb && cb();
}

var fetchSingleUser = function(city, userLogin) {
  console.log('fetch github user', userLogin);

  if (GrowthGithub.findOne({username: userLogin}))
    return; // already crawled

  try {
    var user = request('GET', "https://api.github.com/users/"+userLogin) || {};
    user = _.pickRename(user, {
      "id": true,
      "login": "username",
      "email": true,
      "avatar_url": "avatarUrl",
      "bio": "biography",
      "created_at": "createdAt",  
      "updated_at": "updatedAt",  
      "followers": true,
      "following": true,
      "public_repos": "repos",       
      "public_gists": "gists",      
      "hireable": true,
      "name": true,
      "blog": "website",
      "company": true,
      "location": true,
    });
    user.hireable = !!user.hireable;
    user.createdAt = new Date(user.createdAt);
    user.updatedAt = new Date(user.updatedAt);
    user.city = city;
    user = omitEmpty(user);
    
    if (!user.email)
      return; // user don't have email

    // check if user already signed up at hckrs.io
    var userDoc;
    if (userDoc = Users.findOne({'emails.address': user.email}, {fields: {'_id': true, 'createdAt': true}})) {
      user.signupAt = userDoc.createdAt; 
      user.userId = userDoc._id;
    }

    try {
      GrowthGithub.insert(user);
    } catch(e) { 
      console.log("Invalid schema", user, e);   
    }

  } catch(e) { 
    console.log("failed crawling", userLogin, e); 
  }
}

var request = function(method, url, params) {
  var options = {
    headers: {"User-Agent": "Meteor/"+Meteor.release},
    params: _.extend(params || {}, {
      client_id: Settings['github']['clientId'],
      client_secret: Settings['github']['secret'],
    })
  };  
  return HTTP.call(method, url, options).data;
}


/* METHODS */

Meteor.methods({
  'crawlFetchGithubUsersInAllCities': fetchGithubUsersInAllCities,
  'crawlFetchGithubUsersInCity': fetchGithubUsersInCity,
});




