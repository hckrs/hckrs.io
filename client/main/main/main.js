// header rendering
// hide or show header based on scrolling
Template.main.rendered = function() {
  var prevY = 0, newY = 0;
  $(window).on('scroll', function(evt) {
    newY = $(window).scrollTop();
    Session.set('pageScrollDirection', newY > prevY && newY > 50 ? 'down' : 'up');
    if (newY > 70)
      $("#header .floating").addClass('float');
    else
      $("#header .floating").removeClass('float');
    prevY = newY;
  });
}

