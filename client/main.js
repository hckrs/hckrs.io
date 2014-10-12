
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


// precalculate city user-counters
// wait until all users are loaded, then calculate

var cityInvisibleUsers = new ReactiveVar({});
var cityVisibleUsers = new ReactiveVar({});

var calculateUsersCount = function() {
  var invisibleUsers = Users.find({isHidden: true}, {fields: {city: true}, reactive: false}).fetch();
  var visibleUsers = Users.find({isHidden: {$ne: true}}, {fields: {city: true}, reactive: false}).fetch();
  cityInvisibleUsers.set(_.countBy(invisibleUsers, 'city'));
  cityVisibleUsers.set(_.countBy(visibleUsers, 'city'));
}

Meteor.startup(function() {
  Tracker.autorun(function(tracker) {
    if (!Subscriptions.ready()) return; 
    calculateUsersCount();
    tracker.stop();
  });
});



/* CITY SELECT */

Template.citySelect.helpers({
  "countries": function() {
    
    var createCityEntry = _.identity;

    if (hasAdminPermission()) {
      createCityEntry = function(city) {
        city.invisibleUsers = cityInvisibleUsers.get()[city.key];
        city.visibleUsers = cityVisibleUsers.get()[city.key];
        return city;
      }
    }
    
    var createCountryEntry = function(cities, countryCode) {
      return { 
        "name": COUNTRYCODES[countryCode] || "Other", 
        "cities": _.map(cities, createCityEntry)
      };
    }

    return _.sortBy(_.map(COUNTRYMAP, createCountryEntry), 'name');
  },
  "selected": function(city) {
    return Session.equals('currentCity', city) ? 'selected' : '';
  }
});



