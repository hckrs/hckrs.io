var fs = Npm.require('fs');
var path = Npm.require('path');
var Future = Npm.require("fibers/future");
var Fiber = Npm.require('fibers');


// store extern image on local filesystem, then process a function
// 1. get image from url, store on local filesystem
// 2. process function by calling it with the local resource location
// 3. clean temporary file and return the result
ProcesssImageResource = function(url, processFunc) {
  var file = sync(requestResource, url, {encoding: null});
  var result = processFunc(file);
  sync(removeResource, file);
  return result;
}
ProcesssImageResources = function(urls, processFunc) {
  return sync(async.map, urls, fiber(function(url, cb) {
    cb(null, ProcesssImageResource(url, processFunc));
  }));
}


// calculate the average image color
AverageImageColor = function(file) {
  try {
    var features = Imagemagick.identify(file);
    return {
      r: parseInt(features['channel statistics'].red.mean),
      g: parseInt(features['channel statistics'].green.mean),
      b: parseInt(features['channel statistics'].blue.mean)
    };
  } catch(e) {
    return { r:0, g:0, b:0 };
  }
}

// get image size {width: Number, height: Number} from local image
ImageSize = function(file) {
  try {
    var features = Imagemagick.identify(file);
    return _.pick(features, 'width', 'height');
  } catch(e) {
    return { width: 0, height: 0 };
  }
}


// request resource from an url
// and store them on the local file system
// return the location of the stored file
var requestResource = function(url, options, cb) {
  var file = "/tmp/" + Random.id();
  request(_.extend({url: url}, options || {}))
  .on('end', function() { return cb(null, file); })
  .pipe(fs.createWriteStream(file));
}

// remove a file on the location file system
// at the specified location
var removeResource = function(file, cb) {
  return fs.unlink(file, cb);
}


