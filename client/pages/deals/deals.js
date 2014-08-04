
// Route Controller

DealsController = DefaultController.extend({
  template: 'deals',
  waitOn: function () {
    var city = Session.get('currentCity');
    return [ 
      Meteor.subscribe('deals', city),
      Meteor.subscribe('dealsSort', city) 
    ];
  }
});


// query

var selector = function() {
  var city = Session.get('currentCity');
  return hasAmbassadorPermission() ? {} : {hiddenIn: {$ne: city}};
}

DealsSorted = function() {
  var city = Session.get('currentCity');
  var sort = (DealsSort.findOne({city: city}) || {}).sort || [];
  return _.sortBy(Deals.find(selector()).fetch(), function(deal) {
    return _.indexOf(sort, deal._id);
  });
}


// editor 

var editor = new Editor('Deals');



// Template helpers

Template.deals.helpers({
  'isEmpty': function() {
    return Deals.find(selector()).count() === 0;
  },
  'deals': function() {
    return DealsSorted();
  },
  'editor': function() {
    return editor;
  }
});

Template.deal.helpers({
  'codeType': function() {
    return /^http/.test(this.code) ? 'url' : 'code';
  },
  'isSelected': function() {
    return this._id === editor.selectedId() ? 'selected' : '';
  },
  'mode': editor.mode,
});





/* events */

Template.deal.events({
  "click .deal": function(evt) {
    var dealId = $(evt.currentTarget).data('id');
    editor.select(dealId, true);
  },
});

Template.deals.events({
  "click #DealsEditor [action='edit']": function() {
    // select first deal
    if (!editor.selectedId()) {
      var firstDealId = $("#dealsContainer .deal").onScreen().data('id');
      if (firstDealId) 
        editor.select(firstDealId);
    }
  },
});






// DB

var updateSort = function(sort) {
  Meteor.call('updateDealsSort', sort, function(err) {
    if (err) console.log(err);
  });
}



// Template instance

Template.deals.rendered = function() {
  
  // make deals sortable for ambassadors
  if (hasAmbassadorPermission()) {
    var $deals = this.$('#dealsContainer');
    $deals.addClass('draggable');
    $deals.sortable({ 
      axis: "y",
      cursor: 'move', 
      handle: '.drag-handle',
      stop: function(event, ui) {
        var sort = $deals.sortable('toArray', {attribute: 'data-id'});
        updateSort(sort);
      }
    });
  }
}