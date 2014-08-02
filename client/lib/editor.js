
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

  var state = new State("formId", {
    selectedId: null,
    mode: null,
    active: false
  });



  // private setters

  var _setSelect = function(id) {
    if (mode() === 'add') return;
    state.set('selectedId', id);
    _setActive();
  }
  var _setMode = function(mode) {
    if (mode === 'add') _setSelect(null);
    state.set('mode', mode);
    _setActive();
  }
  var _setActive = function(active) {
    if (_.isUndefined(active))
      active = mode() === 'add' || (mode() === 'edit' && selected());
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
    return state.get('mode');
  }
  var show = function() {
    return active() && (mode() !== 'edit' || !isForeignCity(selected() && selected().city));
  }
  var active = function() {
    return state.get('active');
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