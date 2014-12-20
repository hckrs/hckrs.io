
// Copyright Jarno Le Conté

var isOnScreen = function() {

  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();

  var elemTop = $(this).offset().top;
  var elemBottom = elemTop + $(this).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

$.fn.onScreen = function() {
  return this.filter(isOnScreen);
}

$.fn.isOnScreen = function() {
  return isOnScreen.call(this);
}

