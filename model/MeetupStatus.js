Schemas.MeetupStatus = new SimpleSchema([
    Schemas.default,
    Schemas.userId,
    {
        "meetup" : {
            type: String
        },
        "status": {
            type: String,
            allowedValues: ["going", "maybe", "not going"]
        }
    }
]);

MeetupStatus = new Meteor.Collection('meetupstatus');
MeetupStatus.attachSchema(Schemas.MeetupStatus);

MeetupStatus.allow({
    insert: function (userId, doc) {
        console.log(doc);
        return doc.userId === userId;
    },
    update: function (userId, doc, fieldNames, modifier) {
        return doc.userId === userId;
    },
    remove: function (userId, doc) {
        return doc.userId === userId;
    }
});

if (Meteor.isServer) {
    Meteor.publish("meetupJoin", function(meetup) {
        return MeetupStatus.find({userId: this.userId, meetup:meetup});
    });
}
