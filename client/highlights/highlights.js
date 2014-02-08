

// TEMPLATE DATA
// feed templates with data

Template.highlights.helpers({
  'highlights': function() { 
    return highlights(); 
  }
});

Template.highlightSectionDetails.helpers({
  'relatedUser': function(userId) {
    return Meteor.users.findOne(userId);
  }
});



// EVENTS

Template.highlights.events({
  'click a.up': function(event) {
    event.preventDefault(); //don't open url
    $("#onePageScroll").moveUp();
  },
  'click a.down': function(event) {
    event.preventDefault(); //don't open url
    $("#onePageScroll").moveDown();
  }
})


// RENDERING

Template.highlights.rendered = function() {
  /* jquery stuff */

  var buttonVisibility = function() {
    var isFirst = $("#onePageScroll").isFirstPage();
    var isLast = $("#onePageScroll").isLastPage();
    $('#highlights a.up')[isFirst ? 'addClass' : 'removeClass']('hide');
    $('#highlights a.down')[isLast ? 'addClass' : 'removeClass']('hide');
  }

  this.onePageScroll = $("#onePageScroll").onepage_scroll({
    sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
    easing: "ease", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in", "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
    animationTime: 900, // AnimationTime let you define how long each section takes to animate
    pagination: true, // You can either show or hide the pagination. Toggle true for show, false for hide.
    updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
    loop: false, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
    responsiveFallback: false, // You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.
    afterMove: buttonVisibility,
  });

  buttonVisibility();
}

Template.highlights.destroyed = function() {
  this.onePageScroll.disable();
}




// CONTENT

// Highlight Content Section (add NEWER items to the top of the array)
// - only the 'createdAt' property is required.
// - other properties are optional.
// - dates must be represented as an newDate("YYYY-MM-DD hh:mm") object.
// - refer to an user by user id, ( retrieve with userIdFromUrl() )
// - start relative image urls with a slah (e.g. /img/...)

var highlights = function() {
  return [ /* NEW to OLD */

    {
      "createdAt": newDate("2014-02-08"), //date of post YYYY-MM-DD
      "imageUrl": "http://farm9.staticflickr.com/8151/7581131650_3e02c85899_o.jpg",
      "title": "Startup Weekend",
      "subtitle": "Digital open labs @ Lyon",
      "website": "http://lyon.startupweekend.org",
      "userId": userIdFromUrl("http://lyon.hckrs.io/-"), 
    },

    {
      "createdAt": newDate("2014-02-08"), //date of post YYYY-MM-DD
      "imageUrl": "/img/highlights/app-dernier-metro.jpg",
      "title": "Dernier métro",
      "subtitle": "web app Lyonnaise",
      "website": "http://yannlombard.github.io/derniermetro/",
      "userId": userIdFromUrl("http://lyon.hckrs.io/--"), 
    },

    {
      "createdAt": newDate("2014-02-08"), //date of post YYYY-MM-DD
      "imageUrl": "http://www.fhacktory.com/images/fhacktory-hackathon-panorama.jpg",
      "title": "Fhacktory",
      "subtitle": "Tu code, tu viens. hackaton Lyonnais sur 24h",
      "website": "http://www.fhacktory.com",
      "userId": userIdFromUrl("http://lyon.hckrs.io/-_-"), 
    },


  ];
}
