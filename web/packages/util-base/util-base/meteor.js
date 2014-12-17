

// sort array with docs
// sort unlisted items at front by {createdAt: -1}
Util.sortedDocs = function(docs, ids) {
  docs = _.sortBy(docs, function(doc){  // ASC
    var date = Util.property(doc, 'createdAt'); 
    if (!date) console.log('WARNING:', 'Date attribute not present in doc that must be sorted.')
    return date && date.getTime(); 
  }); 
  return _.sortBy(docs, function(doc, i) {
    var idx = _.indexOf(ids, doc._id);
    return idx < 0 ? -i : idx; // not(present) ? DESC : indexOf
  });
}

// execute a performance intensive function after a short delay
// this delay is used to update UI elements.
// Notice that this function runs asynchronously.
Util.exec = function(func) {
  setTimeout(func, 50);
}

// create a mongo field specifier object from an nested object with field names
// but at this time meteor is reactive on top-level properties, so defining
// nested objects is not leading to better performance
Util.fieldsObj = function(obj) {
  var objToArray = function(obj) {
    var field = function(val, prefix) {
      var arr;
      if (_.isArray(val))       arr = val;
      else if (_.isObject(val)) arr = objToArray(val);
      else return prefix;
      return _.map(arr, function(postfix) { return prefix+'.'+postfix; });  
    }
    return _.flatten(_.map(obj, field));
  }
  return Util.fieldsArray(objToArray(obj));
}

// create a mongo field specifier object from array with field names
Util.fieldsArray = function(fields) {
 return _.object(fields, _.map(fields, function() { return 1; })); 
}


