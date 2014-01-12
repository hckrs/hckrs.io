

// EVENTS

Template.highlights.events({
  /* handle user interactions */
});





// TEMPLATE DATA

Template.highlights.helpers({
  /* feed templates with data */

  'highlights': function() { 
    return _.sortBy(highlights().reverse(), function(item) { return item.createdAt; }); 
  },
  'user': function(userId) {
    return Meteor.users.findOne(userId);
  }
});




// RENDERING

Template.highlights.rendered = function() {
  /* jquery stuff */

  this.onePageScroll = $("#highlights").onepage_scroll({
    sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
    easing: "ease", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in", "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
    animationTime: 900, // AnimationTime let you define how long each section takes to animate
    pagination: true, // You can either show or hide the pagination. Toggle true for show, false for hide.
    updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
    beforeMove: function(index) {}, // This option accepts a callback function. The function will be called before the page moves.
    afterMove: function(index) {}, // This option accepts a callback function. The function will be called after the page moves.
    loop: false, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
    responsiveFallback: false // You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.
  });
}

Template.highlights.destroyed = function() {
  this.onePageScroll.disable();
}


// CONTENT

// Highlight Content Section (add NEWER items to the bottom)
// - only the 'createdAt' property is required.
// - other properties are optional.
// - dates must be represented as an newDate("YYYY-MM-DD hh:mm") object.
// - refer to an user by user id, ( retrieve with userIdFromUrl() )

var highlights = function() {
  return [ /* OLD to NEWER */

    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "title": "Event 1",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-08 14:12"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },
    
    {
      "createdAt": newDate("2014-01-12"), //date of post YYYY-MM-DD
      "title": "Event 2",
      "subtitle": "Test Subtitle",
      "description": "Hier komt de description...",
      "website": "http://www.google.nl",
      "eventLocation": "Utrecht",
      "eventDate": newDate("2014-01-14 14:12"), //date YYYY-MM-DD mm:ss
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

  ];
}
