
Session.set('selectedHighlightId', null)
Session.set('highlightsEditorFormMode', "insert")
Session.set('showHighlightsEditorForm', false)

Template.highlightsEditor.helpers({
	show: function() {
		var show = Session.get('showHighlightsEditorForm');
		var selected = Highlights.findOne(Session.get('selectedHighlightId')) || {};
		var mode = Session.get('highlightsEditorFormMode');
		return show && !(isForeignCity(selected.city) && mode === 'update');
	},
  selectedHighlight: function() { 
    return Highlights.findOne(Session.get('selectedHighlightId'))
  },
  hiddenHighlight: function() {
  	var city = Session.get('currentCity');
  	return !!Highlights.findOne({_id: Session.get('selectedHighlightId'), hiddenIn: city});
  }
});

Template.highlightsEditorForm.helpers({
  mode: function() {
    return Session.get('highlightsEditorFormMode');
  },
  selectedDoc: function() {
    var mode = Session.get('highlightsEditorFormMode');
    var doc = Highlights.findOne(Session.get('selectedHighlightId'));
    return mode === 'update' ? doc : null;
  }
});

Template.highlightsEditor.events({
	"click [action='add']": function() {
		var visible = !Session.equals('highlightsEditorFormMode', 'insert') || !Session.get('showHighlightsEditorForm')
		Session.set('showHighlightsEditorForm', visible)
		Session.set('highlightsEditorFormMode', 'insert')
	},
	"click [action='update']": function() {
		var visible = !Session.equals('highlightsEditorFormMode', 'update') || !Session.get('showHighlightsEditorForm')
		Session.set('showHighlightsEditorForm', visible)
		Session.set('highlightsEditorFormMode', 'update')
	},
	"click [action='visibility']": function(evt) {
		var action = $(evt.currentTarget).attr('toggle') === 'off' ? '$addToSet' : '$pull';
		var city = Session.get('currentCity');
		var selectedId = Session.get('selectedHighlightId');
		Highlights.update(selectedId, _.object([action], [{hiddenIn: city}]));
	},
});

Template.highlightsEditorForm.events({
  "click [action='cancel']": function() {
    Session.set('showHighlightsEditorForm', false);
    resetForm();
  },
  "click [action='remove']": function() {
    Highlights.remove(Session.get('selectedHighlightId'))
    Session.set('showHighlightsEditorForm', false)
  },
})

Template.highlightsEditorForm.rendered = function() {
  var $input = this.$('input:first');
  Deps.autorun(function(c) {
    Session.get('highlightsEditorFormMode');
    $input.blur();
    setTimeout(function() {
      $input.focus();
    }, 200);
  });
}

AutoForm.addHooks('highlightsEditorForm', {
	onSuccess: function(operation) {
		Session.set('showHighlightsEditorForm', false)
	}
});

var resetForm = function() {
	var selected = Session.get('selectedHighlightId');
	Session.set('selectedHighlightId', null);
	Deps.flush();
	Session.set('selectedHighlightId', selected)
}

var updateSort = function(sort) {
	Meteor.call('updateHighlightsSort', sort, function(err) {
		if (!err) Router.reload();
	});
}


// public

HighlightEditor = {}

// init jquery sortable
HighlightEditor.initSortable = function() {
	var $pagenation = $(".onepage-pagination");

	// add cursor class
	$pagenation.addClass('draggable');

	// set highlight id attributes on pagenation circles
  var ids = _.pluck(HighlightsSorted(), '_id');
  $pagenation.find("li").each(function(i) { 
    $(this).attr('data-id', ids[i]); 
  });

  // init sortable
	$pagenation.sortable({ 
    axis: "y",
    cursor: 'move', 
    stop: function(event, ui) {
    	var sort = $pagenation.sortable('toArray', {attribute: 'data-id'});
      updateSort(sort);
    }
  });
}


