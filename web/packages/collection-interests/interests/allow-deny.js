
/* Permissions */

// Debug settings; Later this should be changed to only allow updating 
// and removing of a user's own interests, and maybe let their city's
// admins change them.

InterestCollection.allow({
	'insert': function(userId, doc) {
		return true
		},
	'remove': function(userId, doc) {
		return true
		},
	'update': function(userId, doc) {
		return true
	}
});