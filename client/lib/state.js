// meteor

State = function(namespace, defaults) {
  var self = this;
  var allFields = [];
  namespace += '_';
  
  this.defaults = _.clone(defaults);

  this.get = function(field) {
    return Session.get(namespace + field); 
  }
  this.set = function(field, val) {
    allFields.push(field);
    Session.set(namespace + field, val); 
  }
  this.setDefault = function(field, val) {
    if (_.isUndefined(this.get(field)))
      this.set(field, val);
  }
  this.toggle = function(field, val) {
    if (_.isUndefined(val)) // normal toggle
      this.set(field, !this.get(field)); 
    else // unset = when value already set, set = when it isn't current value
      this.set(field, this.equals(field, val) ? null : val);
  }
   
  this.getObj = function(fields) {
    fields = fields || allFields;
    return _.object(fields, _.map(fields, get));
  }
  this.setObj = function(obj) {
    _.each(obj, function(val, field) { 
      this.set(field, val);
    }, this);
  }
  this.setDefaultObj = function(obj) {
    _.each(obj, function(val, field) { 
      this.setDefault(field, val);
    }, this);
  }

  this.equals = function(field, val) {
    return Session.equals(namespace + field, val); 
  }

  this.observe = function(field, func, skipFirstRun) {
    var prevVal, newVal;
    return Tracker.autorun(function() {
      newVal = self.get(field);
      if (!skipFirstRun || !c.firstRun) {
        Tracker.nonreactive(function() {
          func(newVal, prevVal);
        });
      }
      prevVal = newVal;
    });
  }

  // set default values
  this.setDefaultObj(defaults);
}
