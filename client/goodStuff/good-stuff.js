

// EVENTS
// handle user interactions

Template.goodStuff.events({
  
});





// TEMPLATE DATA
// feed templates with data

Template.goodStuff.helpers({ 
  'goodStuff': function() {
    return goodStuff();
  },
  'user': function(userId) {
    return Meteor.users.findOne(userId);
  }
});




// RENDERING
// managing jquery stuff

Template.goodStuff.rendered = function() {
  var msnry = new Masonry("#goodStuffGrid");

  // XXX set overlay colors (experimental: no efficient implementation)
  $("#goodStuffGrid .item").each(function(i, elm) {
    var imageUrl = $(elm).css('background-image').replace('url(','').replace(')','');
    AverageImageRGB(imageUrl, function(rgb) {
      var rgba = 'rgba('+rgb.r+','+rgb.g+','+rgb.b+', 0.7)';
      $(elm).find('.item-overlay').css('background-color', rgba);
    })
  });
}



// CONTENT

// Good Stuff Content Section (add NEWER items to the top of the array)
// - the properties 'createdAt', 'title', 'website' are required.
// - other properties are optional.
// - dates must be represented as an newDate("YYYY-MM-DD hh:mm") object.
// - refer to an user by user id, ( retrieve with userIdFromUrl() )
// - prices must be (floating point) number
// - start relative image urls with a slah (e.g. /img/...)

var goodStuff = function() {
  return [ /* NEW to OLD */

    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/app-dernier-metro.jpg",
      "title": "Event 3",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-14 14:12"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"),
    },

    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/4K-screen.jpg",
      "title": "Event 2",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-08 14:12"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/arduino.jpg",
      "title": "Event 1",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "costs": 15.00,
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-16 17:10"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/app-dernier-metro.jpg",
      "title": "Event 3",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-14 14:12"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/4K-screen.jpg",
      "title": "Event 2",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/arduino.jpg",
      "title": "Event 1",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "costs": 15.00,
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-16 17:10"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },


    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/app-dernier-metro.jpg",
      "title": "Event 3",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/4K-screen.jpg",
      "title": "Event 2",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-08 14:12"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/arduino.jpg",
      "title": "Event 1",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "costs": 15.00,
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-16 17:10"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

  ];
}
