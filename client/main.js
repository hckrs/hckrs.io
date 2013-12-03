
/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { 
    var total = Session.get('totalHackers');
    return _.isNumber(total) ? total : '...'; 
  }
});

// request number of hackers when template frontpage is created 
Template.frontpage.created = function() {
  // request from server the number of hackers
  Meteor.call('totalHackers', function(error, total) {
    Session.set('totalHackers', total);
  });
}

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

Template.invitations.helpers({
  'total': function() { return Invitations.find().count(); },
  'totalUsed': function() { return Invitations.find({used: true}).count(); },
  'totalUnused': function() { return Invitations.find().count() - Invitations.find({used: true}).count(); },
  'invitations': function() { return Invitations.find({}, {sort: {used: -1}}).fetch(); },
  'link': function() { return Router.routes['invite'].url(this); },
  'screenName': function() { return this.name || 'anonymous'; }
});



/* GENERAL */


// html document fully loaded and rendered
$(document).ready(function() {

  // change background image depending on time 
  // 1. night,  2. in daytime
  var currentTime = new Date().getHours();
  var isNight = currentTime < 7 || currentTime >= 19;
  var image = isNight ? "background_night.jpg" : "background.jpg";
  $('body').css('background-image', 'url(/img/'+image+')');

});


// execute when one of the (sub)templates of main is rerendered
Template.main.rendered = function() {
  
  // auto grow input fields
  // resizing fields depending on their text size
  $("input.text").autoGrowInput({
    comfortZone: 8,
    minWidth: 100,
    maxWidth: 500
  });
  
}