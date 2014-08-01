

Editor = function(collection) {
  var editor = this;

  this.collection = collection;
  
  var formId = collection+"Editor";
  this.formId = formId;
  
  var Collection;
  Meteor.startup(function() {
    Collection = window[collection];
    this.Collection = Collection;
  });



  // private setters

  var _setSelect = function(id) {
    if (mode() === 'add') return;
    Session.set(formId+'_selectedId', id);
    _setActive();
  }
  var _setMode = function(mode) {
    if (mode === 'add') _setSelect(null);
    Session.set(formId+'_editorMode', mode);
    _setActive();
  }
  var _setActive = function(active) {
    if (_.isUndefined(active))
      active = mode() === 'add' || (mode() === 'edit' && selected());
    Session.set(formId+'_editorActive', active);
  }

  // global setters

  var select = function(id, toggle) {
    if (toggle && selectedId() === id) 
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

  // getters

  var mode = function() {
    return Session.get(formId+'_editorMode');
  }
  var show = function() {
    return active() && (mode() !== 'edit' || !isForeignCity(selected().city));
  }
  var active = function() {
    return Session.get(formId+'_editorActive');
  }
  var action = function() {
    switch (mode()) {
      case 'edit': return 'update';
      case 'add': return 'insert';
    }
  }
  var selectedId = function() {
    return Session.get(formId+'_selectedId');
  }
  var selected = function() {
    return Collection && Collection.findOne(selectedId()) || null;
  }


  // global setters
  this.select = select;
  this.open = open; 
  this.close = close;
  this.toggle = toggle;
  
  // getters
  this.mode = mode;    
  this.show = show;
  this.active = active;    
  this.action = action;
  this.selectedId = selectedId;  
  this.selected = selected;   



  AutoForm.addHooks(formId, {
    onSuccess: function(operation, result) {
      editor.close('edit', operation === 'insert' && result);
    }
  });

}


Template.editorForm.helpers({
  'id': function() { return this.formId; },
  'collection': function() { return this.collection; },
  'active': function() { return this.active(); },
  'show': function() { return this.show(); }, 
  'mode': function() { return this.mode(); }, 
  'action': function() { return this.action(); }, 
  'selected': function() { return this.selected(); }, 
});

Template.visibilityButton.visibility = function() {
  var city = Session.get('currentCity');
  var isHidden = !!window[this.collection].findOne({_id: this.selectedId(), hiddenIn: city});
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


Template.editorForm.events({
  "click [action='add']": function() {
    this.toggle('add');
  },
  "click [action='edit']": function() {
    this.toggle('edit');
  },
  "click [action='visibility']": function(evt) {
    var action = $(evt.currentTarget).attr('toggle') === 'off' ? '$addToSet' : '$pull';
    var city = Session.get('currentCity');
    window[this.collection].update(this.selectedId(), _.object([action], [{hiddenIn: city}]));
  },
   "click [action='cancel']": function() {
    this.close();
  },
  "click [action='remove']": function(evt) {
    window[this.collection].remove(this.selectedId());
    this.close();
  },
}); 

Template.editorForm.rendered = function() {
  var self = this;
  var editor = self.data;
  Deps.autorun(function(c) {
    editor.show(); /* reactive depend */
    self.$("input:first").blur();
    setTimeout(function() {
      self.$("input:first").focus();
    }, 200);
  });
}



