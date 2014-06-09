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
});




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