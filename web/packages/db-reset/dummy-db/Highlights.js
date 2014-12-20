(function() {
  var city, cityUserIds;

  // setup cityUserIds
  cityUserIds = _.object(City.identifiers(), _.map(City.identifiers(), function(){ return [] }));

  // fill cityUserIds
  Users
    .find({isHidden: {$ne: true}}, {fields: {city: 1}})
    .forEach(function(u) {
      cityUserIds[u.city].push(u._id);
    });

  var private = function(city) { 
    return [
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "title" : "The next generation of DIYBio tools are coming",
        "imageUrl" : "https://d262ilb51hltx0.cloudfront.net/max/2000/1*KppzYPmLFqj9y6gOguUzpg.jpeg",
        "url" : "https://medium.com/backchannel/diybio-comes-of-age-4a5b15d1131f",
        "private" : true,
        "createdAt" : new Date("2014-11-09T20:16:29.119Z"),
      }
    ];
  }

  var public = function() {
    return [
      {
        "city" : (city = Random.choice(City.identifiers())),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-27T10:33:28.273Z"),
        "imageUrl" : "https://sniperinmahwah.files.wordpress.com/2014/09/p1010342.jpg",
        "private" : false,
        "subtitle" : "financial networks",
        "title" : "HFT in my Backyard — II",
        "updatedAt" : new Date("2014-10-03T12:42:44.941Z"),
        "url" : "http://sniperinmahwah.wordpress.com/2014/09/25/hft-in-my-backyard-ii/",
      },
      {
        "city" : (city = Random.choice(City.identifiers())),
        "userId" : Random.choice(cityUserIds[city]),
        "title" : "Edward Snowden",
        "subtitle" : "The untold story",
        "imageUrl" : "http://www.wired.com/wp-content/uploads/2014/08/03_Cnt3_Fr8-_crop1.jpg",
        "url" : "http://www.wired.com/2014/08/edward-snowden/",
        "private" : false,
        "createdAt" : new Date("2014-09-16T16:05:49.904Z"),
      },
      {
        "city" : (city = Random.choice(City.identifiers())),
        "userId" : Random.choice(cityUserIds[city]),
        "title" : "How to Start a Startup",
        "subtitle" : "videos",
        "imageUrl" : "http://upload.wikimedia.org/wikipedia/commons/d/d1/Paul_Graham_talking_about_Prototype_Day_at_Y_Combinator_Summer_2009.jpg",
        "url" : "http://startupclass.samaltman.com/",
        "private" : false,
        "createdAt" : new Date("2014-10-05T20:29:02.278Z"),
      },
    ];
  }

  return _.flatten(_.map(City.identifiers(), private)).concat(public());
})();