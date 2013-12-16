
/* HEADER */

Template.header.helpers({
  'absoluteHeader': function() { 
    return Session.get('absoluteHeader') ? 'absolute' : ''; 
  },
  'inversedHeader': function() { 
    return Session.get('inversedHeader') ? 'inversed' : ''; 
  }
});



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
  $('.blink').each(function() {
    var elem = $(this);
    setInterval(function() {
        if (elem.css('visibility') == 'hidden') {
            elem.css('visibility', 'visible');
        } else {
            elem.css('visibility', 'hidden');
        }    
    }, 500);
  });
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
  'unusedTotal': function() { return Meteor.user().invitations; },
  'invitedTotal': function() { return Invitations.find().count(); },
  'link': function() { 
    var phrase = bitHash(Meteor.user().invitationPhrase);
    return Router.routes['invite'].url({phrase: phrase}); 
  },
  'invitedUsers': function() { return Invitations.find({}, {sort: {signedupAt: 1}}).fetch(); },
  'screenName': function() { return this.name || 'anonymous'; },
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
  $("input.text").each(function() {
    $(this).autoGrowInput({
      comfortZone: parseInt($(this).css('font-size')),
      minWidth: 100,
      maxWidth: 500
    });
  });
  
}


// reset local storage after running 
// "meteor reset" on the terminal
Meteor.startup(function() {
  Meteor.call('totalHackers', function(error, total) {
    if (!error && total === 0)
      _.each(_.keys(amplify.store()), function(key) { amplify.store(key, null); });
  });
});