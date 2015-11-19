/* SafeString */

Safe = {}

Safe.string = function(str) {
  return new Spacebars.SafeString(str);
}

Safe.url = function(url, options) {
  options = options || {};
  text = options.text || Url.domain(url);
  target = options.target === 'self' ? '' : 'target="_'+(options.target || 'blank')+'"';
  return url ? Safe.string('<a href="'+url+'" '+target+'>'+text+'</a>') : '';
}

Safe.email = function(email, options) {
  options = options || {};
  text = options.text || email;
  return email ? Safe.string('<a href="mailto:'+email+'">'+text+'</a>') : '';
}