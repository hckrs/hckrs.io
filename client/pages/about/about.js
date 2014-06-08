// Route Controller

AboutController = DefaultController.extend({
  template: 'about',
  waitOn: function () {
    return [];
  }
});





/* ABOUT */

// bind absolute domain to about template
Template.about.helpers({
  "absoluteUrl": function() { 
    return cityFromUrl() + '.' + appHostname();
  }
});