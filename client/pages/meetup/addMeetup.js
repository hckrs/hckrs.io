AddMeetupController = DefaultController.extend({
    template: 'addMeetup',
    data : {
        formFields : ["date", "location", "description"]
    }
});

AutoForm.addHooks('newMeetupForm', {
    onSubmit: function(doc) {
        doc.subculture = Router.current().params.subculture;
        var id = Meetups.insert(doc);
        Router.go("/s/" + Router.current().params.subculture);
        return false;
    }
});
