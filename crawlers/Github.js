Crawler = {};

// fetch from github all usersnames related to the given city.
// These usernames will be stored in the database.
Crawler.fetchGithubUsersInCity = function(city) {
  check(city, Match.In(CITYKEYS));
  
  if (Meteor.isClient)
    return call('crawlFetchGithubUsersInCity', city);  
  
  // query
  var cityName = CITYMAP[city].name;
  var query = "location:" + cityName.replace(' ', '+');
  
  // fetch and store each user
  forEachUsers(query, 1, _.partial(storeUser, city));
}


// Fetch additional userdata for each username
// obtained by the function Crawler.fetchGithubUsersInCity()
Crawler.fetchGithubUserData = function() {
  
  if (Meteor.isClient)
    return call('crawlFetchGithubUserData');  
  
  // fetch additional userdata for each user
  fetchUserData();
}



// private

if (Meteor.isServer) {

  var GithubDump = new Meteor.Collection('githubDump');

  var forEachUsers = function(query, page, iterator) {
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
    if (users.length) 
      forEachUsers(query, page + 1, iterator);
  }

  var storeUser = function(city, user) {
    var doc = _.pick(user, 'id', 'login')
    doc.city = city;
    doc.email = doc.email ? doc.email : null;
    GithubDump.upsert({id: user.id}, {$set: doc});
  }

  var fetchUserData = function() {
    var docs = GithubDump.find({isFetched: {$ne: true}}).fetch();
    async.forEachSeries(docs, Meteor.bindEnvironment(function(doc, cb) {
      fetchSingleUserData(doc);
      setTimeout(cb, 12);
    }));
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
    'crawlFetchGithubUsersInCity': Crawler.fetchGithubUsersInCity,
    'crawlFetchGithubUserData': Crawler.fetchGithubUserData,
  });

}


