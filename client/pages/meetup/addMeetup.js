AddMeetupController = DefaultController.extend({
    template: 'addMeetup',
    data : {
        formFields : ["subculture", "date", "location", "topics", "description", "invites"]
    }
});

AutoForm.addHooks('newMeetupForm', {
    onSubmit: function(doc) {
        var id = Meetups.insert(doc);
        Router.go("/meetup/" + id);
        return false;
    }
});
