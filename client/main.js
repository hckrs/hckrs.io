
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

Template.header.events({
  "change #citySelect select": function(evt) {
    var city = $(evt.currentTarget).val();
    exec(function() {
      Router.goToCity(city);  
    });
  }
});

// header rendering 
// hide or show header based on scrolling
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



/* CITY SELECT */

Template.citySelect.helpers({
  "countries": function() {
    var countries = _.map(COUNTRYMAP, function(cities, code) {
      return { name: COUNTRYCODES[code] || "Other", cities: cities };
    });
    return _.sortBy(countries, 'name');
  },
  "selected": function(city) {
    return Session.equals('currentCity', city) ? 'selected' : '';
  },
  "hackersCount": function(city) {
    var count = Meteor.users.find({city: city}).count();
    return hasAdminPermission() && count ? count : ""; 
  }
});



