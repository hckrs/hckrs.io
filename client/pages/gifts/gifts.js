Session.set('giftEditorActive', false);
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
  return active() && (mode() !== 'edit' || !isForeignCity(selected().city));
}
var active = function() {
  return Session.get('giftEditorActive');
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
  if (mode() === 'add') return;
  Session.set('selectedGiftId', id);
  _setActive();
}
var _setMode = function(mode) {
  if (mode === 'add') _setSelect(null);
  Session.set('giftEditorMode', mode);
  _setActive();
}
var _setActive = function(active) {
  if (_.isUndefined(active))
    active = mode() === 'add' || (mode() === 'edit' && selected());
  Session.set('giftEditorActive', active);
}

var select = function(id, toggle) {
  if (toggle && Session.equals('selectedGiftId', id)) 
    id = null;
  _setSelect(id);
}
var open = function(mode, id) {
  _setMode(mode);
  if (id) _setSelect(id);
}
var close = function(mode, id) {
  _setMode(mode || null);
  if (id) _setSelect(id);
  _setActive(false);     
}
var toggle = function(mode2, id) {
  mode2 === mode() && active() && (!id || id === selectedId()) ? close() : open(mode2, id);
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
  'mode': mode,
});

Template.giftEditor.helpers({
  'active': active,
  'show': show,
  'mode': mode,
  'action': action,
  'selected': selected,
  'visibility': function() {
    var city = Session.get('currentCity');
    var isHidden = !!Gifts.findOne({_id: selectedId(), hiddenIn: city});
    return {
      text: isHidden ? 'Hidden' : '',
      icon: isHidden ? 'icon-eye-close' : 'icon-eye-open',
      clss: isHidden ? 'flat' : '',
      attr: {
        action: 'visibility',
        toggle: isHidden ? 'on' : 'off',  
        title: isHidden ? 'Click to make VISIBLE for your users.' : 'Click to HIDE for your users.',
      }
    }
  }
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
  },
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
    show(); /* reactive depend */
    $input.blur();
    setTimeout(function() {
      $input.focus();
    }, 200);
  });
}


AutoForm.addHooks('giftEditor', {
  onSuccess: function(operation, result) {
    close('edit', operation === 'insert' && result);
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