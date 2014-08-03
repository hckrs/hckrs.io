
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
    var total = Meteor.users.find({city: city, isHidden: {$ne: true}}).count();
    var minimum = Settings['minimumUserCountToShow'];
    return (total >= minimum) ? total : ''; 
  },
  "invitationBroadcastUser": function() {
    var phrase = Session.get('invitationPhrase');
    return phrase && Users.findOne({invitationPhrase: phrase});
  },
});

Template.ambassadors.helpers({
  "ambassadors": function() {
    var city = Session.get('currentCity');
    var fields = fieldsObj({
      profile: ['name','picture','email'],
      ambassador: ['title']
    });
    var transform = function(user) {
      user.twitter = userSocialName(user._id, 'twitter');
      return user;
    }
    return city && Users.find({"ambassador.city": city}, {fields: fields}).map(transform);
  },
  "title": function() {
    return this.ambassador.title || "Ambassador";
  }
});


// events

Template.frontpage.events({
  "change #citySelect select": function(evt) {
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
  var tmpl = this;
  tmpl.$('.blink').each(function() {
    var elem = tmpl.$(this);
    setInterval(function() {
        if (elem.css('visibility') == 'hidden') {
            elem.css('visibility', 'visible');
        } else {
            elem.css('visibility', 'hidden');
        }    
    }, 500);
  });
  var texts = ['web','app','software','game','design','life','hardware','life','open source','growth'];
  tmpl.$('#target').teletype({ text: texts }); 
  tmpl.$('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 500 });
}