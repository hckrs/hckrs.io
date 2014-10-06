
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

