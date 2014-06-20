
// Route Controller

FrontpageController = DefaultController.extend({
  template: 'frontpage',
  waitOn: function () {
    return [];
  }

});





/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { 
    var city = Session.get('currentCity');
    var total = Meteor.users.find({city: city}).count();
    var minimum = Settings['minimumUserCountToShow'];
    return (total >= minimum) ? total : ''; 
  },
  "invitationBroadcastUser": function() {
    return Session.get('invitationBroadcastUser');
  },
  "cities": function() {
    return CITIES;
  },
  "selected": function(city) {
    return Session.equals('currentCity', city) ? 'selected' : '';
  }
});

Template.ambassadors.helpers({
  "ambassadors": function() {
    var city = Session.get('currentCity');
    return Users.find({"ambassador.city": city}).fetch();
  }
});


// events

Template.frontpage.events({
  "change #city": function(evt) {
    var city = $(evt.currentTarget).val();
    exec(function() {
      Router.goToCity(city);  
    });
  }
});

Template.ambassadors.events({
  "click .action-email": function() {
    var email = this.profile.email;
    location.href = "mailto:" + email;
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