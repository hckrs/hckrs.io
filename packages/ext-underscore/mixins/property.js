
_.mixin({
  property: function(key) {
    return function(obj) {
      return obj[key];
    }
  }
});
