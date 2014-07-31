Session.set('giftIdInEditMode', null)
Session.set('showGiftAdd', false)

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



Template.gifts.helpers({
  'isEmpty': function() {
    return Gifts.find(selector()).count() === 0;
  },
  'gifts': function() {
    return GiftsSorted();
  },
  'editMode': function() {
    return Session.equals('giftIdInEditMode', this._id);
  }
});

Template.gift.helpers({
  'codeType': function() {
    return /^http/.test(this.code) ? 'url' : 'code';
  },
  hiddenGift: function() {
    var city = Session.get('currentCity');
    return !!Gifts.findOne({_id: this._id, hiddenIn: city});
  }
})

Template.giftAdd.helpers({
  'show': function() {
    return Session.equals('showGiftAdd', true) ? '' : 'hide';
  },
  'hidden': function() {
    return !Session.equals('showGiftAdd', true);
  }
})


/* events */

Template.gift.events({
  "click [action='edit']": function(evt) {
    var giftId = $(evt.currentTarget).data('gift')
    Session.set('giftIdInEditMode', giftId);

  },
  "click [action='remove']": function(evt) {
    var giftId = $(evt.currentTarget).data('gift')
    Gifts.remove(giftId);
  },
  "click [action='visibility']": function(evt) {
    var action = $(evt.currentTarget).attr('toggle') === 'off' ? '$addToSet' : '$pull';
    var selectedId = $(evt.currentTarget).data('id');
    var city = Session.get('currentCity');
    Gifts.update(selectedId, _.object([action], [{hiddenIn: city}]));
  },
});

Template.giftEdit.events({
  "click [action='cancel']": function() {
    Session.set('giftIdInEditMode', null);    
  }
});

Template.giftAdd.events({
  "click [action='add']": function() {
    Session.set('showGiftAdd', true)
  }
})

AutoForm.addHooks('giftEditForm', {
  after: {
    update: function() {
      Session.set('giftIdInEditMode', null);    
    },
    insert: function() {
      Session.set('showGiftAdd', false);
    }
  }
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