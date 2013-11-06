
/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { return Meteor.users.find().count(); }
});

// typer text on frontpage
Template.frontpage.rendered = function() {
  var texts = ['node.js','arduino','design','game','UX','hardware','life','backbone.js','mobile'];
  $('#target').teletype({ text: texts }); 
  $('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 500 });
}


/* HACKERS list */

// bind hackers to template
Template.hackers.helpers({
  "hackers": function() { return Meteor.users.find({}, {reactive: false}).fetch(); }
});