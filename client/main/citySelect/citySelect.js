


// precalculate city user-counters
var _cityCount, _cityVisibleCount;

var _calculateCount = function() {
  var users = Users.find({}, {fields: {city: true}, reactive: false}).fetch();
  var visibleUsers = Users.find({isHidden: {$ne: true}}, {fields: {city: true}, reactive: false}).fetch();
  _cityCount = _.countBy(users, 'city');
  _cityVisibleCount = _.countBy(visibleUsers, 'city');
}

var getCityCount = function() {
  if (!_cityCount) _calculateCount();
  return _cityCount;
}
var getCityVisibleCount = function() {
  if (!_cityVisibleCount) _calculateCount();
  return _cityVisibleCount;
}



/* CITY SELECT */

Template.citySelect.helpers({
  "countries": function() {

    var createCityEntry = _.identity;

    if (hasAdminPermission()) {
      createCityEntry = function(city) {
        city.usersCount = getCityCount()[city.key];
        city.visibleUsersCount = getCityVisibleCount()[city.key];
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


