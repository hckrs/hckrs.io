
log = function() {
  console.log.apply(console, arguments);
}

capitaliseFirstLetter = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

omitNull = function(obj) {
  obj = _.clone(obj);
  _.each(obj, function(val, key) {
    if (_.isNull(val)) delete obj[key];
  }); return obj;
}


if (Meteor.isClient) {

  Handlebars.registerHelper('equals', function(val1, val2) {
    return val1 == val2;
  });

}