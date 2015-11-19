/* Random */

Random.subarray = function(a, min, max) {
  var l; 

  if (_.isNumber(min) && _.isNumber(max))
    l = Math.floor(Random.fraction() * (max - min) + min);
  else if (_.isNumber(min) && _.isUndefined(max))
    l = min;
  else if (_.isUndefined(min) && _.isUndefined(max))
    l = Math.floor(Random.fraction() * a.length);
  else
    console.error("Wrong arguments provided to 'Random.subarray'.");
    
  return _.first(_.shuffle(a), l);
}