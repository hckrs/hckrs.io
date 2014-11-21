_.mixin({
  pickRename: function(obj, map) {
    var res = {};
    _.each(map, function(new_name, old_name) {
      res[_.isString(new_name) ? new_name : old_name] = obj[old_name];
    });
    return res;
  }
});
