(function() {
  var city, cityUserIds;

  // setup cityUserIds
  cityUserIds = _.object(CITYKEYS, _.map(CITYKEYS, function(){ return [] }));

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
        "createdAt" : new Date("2014-10-23T11:12:34.321Z"),
        "description" : "Passionate people, great softwares",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "Sogilis",
        "type" : "other",
        "updatedAt" : new Date("2014-10-23T11:13:20.912Z"),
        "url" : "http://sogilis.com",
      },
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-10-23T11:13:22.899Z"),
        "description" : "The place to be for entrepreneurs and developers in Grenoble",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "Co-work",
        "type" : "coworking",
        "updatedAt" : new Date("2014-10-23T11:14:49.768Z"),
        "url" : "http://www.co-work.fr",
      
      },
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-13T15:29:00.472Z"),
        "description" : "On the 'deals' page you will find a free trail day.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "La Cordée — Charpennes",
        "type" : "coworking",
        "updatedAt" : new Date("2014-09-13T15:36:16.886Z"),
        "url" : "http://www.la-cordee.net/la-cordee-charpennes/",
      },
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T20:55:07.573Z"),
        "description" : "Coworking space for freelance media producers and web makers.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "L'atelier des médias",
        "type" : "coworking",
        "updatedAt" : new Date("2014-09-16T20:57:58.292Z"),
        "url" : "http://www.atelier-medias.org/",
      },
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T21:20:24.786Z"),
        "description" : "@ L'antre-autre, 11 Rue Terme",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "Meetup PostgreSQL",
        "type" : "meetup",
        "updatedAt" : new Date("2014-09-16T21:22:07.008Z"),
      },
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T20:58:58.950Z"),
        "description" : "Lyon's hacker space. Often open on Tuesday nights starting at 8PM.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "Laboratoire ouvert lyonnais",
        "type" : "hackerspace",
        "updatedAt" : new Date("2014-09-16T21:01:00.192Z"),
        "url" : "https://labolyon.fr/",
      },
      {
        "city" : city,
        "userId" :  Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-13T15:33:48.343Z"),
        "description" : "On the 'deals' page you will find a free trail day.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : true,
        "title" : "La Cordée — Villefranche",
        "type" : "coworking",
        "updatedAt" : new Date("2014-09-13T15:35:02.520Z"),
        "url" : "http://www.la-cordee.net/la-cordee-villefranche/",
      }
    ];
  }

  var public = function() {
    return [
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T21:04:00.431Z"),
        "description" : "Ecological coworking space.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "Écoworking",
        "type" : "coworking",
        "updatedAt" : new Date("2014-09-16T21:06:02.295Z"),
        "url" : "http://www.ecoworking.fr/",
      
      },
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T21:07:12.683Z"),
        "description" : "Tuesday from 2PM to 9AM,\nSaturday from 10AM to 6PM",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "Fabrique d’Objets Libres",
        "type" : "fablab",
        "updatedAt" : new Date("2014-09-16T21:09:39.455Z"),
        "url" : "http://www.fablab-lyon.fr/",
      },
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T21:10:47.981Z"),
        "description" : "look on the 'adenda' page for the dates.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "Javascript user group",
        "type" : "meetup",
        "updatedAt" : new Date("2014-09-16T21:12:26.884Z"),
        "url" : "http://lyonjs.org/",
      },
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T21:28:23.432Z"),
        "description" : "Check the 'agenda' page for dates.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "Microsoft user group",
        "type" : "meetup",
        "updatedAt" : new Date("2014-09-16T21:32:01.042Z"),
      },
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-13T11:58:14.504Z"),
        "description" : "On the 'deals' page you will find a free trail day.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "La Cordée — Liberté",
        "type" : "coworking",
        "updatedAt" : new Date("2014-09-16T20:58:17.220Z"),
        "url" : "http://www.la-cordee.net/",
      },
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-16T21:25:01.113Z"),
        "description" : "3rd Tuesday of the month",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "Java user group",
        "type" : "meetup",
        "updatedAt" : new Date("2014-09-16T21:27:29.280Z"),
        "url" : "http://www.lyonjug.org/",
      },
      {
        "city" : (city = Random.choice(CITYKEYS)),
        "userId" : Random.choice(cityUserIds[city]),
        "createdAt" : new Date("2014-09-13T12:02:55.908Z"),
        "description" : "On the 'deals' page you will find a free trail day.",
        "location" : {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
        },
        "private" : false,
        "title" : "La Cordée — Perrache",
        "type" : "coworking",
        "updatedAt" : new Date("2014-09-13T15:35:24.024Z"),
        "url" : "http://www.la-cordee.net/la-cordee-perrache/",
      },
    ];
  }

  return _.flatten(_.map(CITYKEYS, private)).concat(public());
})();