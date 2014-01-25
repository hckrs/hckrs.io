Future = Npm.require('fibers/future');
YQL = Npm.require('yql');


// synchronized version
YQL.execSync = function(query, data) {
  var future = new Future();
  YQL.exec(query, function(r) { future.return(r); }, data || {});
  return future.wait();
}

// query a webpage by css selectors (synchronized)
YQL.queryHTML = function(selector, url) {
  var query = "use 'http://yqlblog.net/samples/data.html.cssselect.xml' as data.html.cssselect \
               select * from data.html.cssselect where url=@url \
               and css=@selector";
  var result = YQL.execSync(query, {selector: selector, url: url});
  return pathValue(result, 'query.results.results') || {};
}


// helpers

// find a value in an object by giving a path
// pathValue(user, "profile.name") --> user['profile']['name']
pathValue = function(obj, path) {
  var paths = path.split('.')
  var current = obj;
  _.each(paths, function(path) {
    if (current[path] == undefined) return undefined;
    current = current[path];
  }); return current;
}