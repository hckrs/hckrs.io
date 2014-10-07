Schemas.Meetup = new SimpleSchema([
    Schemas.default,
    Schemas.userId,
    Schemas.city,
    {
        "subculture": {
            type: String,
            label: "Subculture",
            min:3,
            max:20,
        },
        "date" : {
            type: Date,
            label: "Date"
        },
        "location": {
            type: "String",
            label: "Location"
        },
        "description": {
            type: String,
            label: "Description",
            optional: true,
        },
        "topics": {
            type: [String],
            label: "Topics",
            optional: true
        },
        "invites": {
            type: [Schemas.userId],
            label: "Invited"
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
    Meteor.publish("meetup", function(id) {
        var user = Users.findOne(this.userId);
        return Meetups.find({$and: [{_id: id}, {city: user.city},{ 'invites.userId': {$in: [this.userId]}} ]});
    });
}
