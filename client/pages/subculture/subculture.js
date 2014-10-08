SubcultureController = DefaultController.extend({
    template: 'subculture',
    waitOn: function() {
        return [Meteor.subscribe("subculture", this.params.subculture)];
    },

    data: function() {
        Meteor.subscribe("meetup", this.params.subculture);
        return {
            subculture: Subcultures.findOne({name: this.params.subculture}),
            meetups: Meetups.find({$and: [{subculture: this.params.subculture}, {date: {$gt: new Date}}] })
        };
    }
});
