
// Route Controller

HighlightsController = DefaultController.extend({
  template: 'highlights',
  waitOn: function() {
    var city = Session.get('currentCity');
    return [ Meteor.subscribe('highlights', city) ];
  },
  onBeforeAction: function() {
    var user = Meteor.user();

    // redirect to hackers page if there are no highlights
    // except for ambassadors and admins
    if (this.ready() && Highlights.find().count() === 0 && !(user.isAdmin || user.ambassador))
      Router.go('hackers');
    
  },
  onAfterAction: function() {
    Interface.setHeaderStyle('fixed');
  }
});




// TEMPLATE DATA
// feed templates with data

var highlights = function() {
  return Highlights.find({}, {sort: {order: 1}}).fetch()
}

Template.highlights.helpers({
  'highlights': function() {
    return highlights();
  }
});

Template.highlightSectionDetails.helpers({
  'relatedUser': function(userId) {
    return Meteor.users.findOne(userId);
  }
});



// EVENTS

Template.highlights.events({
  'click a.up': function(event) {
    event.preventDefault(); //don't open url
    $("#onePageScroll").moveUp();
  },
  'click a.down': function(event) {
    event.preventDefault(); //don't open url
    $("#onePageScroll").moveDown();
  }
})


// RENDERING

var setupOnePageScroll = function() {

  var buttonVisibility = function() {
    var isFirst = $("#onePageScroll").isFirstPage();
    var isLast = $("#onePageScroll").isLastPage();
    $('#highlights a.up')[isFirst ? 'addClass' : 'removeClass']('hide');
    $('#highlights a.down')[isLast ? 'addClass' : 'removeClass']('hide');
  }

  var setSelectedHighlight = function(index) {
    var data = highlights();
    Session.set('selectedHighlightId', data && data[index]._id);
  }

  var $onePageScroll = $("#onePageScroll").onepage_scroll({
    sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
    easing: "ease", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in", "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
    animationTime: 900, // AnimationTime let you define how long each section takes to animate
    pagination: true, // You can either show or hide the pagination. Toggle true for show, false for hide.
    updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
    loop: false, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
    responsiveFallback: false, // You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.
    afterMove: function() {
      var index = $onePageScroll.getIndex() - 1;
      buttonVisibility(index)
      setSelectedHighlight(index);
    }
  });

  if (hasAmbassadorPermission())
    HighlightEditor.initSortable();

  setSelectedHighlight(0);
  buttonVisibility(0);
  
  return $onePageScroll;
}



Template.highlights.rendered = function() {
  this.onePageScroll = setupOnePageScroll();  
}

Template.highlights.destroyed = function() {
  this.onePageScroll.disable();
}



