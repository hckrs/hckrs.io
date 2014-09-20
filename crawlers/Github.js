Crawler = {};

// fetch usernames from github related to all cities from hckrs.io
Crawler.fetchGithubUsersInAllCities = function(cb) {

  if (Meteor.isClient)
    return call('crawlFetchGithubUsersInAllCities', cb);  

  async.forEachSeries(CITYKEYS, Meteor.bindEnvironment(Crawler.fetchGithubUsersInCity), cb || function(){});
}

// fetch from github all usersnames related to the given city.
// These usernames will be stored in the database.
Crawler.fetchGithubUsersInCity = function(city, cb) {
  check(city, Match.In(CITYKEYS));
  
  if (Meteor.isClient)
    return call('crawlFetchGithubUsersInCity', city, cb);  
  
  // query
  var cityName = CITYMAP[city].name;
  var query = "location:" + cityName.replace(' ', '+');
  
  // fetch and store each user
  forEachUsers(query, 1, _.partial(storeUser, city), cb);
}


// Fetch additional userdata for each username
// obtained by the function Crawler.fetchGithubUsersInCity()
Crawler.fetchGithubUserData = function(cb) {
  
  if (Meteor.isClient)
    return call('crawlFetchGithubUserData', cb);  
  
  // fetch additional userdata for each user
  fetchUserData(cb);
}



// private

if (Meteor.isServer) {


  var forEachUsers = function(query, page, iterator, cb) {
    
    if (page > 10) 
      return cb && cb();

    console.log('fetch github search', query, page);

    var params = {
      per_page: 100,
      page: page,
      type: 'user',
      q: query,
    }
    
    // make reruest
    var users = request('GET', "https://api.github.com/search/users", params).items || [];
    
    // store users
    _.each(users, iterator);  

    // recurse
    if (users.length) {
      setTimeout(Meteor.bindEnvironment(function(){
        forEachUsers(query, page + 1, iterator, cb);
      }), 3000);
    }
    else 
      cb && cb();
  }

  var storeUser = function(city, user) {
    var doc = _.pick(user, 'id', 'login')
    doc.city = city;
    doc.email = doc.email ? doc.email : null;
    GithubDump.upsert({id: user.id}, {$set: doc});
  }

  var fetchUserData = function(cb) {
    var docs = GithubDump.find({isFetched: {$ne: true}}).fetch();
    async.forEachSeries(docs, Meteor.bindEnvironment(function(doc, cb) {
      fetchSingleUserData(doc);
      setTimeout(cb, 12);
    }), cb);
  }

  var fetchSingleUserData = function(doc) {
    console.log('fetch github user', doc.id, doc.login);

    // make request
    var user = request('GET', "https://api.github.com/users/"+doc.login);

    // update doc
    var fields = _.pick(user, 'created_at', 'updated_at', 'email', 'followers', 'following', 'location', 'name', 'company', 'avatar_url', 'url');
    fields.isFetched = true;
    GithubDump.update(doc._id, {$set: fields});
  }

  var request = function(method, url, params) {
    
    var options = {
      headers: {"User-Agent": "Meteor/"+Meteor.release},
      params: _.extend(params || {}, {
        client_id: Settings['github']['clientId'],
        client_secret: Settings['github']['secret'],
      })
    };  
    
    // make reruest
    return HTTP.call(method, url, options).data;
  }


  /* METHODS */

  Meteor.methods({
    'crawlFetchGithubUsersInAllCities': Crawler.fetchGithubUsersInAllCities,
    'crawlFetchGithubUsersInCity': Crawler.fetchGithubUsersInCity,
    'crawlFetchGithubUserData': Crawler.fetchGithubUserData,

  });

}


