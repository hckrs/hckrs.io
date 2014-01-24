var fs = Npm.require('fs');
var path = Npm.require('path');
var Future = Npm.require("fibers/future");


// store extern image on local filesystem, then process a function
// 1. get image from url, store on local filesystem
// 2. process function by calling it with the local resource location
// 3. clean temporary file and return the result
ProcesssImageResource = function(url, processFunc) {
  var file = requestResource(url, {encoding: null});
  var result = processFunc(file);
  removeResource(file);
  return result;
}

// calculate the average image color
AverageImageColor = function(file) {
  var features = Imagemagick.identify(file);
  return {
    r: parseInt(features['channel statistics'].red.mean),
    g: parseInt(features['channel statistics'].green.mean),
    b: parseInt(features['channel statistics'].blue.mean)
  };
}



// request resource from an url
// and store them on the local file system
// return the location of the stored file
var requestResource = function(url, options) {
  var future = new Future();
  var file = "/tmp/" + Random.id();
  var options = _.extend({url: url}, options || {});
  request(options).on('end', future.resolver()).pipe(fs.createWriteStream(file));
  future.wait();
  return file;
}

// remove a file on the location file system
// at the specified location
var removeResource = function(file) {
  return fs.unlinkSync(file);
}

