
// ALLOW and DENY rules specifies which database queries are allowed
// and which not. This will be validated on the server

Permissions = {}

var True = function() { return true; }
var False = function() { return false; }
var Admin = function(userId) { return Users.hasAdminPermission(userId); }


// shorthands

Permissions.TRUE = True;
Permissions.FALSE = False;

Permissions.ALL = { 
  insert: True, 
  update: True, 
  remove: True 
};
Permissions.NONE = { 
  insert: False, 
  update: False, 
  remove: False 
};
Permissions.ADMIN = { 
  insert: Admin, 
  update: Admin, 
  remove: Admin 
};

