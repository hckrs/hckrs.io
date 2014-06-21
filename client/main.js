
/* GENERAL */

// update datetime in session every second 
// reactive templates will update automatically

Session.set('date', new Date());
Meteor.setInterval(function() {
  Session.set('date', new Date());
}, 60000);


// change background image depending on time 
// 1. night,  2. in daytime


var getBackground = function() {
  var city = CITYMAP[Session.get('currentCity')] || {};  
  var date = Session.get('date');
  var isNight = date && (date.getHours() < 7 || date.getHours() >= 19);
  
  if (isNight) 
    return city.backgroundImageNight || "/img/backgrounds/default_night.jpg";
  return city.backgroundImage || "/img/backgrounds/default.jpg";
}

UI.body.rendered = function() {
  Deps.autorun(function() {
    var bg = getBackground();
    $("body").css('background-image', 'url("' + bg + '")');
  });
}



/* HEADER */

Template.header.helpers({
  'backgroundImage': function() {
    return getBackground();
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
  $(window).on('scroll', function(evt) {
    newY = $(window).scrollTop();
    Session.set('pageScrollDirection', newY > prevY && newY > 50 ? 'down' : 'up');
    if (newY > 70)
      $("#header .floating").addClass('float');
    else
      $("#header .floating").removeClass('float');
    prevY = newY;
  });
}





