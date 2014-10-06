/* HEADER */

Template.header.helpers({
  'backgroundImage': function() {
    return getBackground();
  },
  'headerStyle': function() {
    return Interface.getHeaderStyle();
  },
  'hidden': function() {
    // we hide the navigation bar by explicit set the style to fixed
    return Meteor.userId() ? '' : 'fixed';
  },
  'active': function() {
    var isActive = Meteor.userId() && !Session.equals('pageScrollDirection', 'down');
    return isActive ? 'active' : '';
  }
});

Template.header.events({
  "change #citySelect select": function(evt) {
    var city = $(evt.currentTarget).val();
    exec(function() {
      Router.goToCity(city);
    });
  }
});

