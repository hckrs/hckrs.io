_.mixin({
  deepPluck: function (obj, key) {
    return _.map(obj, function (value) { return _.deep(value, key); });
  }
});

// Usage:
//
// var arr = [{
//   deeply: {
//     nested: 'foo'
//   }
// }, {
//   deeply: {
//     nested: 'bar'
//   }
// }];
// 
// _.pluckDeep(arr, 'deeply.nested'); // ['foo', 'bar']
