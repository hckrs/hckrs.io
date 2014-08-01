

Editor = function(namespace) {
  var editor = this;
  
  var Collection, 
      formId = namespace+'Editor';

  
  this.setCollection = function(collection) {
    Collection = collection;
  }



  // private setters

  var _setSelect = function(id) {
    if (mode() === 'add') return;
    Session.set(namespace+'_selectedId', id);
    _setActive();
  }
  var _setMode = function(mode) {
    if (mode === 'add') _setSelect(null);
    Session.set(namespace+'_editorMode', mode);
    _setActive();
  }
  var _setActive = function(active) {
    if (_.isUndefined(active))
      active = mode() === 'add' || (mode() === 'edit' && selected());
    Session.set(namespace+'_editorActive', active);
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
    return Session.get(namespace+'_editorMode');
  }
  var show = function() {
    return active() && (mode() !== 'edit' || !isForeignCity(selected().city));
  }
  var active = function() {
    return Session.get(namespace+'_editorActive');
  }
  var action = function() {
    switch (mode()) {
      case 'edit': return 'update';
      case 'add': return 'insert';
    }
  }
  var selectedId = function() {
    return Session.get(namespace+'_selectedId');
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


  Template.editorForm.helpers({
    'id': function() { return formId; },
    'collection': function() { return Collection; },
    'active': function() { return editor.active(); },
    'show': function() { return editor.show(); }, 
    'mode': function() { return editor.mode(); }, 
    'action': function() { return editor.action(); }, 
    'selected': function() { return editor.selected(); }, 
    'visibility': function() {
      var city = Session.get('currentCity');
      var isHidden = !!Collection.findOne({_id: editor.selectedId(), hiddenIn: city});
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



  Template.editorForm.events({
    "click [action='add']": function() {
      editor.toggle('add');
    },
    "click [action='edit']": function() {
      editor.toggle('edit');
    },
    "click [action='visibility']": function(evt) {
      var action = $(evt.currentTarget).attr('toggle') === 'off' ? '$addToSet' : '$pull';
      var city = Session.get('currentCity');
      Collection.update(selectedId(), _.object([action], [{hiddenIn: city}]));
    },
     "click [action='cancel']": function() {
      editor.close();
    },
    "click [action='remove']": function(evt) {
      Collection.remove(selectedId());
      editor.close();
    },
  }); 

  Template.editorForm.rendered = function() {
    var self = this;
    Deps.autorun(function(c) {
      editor.show(); /* reactive depend */
      self.$("input:first").blur();
      setTimeout(function() {
        self.$("input:first").focus();
      }, 200);
    });
  }

  AutoForm.addHooks(formId, {
    onSuccess: function(operation, result) {
      editor.close('edit', operation === 'insert' && result);
    }
  });

}






