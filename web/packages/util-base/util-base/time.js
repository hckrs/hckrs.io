
// get new Date() object by using format YYYY-MM-DD hh::mm:ss
Util.newDate = function(dateString) {
  if (!dateString)
    return moment().toDate();
  return moment(dateString, "YYYY-MM-DD hh:mm:ss").toDate();
}

Util.dateTimeFormat = function(date, format) {
  if (!date) return "";
  if (!_.isString(format)) 
    format = "YYYY/MM/DD hh:mm";
  return moment(date).format(format);
}

Util.dateFormat = function(date, format) {
  if (!date) return "";
  if (!_.isString(format)) 
    format = "YYYY/MM/DD";
  return moment(date).format(format);
}

Util.timeFormat = function(date, format) {
  if (!date) return "";
  if (!_.isString(format)) 
    format = "hh:mm";
  return moment(date).format(format);
}

Util.calendar = function(date) {
  return moment(date).calendar();
}