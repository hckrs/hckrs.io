
/* GENERAL */

// change background image depending on time 
// 1. night,  2. in daytime
var currentTime = new Date().getHours();
var isNight = currentTime < 7 || currentTime >= 19;
var image = !isNight ? "/img/background_night.jpg" : "/img/background.jpg";
Session.set('backgroundImage', image);

UI.body.rendered = function() {
  var bg = Session.get('backgroundImage');
  $("body").css('background-image', 'url("' + bg + '")');
}



/* HEADER */

Template.header.helpers({
  'backgroundImage': function() {
    return Session.get('backgroundImage');
  },
  'headerStyle': function() { 
    return Interface.getHeaderStyle();
  },
  'hidden': function() {
    // we hide the navigation bar by explicit set the style to fixed
    return Meteor.userId() ? '' : 'fixed';
  },
  'active': function() {
    var isActive = Meteor.userId() && !Session.equals('pageScrollDirection', 'down');
    return isActive ? 'active' : '';
  }
});

// hide/show header based on scrolling
Template.main.rendered = function() {
  var prevY = 0, newY = 0;
  $("#mainWrapper").on('scroll', function(evt) {
    newY = $("#mainWrapper").scrollTop();
    Session.set('pageScrollDirection', newY > prevY && newY > 50 ? 'down' : 'up')
    prevY = newY;
  });
}





