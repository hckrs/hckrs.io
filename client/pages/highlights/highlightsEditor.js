
Session.set('selectedHighlight', null)
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
		var doc = Session.get('selectedHighlight');
		return mode === 'update' ? doc : null;
	},
  'selectedHighlight': function() { 
    return Session.get('selectedHighlight')
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
	"click [action='remove']": function() {
		var doc = Session.get('selectedHighlight');
		Highlights.remove(doc._id)
		Session.set('showHighlightsEditorForm', false)
		Router.reload();
	}
})

AutoForm.addHooks('highlightsEditorForm', {
	onSuccess: function() {
		Session.set('showHighlightsEditorForm', false)
	},
	after: {
		insert: function() {
			Router.reload();
		}
	}
});