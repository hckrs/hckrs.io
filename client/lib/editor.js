
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