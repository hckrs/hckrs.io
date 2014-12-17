
if (Meteor.isClient) {

  Crawler = {}

  // fetch usernames from github related to all cities from hckrs.io
  Crawler.fetchGithubUsersInAllCities = function(cb) {
    return Meteor.call('crawlFetchGithubUsersInAllCities', cb);  
  }

  // fetch from github all usersnames related to the given city.
  // These usernames will be stored in the database.
  Crawler.fetchGithubUsersInCity = function(city, cb) {
    check(city, Match.In(CITYKEYS));
    return Meteor.call('crawlFetchGithubUsersInCity', city, cb);  
  }

}
