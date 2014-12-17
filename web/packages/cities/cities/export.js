// list with city objects
// sorted in ASC order
CITIES = _.sortBy(cities, 'name');

// array of city names
CITYNAMES = _.pluck(cities, 'name').sort()

// array of city keys
CITYKEYS = _.pluck(cities, 'key').sort()

// another representation of cities using a map datastructure
// where you can access a city by lookup the key in this map/object.
CITYMAP = _.indexBy(CITIES, 'key');

// a map containing country codes associated with their cities
COUNTRYMAP = _.groupBy(CITIES, 'country');


COUNTRYCODES = codes;