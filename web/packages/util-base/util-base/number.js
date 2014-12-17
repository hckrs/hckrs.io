
Util.fixedDecimals = function(value, decimals) {
  return parseFloat(value).toFixed(decimals);
}

Util.convertToCurrency = function(value) {
  if (typeof(value) !== 'number') return "";
  var val = Util.fixedDecimals(value, 2);
  return "€ " + val.replace('.00', '.-').replace('.', ',');
}