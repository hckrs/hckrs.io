Util = {};

log = function() {
  console.log.apply(console, arguments);
}

debug = function(err, res) {
  err ? console.log('Error:', err) : console.log(res);
}