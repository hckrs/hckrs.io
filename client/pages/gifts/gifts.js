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



// helper functions

var mode = function() {
  if (Session.get('showGiftAdd')) return 'insert';
  if (Session.get('giftIdInEditMode')) return 'update';
  return false;
}

var close = function() {
  Session.set('giftIdInEditMode', null);     
  Session.set('showGiftAdd', false);
}



Template.gifts.helpers({
  'isEmpty': function() {
    return Gifts.find(selector()).count() === 0;
  },
  'gifts': function() {
    return GiftsSorted();
  },
});

Template.gift.helpers({
  'codeType': function() {
    return /^http/.test(this.code) ? 'url' : 'code';
  },
  'hiddenGift': function() {
    var city = Session.get('currentCity');
    return !!Gifts.findOne({_id: this._id, hiddenIn: city});
  }
});

Template.giftEditor.helpers({
  'mode': function() {
    return mode();
  }
});

Template.giftEditorForm.helpers({
  'mode': function() {
    return mode();
  },
  'selectedDoc': function() {
    return Gifts.findOne(Session.get('giftIdInEditMode')) || null;
  }
});


/* events */

Template.gift.events({
  "click [action='edit']": function(evt) {
    var giftId = $(evt.currentTarget).data('gift')
    close();
    Session.set('giftIdInEditMode', giftId);
  },
  "click [action='visibility']": function(evt) {
    var action = $(evt.currentTarget).attr('toggle') === 'off' ? '$addToSet' : '$pull';
    var selectedId = $(evt.currentTarget).data('id');
    var city = Session.get('currentCity');
    Gifts.update(selectedId, _.object([action], [{hiddenIn: city}]));
  }
});

Template.giftEditor.events({
  "click [action='add']": function() {
    close();
    Session.set('showGiftAdd', true);
  }
});

Template.giftEditorForm.events({
  "click [action='cancel']": function() {
    close();
  },
  "click [action='remove']": function(evt) {
    var giftId = $(evt.currentTarget).data('gift')
    Gifts.remove(giftId);
    close();
  },
});

Template.giftEditorForm.rendered = function() {
  var $input = this.$('input:first');
  Deps.autorun(function(c) {
    mode(); /* reactive depend */
    $input.blur();
    setTimeout(function() {
      $input.focus();
    }, 200);
  });
}


AutoForm.addHooks('giftEditorForm', {
  onSuccess: function(operation) {
    close();
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