
/* FRONTPAGE */

// state
var state = new State('frontpage', {
  "enrollActive": false,
});


// template helpers

Template.frontpage.helpers({
  'hideWelcomeScreen': function() {
    // Make sure the welcome screen pops up only once.
    // Use localstorage to know the user have seen the screen already someday.
    // But because local storage isn't shared between cities, we also detect browser redirect from another city.
    var isRedirect = document.referrer && _.isEqual(Url.domain(), Url.domain(document.referrer));
    var alreadyShown = amplify.store('hideWelcomeScreen');
    return isRedirect || alreadyShown ? 'hide' : '';
  },
  'enrollActive': function() {
    return state.get('enrollActive') ? 'active' : '';
  },
  'loginFailure': function() {
    return Session.get('serviceLoginError') ? 'failure' : '';
  },
  'invitationBroadcastUser': function() {
    var phrase = Url.bitHashInv(Session.get('inviteBitHash'));
    return phrase && Users.findOne({invitationPhrase: phrase});
  },
  'staff': function() {
    return Users.find({$and: [
      {"roles.staff": {$exists: true}},
      {"roles.staff": {$not: {$size: 0}}}
    ]}).fetch();
  },
  'admins': function() {
    // admin without the staff members
    return Users.find({$and: [
      {"isAmbassador": true},
      {$or: [
        {"roles.staff": {$exists: false}},
        {"roles.staff": []}
      ]}
    ]}).fetch();
  }
});


// template events

Template.frontpage.events({
  'click a': function(evt) {

    // drop down enrollment overlay (if opened) after some navigation handling.
    state.set('enrollActive', false);

    // scroll to certain anchor
    var href = $(evt.currentTarget).attr('href');
    if (href.substring(0, 1) === "#") // check for hash anchor
      $(document).scrollTo(href, {duration: 800});
  },
  'click a[href="#enroll"]': function() {
    state.set('enrollActive', true);
  },
  'click a[href="#video"]#video-btn-small': function() {
    Meteor.setTimeout(showVideo, 1200);
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


// template render

Template.frontpage.rendered = function() {
  var tmpl = this;
  $('head').append('<script async defer id="github-bjs" src="https://buttons.github.io/buttons.js"></script>');

  // drop welcome screen with animation
  Util.exec(function() {
    Meteor.setTimeout(function() {
      $("#welcomeOverlay").addClass('anim-dropout');
      amplify.store('hideWelcomeScreen', true);
    }, 3500);
  });

  // focus location finder
  Meteor.setTimeout(function() {
    var isEmpty = _.isEmpty($("#welcome input").val());
    var hash = Router.current().getParams().hash;
    if (isEmpty && (!hash || hash == 'welcome'))
      $("#welcome input").focus();
  }, 3500);

  // make enroll button fixed after certain scroll position
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

  // slides navigation circles at the right of the screen
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
  var texts = ['Makes you a better hacker.'];
  $('#typer-target').teletype({ text: texts });
  $('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 0 });
}


// helper functions

var showVideo = function() {
  $(document).scrollTo("#video", {duration: 0});
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

