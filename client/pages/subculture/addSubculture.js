AddSubcultureController = DefaultController.extend({
    template: 'addSubculture',
    data : {
        formFields : ["name", "topics", "description"]
    }
});

AutoForm.addHooks('newSubcultureForm', {
    onSubmit: function(doc) {
        Subcultures.insert(doc);
        Router.go("/s/" + doc.name);
        return false;
    }
});
