Schemas.Meetup = new SimpleSchema([
    Schemas.default,
    Schemas.userId,
    {
        "subculture": {
            type: String,
            optional: true
        },
        "date": {
            type: Date,
            label: "Date"
        },
        "location": {
            type: String,
            label: "Location"
        },
        "description": {
            type: String,
            label: "Description",
            optional: true,
        }
    }
]);

Meetups = new Meteor.Collection('meetups');
Meetups.attachSchema(Schemas.Meetup)

Meetups.allow({
    insert: function (userId, doc) {
        return hasAmbassadorPermission(userId, doc.city);
    },
    update: function (userId, doc, fieldNames, modifier) {
        return hasAmbassadorPermission(userId, doc.city);
    },
    remove: function (userId, doc) {
        return hasAmbassadorPermission(userId, doc.city);
    }
});

if (Meteor.isServer) {
    Meteor.publish("meetup", function(name) {
        return Meetups.find({subculture:name});
    });
}

