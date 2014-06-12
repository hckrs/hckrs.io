// this code loads first because of
// the alphabetic filename load order


Meteor.startup(function() {

  // language
  // XXX use English with Europe formatting
  // in the future we probably use navigator.language || navigator.userLanguage; 
  moment.lang('en-gb'); 

  // check for login
  observeLoginState();

  // setup page transitions
  initPageTransitions();

  // extract city from domain
  extractCityFromDomain();
});


// extract city from domain
var extractCityFromDomain = function() {
  var city = CITYMAP[Url.city()];
  if (!city) return;
  Session.set('currentCity', city);
    
  // relaxing the same origin policy so that javascript
  // can communicate between different city domains
  // this is required to do OAuth request.
  // In the oauth package this same line must be included too. 
  document.domain = Url.root(); 
}


// automatically activate page transitions after templates are loaded
var initPageTransitions = function() {
  _.each(Template, function(template, templateName) {
    var prevRenderFunc = template.rendered;
    template.rendered = function() {
      if (prevRenderFunc) prevRenderFunc.call(this);
      Meteor.setTimeout(function() {
        $(".route-transition").addClass('activated');
      }, 200);
    }
  });
}