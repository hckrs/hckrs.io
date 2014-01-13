

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
      "title": "Dernier métro",
      "subtitle": "web app pour Lyon",
      "website": "http://yannlombard.github.io/derniermetro/",
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
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/slim-fold.jpg",
      "title": "Slim fold",
      "subtitle": "croud funded paper walet",
      "website": "http://www.slimfoldwallet.com",
      "costs": 20.00,
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/4K-screen.jpg",
      "title": "Seiki 4K TV",
      "website": "http://tiamat.tsotech.com/4k-is-for-programmers",
      "costs": 600,
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/amazon-drone.jpg",
      "title": "20\" delivery by Amazon",
      "subtitle": "welcome to the future",
      "website": "http://www.youtube.com/watch?v=98BIu9dpwHU",
      "costs": 15.00,
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/dell-4K.jpg",
      "title": "Dell 4K",
      "subtitle": "28\" screen",
      "website": "http://accessories.us.dell.com/sna/productdetail.aspx?c=us&l=en&cs=19&sku=210-ACBL",
      "costs": 600.00,
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/rasbery-pi.jpg",
      "title": "Rasbery Pi",
      "subtitle": "rev.B",
      "website": "http://www.raspberrypi.org",
      "costs": 25.00,
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/seth-godin.jpg",
      "title": "Seth godin",
      "subtitle": "20' interview",
      "website": "http://www.youtube.com/watch?v=JecJzrIfdHg",
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/spark-core.jpg",
      "title": "Skark core",
      "subtitle": "push code over WiFi",
      "description": "Hier komt de description...",
      "website": "https://www.spark.io",
      "costs": 40.00,
      "eventLocation": "",
    },

   {
      "createdAt": newDate("2014-01-13"), //date of post YYYY-MM-DD
      "imageUrl": "/img/good-stuff/tim-ferris.png",
      "title": "Tim Ferris",
      "subtitle": "47' interview",
      "description": "How to master any skill",
      "website": "http://www.youtube.com/watch?v=AysWsbrtzMU",
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },


  ];
}
