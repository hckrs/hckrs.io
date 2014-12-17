
// GEO

// geocoder for openstreet
// geocode = function(address, cb) {
//   var url = "http://nominatim.openstreetmap.org/search";
//   var options = {params: { format: 'json', q: address }};
//   var response = function(res) {
//     var loc = res && res.data && res.data[0];
//     if (loc && loc.lat && loc.lon)
//       return { lat: loc.lat, lng: loc.lon };
//   }
//   if (Meteor.isServer)
//     return response(HTTP.get(url, options));
//   else
//     HTTP.get(url, options, function(err, res) { cb(response(res)); });
// }

// geocode mapbox
Util.geocode = function(address, cb) {
  var url = "http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/"+address+".json";
  var options = {params: { format: "json", access_token: Settings['mapbox'].token }};
  
  var response = function(res) {
    var data = res && res.content && JSON.parse(res.content);
    var feature = data && data.features && data.features[0];
    var center = feature && feature.center;
    if (center)
      return { lat: center[1], lng: center[0] };
  }
  
  if (Meteor.isServer)
    return response(HTTP.get(url, options));
  else
    HTTP.get(url, options, function(err, res) { cb(response(res)); });
}


Util.getDistanceFromLatLonObj = function(latlong1, latlong2) {
  var lat1 = latlong1.latitude || latlong1.lat;
  var lon1 = latlong1.longitude || latlong1.lon;
  var lat2 = latlong2.latitude || latlong2.lat;
  var lon2 = latlong2.longitude || latlong2.lon;
  return Util.getDistanceFromLatLon(lat1, lon1, lat2, lon2);
}

Util.getDistanceFromLatLon = function(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = Util.deg2rad(lat2-lat1);  // deg2rad below
  var dLon = Util.deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(Util.deg2rad(lat1)) * Math.cos(Util.deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d; // km
}

Util.deg2rad = function(deg) {
  return deg * (Math.PI/180)
}

// request the location for some IP address
// using the service of Telize.com
Util.requestLocationForIp = function(ip) {
  if (ip === "127.0.0.1") 
    ip = ""; // if on localhost, let telize determine my ip.
  try {
    var data = HTTP.get("http://www.telize.com/geoip/" + ip, {timeout: 2000}).data;
    return _.pick(data, 'longitude', 'latitude');
  } catch(err) {
    console.log("request client-IP error:", err);
  }
}