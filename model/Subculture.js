Schemas.Subculture = new SimpleSchema([
    Schemas.default,
    Schemas.userId,
    Schemas.currentCity,
    {
        "name": {
            type: String,
            label: "Name",
            index: true,
            unique: true,
            min:3
        },
        "topics": {
            type: [String],
            label: "Topics"
        },
        "description": {
            type: String,
            label: "Description",
            optional: true,
        }
    }
]);

Subcultures = new Meteor.Collection('subcultures');
Subcultures.attachSchema(Schemas.Subculture)

Subcultures.allow({
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
    Meteor.publish("subculture", function(name) {
        return Subcultures.find({name:name});
    });
}
