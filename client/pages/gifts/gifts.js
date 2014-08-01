Session.set('giftEditorMode', null);
Session.set('selectedGiftId', null);  



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


// session helpers

var mode = function() {
  return Session.get('giftEditorMode');
}
var show = function() {
  return mode() === 'add' || (mode() === 'edit' && selected());
}
var action = function() {
  switch (mode()) {
    case 'edit': return 'update';
    case 'add': return 'insert';
  }
}
var selectedId = function() {
  return Session.get('selectedGiftId');
}
var selected = function() {
  return Gifts.findOne(selectedId()) || null;
}

var _setSelect = function(id) {
  Session.set('selectedGiftId', id);
}
var _setMode = function(mode) {
  Session.set('giftEditorMode', mode);
}
var select = function(id, toggle) {
  id = (toggle && Session.equals('selectedGiftId', id)) ? null : id; 
  if (id && mode() === 'add') _setMode('edit');
  _setSelect(id);
}
var open = function(mode, id) {
  _setMode(mode);
  if (id) _setSelect(id);
  if (mode === 'add') _setSelect(null);
}
var close = function() {
  _setMode(null);     
}
var toggle = function(mode2, id) {
  mode2 === mode() && (!id || id === selectedId()) ? close() : open(mode2, id);
}




// Template helpers

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
  'isSelected': function() {
    return this._id === selectedId() ? 'selected' : '';
  },
});

Template.giftEditor.helpers({
  'show': show,
  'hiddenGift': function() {
    var city = Session.get('currentCity');
    return !!Gifts.findOne({_id: selectedId(), hiddenIn: city});
  },
  'selected': selected,
});

Template.giftEditorForm.helpers({
  'mode': mode,
  'action': action,
  'selected': selected,
});


/* events */

Template.gift.events({
  "click .gift": function(evt) {
    var giftId = $(evt.currentTarget).data('id');
    select(giftId, true);
  },
});

Template.giftEditor.events({
  "click [action='add']": function() {
    toggle('add');
  },
  "click [action='edit']": function() {
    toggle('edit');

    // select first gift
    if (!selectedId()) {
      var firstGiftId = $("#giftsContainer .gift").onScreen().data('id');
      select(firstGiftId);
    }
  },
  "click [action='visibility']": function(evt) {
    var action = $(evt.currentTarget).attr('toggle') === 'off' ? '$addToSet' : '$pull';
    var city = Session.get('currentCity');
    Gifts.update(selectedId(), _.object([action], [{hiddenIn: city}]));
  }
});

Template.giftEditorForm.events({
  "click [action='cancel']": function() {
    close();
  },
  "click [action='remove']": function(evt) {
    Gifts.remove(selectedId());
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