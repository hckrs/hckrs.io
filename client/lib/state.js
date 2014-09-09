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
  this.toggle = function(field) {
    this.set(field, !this.get(field));
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
    return Deps.autorun(function() {
      newVal = self.get(field);
      if (!skipFirstRun || !c.firstRun) {
        Deps.nonreactive(function() {
          func(newVal, prevVal);
        });
      }
      prevVal = newVal;
    });
  }

  // set default values
  this.setDefaultObj(defaults);
}
