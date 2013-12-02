


/* 
  Client Side Model

  this is the place where we register database collections
  each collection has a corresponding collection on the server
  we define the scheme or structure in the server part /server/Model.js
*/



// Meteor.users is a collection with all user data
// this collection is already predefined by meteor

Meteor.users = Meteor.users; // already defined


// Invitations is a collection with valid invitation codes
// the user can give such code to someone to let him signup 

Invitations = new Meteor.Collection('invitations');









/*
  CLIENT ONLY collections

  This are collections that only exist on the client and will not
  be synced with the server. This collections are used to store session state.
  Instead yoy can using the Session object provided by meteor, but the local collections
  allow you to query/modify the data in an easy way.
*/


// Dynamic classes are used to define additional classes to HTML elements.
// Adding a class to an element can be done by calling the addDynamicClass() helper function.
// In general this approach is easier than setting classes directly through jquery, because
// this method preserve the classNames on the elements when the template render again.

DynamicClasses = new Meteor.Collection(null); //local collection

var dynamicClass = { /* scheme */
  _id: String,          // automatic generated by meteor
  elementId: String,    // the id of a html element
  className: String     // the class name that are attached to this html element
}

