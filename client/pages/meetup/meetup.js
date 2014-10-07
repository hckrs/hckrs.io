MeetupController = DefaultController.extend({
    template: 'meetup',
    waitOn: function() {
        return [Meteor.subscribe("meetup", this.params._id)];
    },
    data: function() {

        var meetup = Meetups.findOne(this.params._id);
        if (!meetup) return;
        return {
            subculture: meetup.subculture,
            topics: meetup.topics,
            description: meetup.description,
            date: meetup.date,
            presence:
                [{ status  : "going"
                 , users : _.times(9, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"}})
                 },
                 { status  : "maybe"
                 , users : _.times(3, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"}})
                 },
                 { status  : "invited"
                 , users : _.times(3, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"}})
                 }
                ],
            location: meetup.location
        }
    }
});
