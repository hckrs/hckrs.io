Startup = {};

// this code loads first because of
// the alphabetic filename load order




Meteor.startup(function() {

  // language
  // XXX use English with Europe formatting
  // in the future we probably use navigator.language || navigator.userLanguage;
  moment.lang('en-gb');

  // setup page transitions
  initPageTransitions();

  // extract city from domain
  checkCurrentCity();

  // Facebook SDK
  initFacebook();

  // Twitter SDK
  initTwitter();
});




// extract city from domain
var checkCurrentCity = function() {
  var subdomain = Url.city()
  var city = City.lookup(subdomain);

  if (!city)
    return;

  // set current city in session
  Session.set('currentCity', city.key);

  // relaxing the same origin policy so that javascript
  // can communicate between different city domains
  // this is required to do OAuth request.
  // In the oauth package this same line must be included too.
  if (document.domain && document.domain.indexOf(Url.root()) !== -1)
    document.domain = Url.root();
}


// automatically activate page transitions after templates are loaded
var initPageTransitions = function() {

  // disable animation when back-button from browser is pressed
  var disableTransition = false;
  window.addEventListener('popstate', function() {
    disableTransition = true;
    setTimeout(function() {
      disableTransition = false;
    }, 500);
  });

  // animate route-transition after template is rendered
  _.each(_.keys(Template), function(templateName) {
    var template = Template[templateName];
    if (!template) return;
    var prevRenderFunc = template.rendered;
    template.rendered = function() {
      if (prevRenderFunc) prevRenderFunc.call(this);
      var $transitions = this.$(".route-transition");
      setTimeout(function() {
        $transitions.addClass('activated');
        if (!disableTransition)
          $transitions.addClass('animated');
      }, 0);
    }
  });
}

// initialize Facebook SDK
var initFacebook = function() {

  window.fbAsyncInit = function() {
    FB.init({
      appId      : Settings['facebook'].appId,
      xfbml      : false,
      version    : 'v2.0'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) return;
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
}

// initialize Twitter SDK
var initTwitter = function () {
  (function(d,s,id){
    var js, fjs = d.getElementsByTagName(s)[0], p=/^http:/.test(d.location)?'http':'https';
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = p + '://platform.twitter.com/widgets.js';
    fjs.parentNode.insertBefore(js,fjs);
  }(document, 'script', 'twitter-wjs'));
}
