
// get label from an options list
Util.getLabel = function(optionsList, value) {
  return (_.findWhere(optionsList, {value: value})||{}).label;
}

// check if some doc is foreign
// that means that doc is created in an other city
// with respect to the current city subdomain
Util.isForeignCity = function(otherCity) {
  var currentCity = Meteor.isClient ? Session.get('currentCity') : Users.myProp('currentCity');
  return currentCity && otherCity && currentCity !== otherCity;
}

Util.socialNameFromUrl = function(service, url) {
  return (url && /[^./]*$/.exec(url)[0]) || "";
}




Util.findClosestCity = function(latlon) {
  if (!latlon) return null;
  return _.min(CITIES, _.partial(Util.getDistanceFromLatLonObj, latlon)).key;
}

Util.getCityLocation = function(city) {
  var city = CITYMAP[city] || {};
  if (!city.latitude || !city.longitude) return null;
  else return {lat: city.latitude, lng: city.longitude};
}



// CLIENT ONLY

if (Meteor.isClient) {


  // auto grow input fields
  // resizing fields depending on their text size
  Util.initializeAutoGrow = function() {
    $("input.text").each(function() {
      $(this).autoGrowInput({
        comfortZone: parseInt($(this).css('font-size')),
        minWidth: 150,
        maxWidth: 500
      });
    });
  }


  // adding a class to a html element for a specified duration (in ms)  
  Util.addTemporaryClass = function($elm, className, duration) {
    $elm.addClass(className);
    Meteor.setTimeout(function() {
      $elm.removeClass(className);
    }, duration || 1000);
  }  

}







