
var selector = function() {
  var city = Session.get('currentCity');
  return hasAmbassadorPermission() ? {} : {hiddenIn: {$ne: city}};
}

// get sorted highlights
HighlightsSorted = function(options) {
  var city = Session.get('currentCity');
  var sort = (HighlightsSort.findOne({city: city}) || {}).sort || [];
  return _.sortBy(Highlights.find(selector(), options).fetch(), function(highlight) {
    return _.indexOf(sort, highlight._id);
  });
}


// Route Controller

HighlightsController = DefaultController.extend({
  template: 'highlights',
  waitOn: function() {
    var city = Session.get('currentCity');
    return [ 
      Meteor.subscribe('highlights', city),
      Meteor.subscribe('highlightsSort', city),
    ];
  },
  onBeforeAction: function() {

    // redirect to hackers page if there are no highlights
    // except for ambassadors and admins
    if (this.ready() && Highlights.find(selector()).count() === 0 && !hasAmbassadorPermission())
      Router.go('hackers');
    
  },
  onAfterAction: function() {
    Interface.setHeaderStyle('fixed');
  }
});


// editor 

var editor = new Editor('Highlights');




// TEMPLATE DATA
// feed templates with data

Template.highlights.helpers({
  'highlights': function() {
    return HighlightsSorted();
  },
  'editor': function() {
    return editor;
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

// after cancel form which is in add-mode
// we select the previous selected highlight item
Template.highlights.events({ 
  "click [action='cancel']": function() {
    editor.select(indexToId(1));
  },
});



// RENDERING

var indexToId = function(index) {
  var data = HighlightsSorted({fields: {_id: 1}});
  return data &&  index > 0 && data[index-1] && data[index-1]._id;
}
var idToIndex = function(id) {
  var data = HighlightsSorted({fields: {_id: 1}}).map(_.property('_id'));
  return _.indexOf(data, id) + 1;
}



var setupOnePageScroll = function(tmpl) {

  var buttonVisibility = function() {
    var isFirst = tmpl.$("#onePageScroll").isFirstPage();
    var isLast = tmpl.$("#onePageScroll").isLastPage();
    tmpl.$('#highlights a.up')[isFirst ? 'addClass' : 'removeClass']('hide');
    tmpl.$('#highlights a.down')[isLast ? 'addClass' : 'removeClass']('hide');
  }

  var $onePageScroll = tmpl.$("#onePageScroll").onepage_scroll({
    sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
    easing: "ease", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in", "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
    animationTime: 400, // AnimationTime let you define how long each section takes to animate
    pagination: true, // You can either show or hide the pagination. Toggle true for show, false for hide.
    updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
    loop: false, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
    responsiveFallback: false, // You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.
    afterMove: function() {
      var index = $onePageScroll.getIndex();
      buttonVisibility(index)
      editor.select(indexToId(index))
    }
  });

  // make sortable for ambassadors
  if (hasAmbassadorPermission())
    HighlightEditor.initSortable();
  
  return $onePageScroll;
}



Template.highlights.rendered = function() {
  var self = this;

  this.onePageScroll = setupOnePageScroll(this);  
  
  var initialized = false;
  this.observer = Highlights.find().observe({
    'added': function() { if (initialized) Router.reload(); },
    'removed': function() { Router.reload(); }
  });
  initialized = true;

  // observe selected
  var move = function(id) {
    var index = $('#onePageScroll section[data-id="'+id+'"]').data('index');
    self.onePageScroll.moveTo(index || 1);
  }
  this.selectedObserver = editor.observe('selectedId', move);

  
  // move to selected first
  if (editor.selectedId())
    move(editor.selectedId())

  // set first selected
  if (!editor.selectedId())
    editor.select(indexToId(1))  

  
}

Template.highlights.destroyed = function() {
  this.onePageScroll.disable();
  this.observer.stop();
  this.selectedObserver.stop();
}



// sorting

var updateSort = function(sort) {
  Meteor.call('updateHighlightsSort', sort, function(err) {
    if (!err) Router.reload();
  });
}


// public

HighlightEditor = {}

// init jquery sortable
HighlightEditor.initSortable = function() {
  var $pagenation = $(".onepage-pagination");

  // add cursor class
  $pagenation.addClass('draggable');

  // set highlight id attributes on pagenation circles
  var ids = _.pluck(HighlightsSorted(), '_id');
  $pagenation.find("li").each(function(i) { 
    $(this).attr('data-id', ids[i]); 
  });

  // init sortable
  $pagenation.sortable({ 
    axis: "y",
    cursor: 'move', 
    stop: function(event, ui) {
      var sort = $pagenation.sortable('toArray', {attribute: 'data-id'});
      updateSort(sort);
    }
  });
}

