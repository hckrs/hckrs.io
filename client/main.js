
/* HEADER */

Template.header.helpers({
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

Template.main.rendered = function() {
  var prevY = 0, newY = 0;
  $("#mainWrapper").on('scroll', function(evt) {
    newY = $("#mainWrapper").scrollTop();
    Session.set('pageScrollDirection', newY > prevY ? 'down' : 'up')
    prevY = newY;
  });
}





/* GENERAL */

// html document fully loaded and rendered
$(document).ready(function() {

  // change background image depending on time 
  // 1. night,  2. in daytime
  var currentTime = new Date().getHours();
  var isNight = currentTime < 7 || currentTime >= 19;
  var image = isNight ? "background_night.jpg" : "background.jpg";
  $('body').css('background-image', 'url(/img/'+image+')');


});





// automatically activate page transitions after templates are loaded
_.each(Template, function(template, templateName) {
  var prevRenderFunc = template.rendered;
  template.rendered = function() {
    if (prevRenderFunc) prevRenderFunc.call(this);
    Meteor.setTimeout(function() {
      $(".route-transition").addClass('activated');
    }, 200);
  }
});
