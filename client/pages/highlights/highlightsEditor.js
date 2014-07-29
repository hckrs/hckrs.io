
Session.set('selectedHighlightId', null)
Session.set('highlightsEditorFormMode', "insert")
Session.set('showHighlightsEditorForm', false)

Template.highlightsEditor.helpers({
	show: function() {
		return Session.get('showHighlightsEditorForm') ? '' : 'hide';
	},
	mode: function() {
		return Session.get('highlightsEditorFormMode');
	},
	'selectedDoc': function() {
		var mode = Session.get('highlightsEditorFormMode');
		var doc = Highlights.findOne(Session.get('selectedHighlightId'));
		return mode === 'update' ? doc : null;
	},
  'selectedHighlight': function() { 
    return Highlights.findOne(Session.get('selectedHighlightId'))
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
	"click [action='cancel']": function() {
		Session.set('showHighlightsEditorForm', false);
		resetForm();
	},
	"click [action='remove']": function() {
		Highlights.remove(Session.get('selectedHighlightId'))
		Session.set('showHighlightsEditorForm', false)
		Router.reload();
	}
})

AutoForm.addHooks('highlightsEditorForm', {
	onSuccess: function() {
		Session.set('showHighlightsEditorForm', false)
		Router.reload();
	}
});

var resetForm = function() {
	var selected = Session.get('selectedHighlightId');
	Session.set('selectedHighlightId', null);
	Deps.flush();
	Session.set('selectedHighlightId', selected)
}

var saveOrder = function(order) {
	Highlights.find({}, {sort: {order: 1}}).forEach(function(highlight, i) {
		var newIndex = _.indexOf(order, i+1) + 1;
		Highlights.update(highlight._id, {$set: {order: newIndex}});
	});
	Router.reload();
}


// public

HighlightEditor = {}

// init jquery sortable
HighlightEditor.initSortable = function() {
	$(".onepage-pagination").addClass('draggable').sortable({ 
    axis: "y",
    cursor: 'move', 
    stop: function(event, ui) {
      var indices = $(".onepage-pagination a").map(function() { return $(this).data('index'); });
      saveOrder(_.toArray(indices));
    }
  });
}


