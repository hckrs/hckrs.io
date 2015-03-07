
/* GENERAL */

// update datetime in session every second
// reactive templates will update automatically

Session.set('date', new Date());
Meteor.setInterval(function() {
  Session.set('date', new Date());
}, 60000);



/* HEADER */

Template.header.helpers({
  'backgroundImage': function() {
    return getBackground();
  },
  'headerStyle': function() {
    return Interface.getHeaderStyle();
  },
  'hidden': function() {
    // To hide navigation
    // 1. fix navigation
    // 2. make inactive
    var visible = Meteor.userId() &&
                  Router.current().route.getName() != 'frontpage';
    return visible ? '' : 'fixed';
  },
  'active': function() {
    var isActive = Meteor.userId()  &&
                  !Session.equals('pageScrollDirection', 'down') &&
                  Router.current().route.getName() != 'frontpage';
    return isActive ? 'active' : '';
  }
});

Template.header.events({
  "change #citySelect select": function(evt) {
    var city = $(evt.currentTarget).val();
    Util.exec(function() {
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

// var calculateUsersCount = function() {
//   var invisibleUsers = Users.find({isHidden: true}, {fields: {city: true}, reactive: false}).fetch();
//   var visibleUsers = Users.find({isHidden: {$ne: true}}, {fields: {city: true}, reactive: false}).fetch();
//   cityInvisibleUsers.set(_.countBy(invisibleUsers, 'city'));
//   cityVisibleUsers.set(_.countBy(visibleUsers, 'city'));
// }

// Meteor.startup(function() {
//   Tracker.autorun(function(tracker) {
//     // if (!Subscriptions.ready()) return;
//     calculateUsersCount();
//     tracker.stop();
//   });
// });



/* CITY SELECT */

Template.citySelect.helpers({
  "countries": function() {

    var createCityEntry = _.identity;

    if (Users.hasAdminPermission()) {
      createCityEntry = function(city) {
        city.invisibleUsers = cityInvisibleUsers.get()[city.key];
        city.visibleUsers = cityVisibleUsers.get()[city.key];
        return city;
      }
    }

    var createCountryEntry = function(cities, countryCode) {
      return {
        "name": City.countryName(countryCode) || "Other",
        "cities": _.map(cities, createCityEntry)
      };
    }

    return _.sortBy(_.map(_.groupBy(City.cities(), 'country'), createCountryEntry), 'name');
  },
  "selected": function(city, current) {
    if (_.isString(current) && City.lookup(current))
      return current == city ? 'selected' : '';
    else
      return Session.equals('currentCity', city) ? 'selected' : '';
  }
});
