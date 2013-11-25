
/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { return Meteor.users.find().count(); }
});

// typer text on frontpage
Template.frontpage.rendered = function() {
  var texts = ['web','app','software','design','life','hardware','life','game'];
  $('#target').teletype({ text: texts }); 
  $('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 500 });
}


/* HACKERS list */

// bind hackers to template
Template.hackers.helpers({
  "hackers": function() { return Meteor.users.find({}, {reactive: false}).fetch(); }
});


/* GENERAL */

// background image depending on time
$( document ).ready(function() {
    var currentTime = new Date().getHours();
    if (7 <= currentTime && currentTime < 19) {
        $('body').css('background-image', 'url(/img/background.jpg)');
    } else {
        $('body').css('background-image', 'url(/img/background_night.jpg)');
    }
});