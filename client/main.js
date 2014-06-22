
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




/* CITY SELECT */

Template.citySelect.helpers({
  "countries": function() {
    return _.keys(COUNTRYMAP);
  },
  "countryName": function() {
    return this; // country name
  } ,
  "cities": function() {
    return COUNTRYMAP[this]; // countries of current city
  },
  "selected": function(city) {
    return Session.equals('currentCity', city) ? 'selected' : '';
  }
});

Template.citySelect.events({
  "change select": function(evt) {
    var city = $(evt.currentTarget).val();
    exec(function() {
      Router.goToCity(city);  
    });
  }
});




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





