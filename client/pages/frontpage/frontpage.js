
// Route Controller

FrontpageController = DefaultController.extend({
  template: 'frontpage',
  waitOn: function () {
    return [ Meteor.subscribe('publicUsers') ];
  }

});





/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { 
    if(Meteor.users.find().count()>=100){
      return Meteor.users.find().count() || ''; 
    }
  },
  "invitationBroadcastUser": function() {
    return Session.get('invitationBroadcastUser');
  }
});


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
  var texts = ['web','app','software','game','design','life','hardware','life','open source','growth'];
  $('#target').teletype({ text: texts }); 
  $('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 500 });
}