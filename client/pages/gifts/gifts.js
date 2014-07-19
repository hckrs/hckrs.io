Session.set('giftIdInEditMode', null)
Session.set('showGiftAdd', false)


// Route Controller

GiftsController = DefaultController.extend({
  template: 'gifts',
  waitOn: function () {
    var city = Session.get('currentCity');
    return [ Meteor.subscribe('gifts', city) ];
  }
});



Template.gifts.helpers({
  'isEmpty': function() {
    return Gifts.find().count() === 0;
  },
  'gifts': function() {
    return Gifts.find().fetch();
  },
  'editMode': function() {
    return Session.equals('giftIdInEditMode', this._id);
  }
});

Template.gift.helpers({
  'codeType': function() {
    return /^http/.test(this.code) ? 'url' : 'code';
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
  }
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