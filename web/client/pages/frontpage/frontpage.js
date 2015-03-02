
// Route Controller
FrontpageController = DefaultController.extend({
  template: 'frontpage',
  subscriptions: function() {
    this.subscribe('staff');
    this.subscribe('ambassadors');
  },
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

// state
var state = new State('frontpage', {
  "enrollActive": false,
});



// events


Template.frontpage.rendered = function() {
  var tmpl = this;

  // drop welcome screen with animation
  Util.exec(function() {
    Meteor.setTimeout(function() {
      $("#welcomeOverlay").addClass('anim-dropout');
    }, 3500);
  });

  // focus location finder
  Meteor.setTimeout(function() {
    var hash = Router.current().getParams().hash;
    if (!hash || hash == 'welcome')
      $("#welcome input").focus();
  }, 3500);

  // fixed enroll button
  $("#enroll-btn").scrollspy({
    min: $("#enroll-btn").offset().top - 20,
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

        switch ($(elm).attr('id')) {
          case 'about': $(elm).find("#to-top").addClass('visible'); break;
        }
      },
      onLeave: function(elm, pos) {
        switch ($(elm).attr('id')) {
          case 'about': $(elm).find("#to-top").removeClass('visible'); break;
        }
      }
    });
  });

  // typer text on frontpage intro overlay
  $('#typer-blink').each(function() {
    var $elem = $(this);
    setInterval(function() {
      var visibility = $elem.css('visibility') == 'hidden' ? 'visible': 'hidden';
      $elem.css('visibility', visibility);
    }, 500);
  });
  var texts = ['make you a better hacker'];
  $('#typer-target').teletype({ text: texts });
  $('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 0 });
}

Template.frontpage.events({
  'click a': function(evt) {
    state.set('enrollActive', false);
    var href = $(evt.currentTarget).attr('href');
    if (href.substring(0, 1) === "#") // check for hash anchor
      $(document).scrollTo(href, {duration: 800});
  },
  'click a[href="#enroll"]': function() {
    state.set('enrollActive', true);
  },
  'click #video-play': function(evt) {
    evt.preventDefault();
    showVideo();
  },
  'click #video-exit': function(evt) {
    evt.preventDefault();
    exitVideo();
  },
  'change #citySelect select': function(evt) {
    var city = $(evt.currentTarget).val();
    Util.exec(function() {
      Router.goToCity(city);
    });
  }

});




Template.frontpage.helpers({
  'staff': function() {
    return Users.find({"roles.staff": {$size: {$gt: 0}}}).fetch();
  },
  'admins': function() {
    return Users.find({
      "roles.staff": {$not: {$size: {$gt: 0}}},
      "isAmbassador": true
    }, {limit: 20}).fetch();
  },
  'enrollActive': function() {
    return state.get('enrollActive') ? 'active' : '';
  }
})

var showVideo = function() {
  $(document).scrollTo("#video");
  $("#video").addClass('playing');

  var video = $("#video video").get(0)
  video.play();
  video.onended = function() {
    exitVideo();
  }
}

var exitVideo = function() {
  $("#video").removeClass('playing');

  var video = $("#video video").get(0);
  video.pause();
  video.currentTime = 0;
}

