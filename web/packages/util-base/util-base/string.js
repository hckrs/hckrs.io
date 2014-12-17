
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
}

Util.capitaliseFirstLetter = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

Util.decodeHtmlEntities = function(str) {
  return $('<div />').html(str).text();
}


Util.wrap = function(val, wrap1, wrap2) {
  return [wrap1, val, wrap2].join('');
}

Util.sentenceFromList = function(val, sep, sep2, wrap1, wrap2) {
  val = _.map(val, function(v) { return Util.wrap(v, wrap1, wrap2); });
  return _.compact([_.initial(val).join(sep), _.last(val)]).join(sep2);
}