
// Route Controller

GiftsController = DefaultController.extend({
  template: 'gifts',
  waitOn: function () {
    var city = Session.get('currentCity');
    return [ 
      Meteor.subscribe('gifts', city),
      Meteor.subscribe('giftsSort', city) 
    ];
  }
});


// query

var selector = function() {
  var city = Session.get('currentCity');
  return hasAmbassadorPermission() ? {} : {hiddenIn: {$ne: city}};
}

GiftsSorted = function() {
  var city = Session.get('currentCity');
  var sort = (GiftsSort.findOne({city: city}) || {}).sort || [];
  return _.sortBy(Gifts.find(selector()).fetch(), function(gift) {
    return _.indexOf(sort, gift._id);
  });
}


// editor 

var editor = new Editor('gifts');
Meteor.startup(function() {
  editor.setCollection(Gifts);
});



// Template helpers

Template.gifts.helpers({
  'isEmpty': function() {
    return Gifts.find(selector()).count() === 0;
  },
  'gifts': function() {
    return GiftsSorted();
  },
  'editor': function() {
    return editor;
  }
});

Template.gift.helpers({
  'codeType': function() {
    return /^http/.test(this.code) ? 'url' : 'code';
  },
  'isSelected': function() {
    return this._id === editor.selectedId() ? 'selected' : '';
  },
  'mode': editor.mode,
});





/* events */

Template.gift.events({
  "click .gift": function(evt) {
    var giftId = $(evt.currentTarget).data('id');
    editor.select(giftId, true);
  },
});

Template.editorForm.events({
  "click [action='edit']": function() {
    // select first gift
    if (!editor.selectedId()) {
      var firstGiftId = $("#giftsContainer .gift").onScreen().data('id');
      editor.select(firstGiftId);
    }
  },
});






// DB

var updateSort = function(sort) {
  Meteor.call('updateGiftsSort', sort, function(err) {
    if (err) console.log(err);
  });
}



// Template instance

Template.gifts.rendered = function() {
  
  // make gifts sortable for ambassadors
  if (hasAmbassadorPermission()) {
    var $gifts = this.$('#giftsContainer');
    $gifts.addClass('draggable');
    $gifts.sortable({ 
      axis: "y",
      cursor: 'move', 
      handle: '.drag-handle',
      stop: function(event, ui) {
        var sort = $gifts.sortable('toArray', {attribute: 'data-id'});
        updateSort(sort);
      }
    });
  }
}