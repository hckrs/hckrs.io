
// ALLOW and DENY rules specifies which database queries are allowed
// and which not. This will be validated on the server

// shorthands (used below)
TRUE = function() { return true; }
FALSE = function() { return false; }
ALL = { insert: TRUE, update: TRUE, remove: TRUE };
NONE = { insert: FALSE, update: FALSE, remove: FALSE };



/* USERS */






/* INVITATIONS */

Invitations.deny(ALL);









