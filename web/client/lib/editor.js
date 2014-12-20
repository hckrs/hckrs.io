
Editor = function(collection) {
  var editor = this;
  var formId = collection+"Editor";
  var Collection;
  
  this.collection = collection;
  this.formId = formId;
  
  Meteor.startup(function() {
    Collection = window[collection];
    this.Collection = Collection;
  });

  var state = new State(formId, {
    selectedId: null,
    mode: null,
    active: false,
  });



  // private setters

  var _setSelect = function(id) {
    if (mode() === 'add') return;
    state.set('selectedId', id);
  }
  var _setMode = function(mode) {
    if (mode === 'add') _setSelect(null);
    state.set('mode', mode);
  }
  var _setActive = function(active) {
    state.set('active', active);
  }

  var observe = function(field, cb) {
    return state.observe(field, cb);
  }

  // global setters

  var select = function(id, toggle) {
    if (toggle && selectedId() === id) 
      id = null;
    _setSelect(id);
  }
  var open = function(newmode, id) {
    _setMode(newmode);
    if (id) _setSelect(id);
    _setActive(true);
  }
  var close = function(newmode, id) {
    _setMode(newmode || null);
    if (id) _setSelect(id);     
    _setActive(false);
  }
  var toggle = function(newmode, id) {
    var alreadyOpen = newmode === mode() && active() && (!id || id === selectedId());
    alreadyOpen ? close() : open(newmode, id);
  }

  // getters

  var mode = function() {
    return state.get('mode');
  }
  var active = function() {
    return state.get('active');
  }
  var show = function() {
    return mode() === 'add' || (mode() === 'edit' && active() && selected() && Users.hasOwnerPermission(selected()));
  }
  var action = function() {
    switch (mode()) {
      case 'edit': return 'update';
      case 'add': return 'insert';
    }
  }
  var selectedId = function() {
    return state.get('selectedId');
  }
  var selected = function() {
    return Collection && Collection.findOne(selectedId()) || null;
  }

  // observer
  this.observe = observe;

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