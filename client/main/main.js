
/* GENERAL */

// update datetime in session every second
// reactive templates will update automatically

Session.set('date', new Date());
Meteor.setInterval(function() {
  Session.set('date', new Date());
}, 60000);

UI.body.rendered = function() {
  Deps.autorun(function() {
    var bg = Url.cityBackground();
    $("body").css('background-image', 'url("' + bg + '")');
  });
}

