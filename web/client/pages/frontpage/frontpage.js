
// Route Controller
FrontpageController = DefaultController.extend({
  template: 'frontpage',
});

/* FRONTPAGE */

// // bind total number of hackers to template
// Template.frontpage.helpers({
//   "totalHackers": function() {
//     var city = Session.get('currentCity');
//     var total = Meteor.users.find({city: city, isHidden: {$ne: true}}).count();
//     var minimum = Settings['minimumUserCountToShow'];
//     return (total >= minimum) ? total : '';
//   },
//   "invitationBroadcastUser": function() {
//     var phrase = Url.bitHashInv(Session.get('inviteBitHash'));
//     return phrase && Users.findOne({invitationPhrase: phrase});
//   },
// });

// Template.ambassadors.helpers({
//   "ambassadors": function() {
//     var city = Session.get('currentCity');
//     var fields = Query.fieldsObj({
//       profile: ['name','picture','email'],
//       'isAmbassador': true,
//       'staff': true
//     });
//     var transform = function(user) {
//       user.twitter = Users.userSocialName(user._id, 'twitter');
//       return user;
//     }
//     return city && Users.find({city: city, isAmbassador: true}, {fields: fields}).map(transform);
//   },
// });


// events


Template.frontpage.rendered = function() {
  
  // drop welcome screen with animation
  Meteor.setTimeout(function() {
    $("#welcomeOverlay").addClass('anim-dropout');
  }, 4000);
  
  // focus location finder
  Meteor.setTimeout(function() {
    var hash = Router.current().getParams().hash;
    if (!hash || hash == 'welcome')
      $("#welcome input").focus();
  }, 5000);
  
  // fixed enroll button
  $("#enroll-btn").scrollspy({
    min: $("#enroll-btn").offset().top,
    max: $(document).height(),
    onEnter: function(elm, pos) {
      $(elm).addClass('fixed');
    },
    onLeave: function(elm) {
      $(elm).removeClass('fixed');
    }
  });
  
  // slide navigation circles
  $(".slide").each(function() {
    var id = $(this).attr('id');
    var offset = $(this).offset().top - $(window).height()/2;  
    var $nav = $("#frontpage-slide-nav");
    $(this).scrollspy({
      min: offset,
      max: offset + $(this).height(),
      onEnter: function(elm, pos) {
        $nav.find("a").removeClass('active');
        $nav.find("a[href='#"+id+"']").addClass('active');
      },
    });
  });
}



// typer text on frontpage
// Template.frontpage.rendered = function() {
//   var tmpl = this;
//   tmpl.$('.blink').each(function() {
//     var elem = tmpl.$(this);
//     setInterval(function() {
//         if (elem.css('visibility') == 'hidden') {
//             elem.css('visibility', 'visible');
//         } else {
//             elem.css('visibility', 'hidden');
//         }
//     }, 500);
//   });
//   var texts = ['web','app','software','game','design','life','hardware','life','open source','growth'];
//   tmpl.$('#target').teletype({ text: texts });
//   tmpl.$('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 500 });
// }
