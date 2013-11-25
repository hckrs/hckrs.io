
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


// html document fully loaded and rendered

  // change background image depending on time 
  var currentTime = new Date().getHours();
  var isNight = currentTime < 7 || currentTime >= 19;
  var image = isNight ? "background_night.jpg" : "background.jpg";
  $('body').css('background-image', 'url(/img/'+image+')');

});