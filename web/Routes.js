// ROUTES

// Define your routes here!
// The routes will be shared between client and server.
// 1. Add the name and path of your route to the routes array below.
// 2. Lower in this file you have to define a new a RouteController instance.
//
// More route functionality:
// Some specific client router functionality is in /client/router.js
// Some specific server router functionality is in /server/Router.js


var routes = [

  // staff routes
  [ 'admin'                 , '/admin'                  ],
  [ 'admin_dashboard'       , '/admin/dashboard'        ],
  [ 'admin_highlights'      , '/admin/highlights'       ],
  [ 'admin_hackers'         , '/admin/hackers'          ],
  [ 'admin_deals'           , '/admin/deals'            ],
  [ 'admin_places'          , '/admin/places'           ],
  [ 'admin_growth'          , '/admin/growth'           ],
  [ 'admin_emailTemplates'  , '/admin/emailTemplates'   ],

  // normal routes
  [ 'frontpage'    , '/'                     ],
  [ 'agenda'       , '/agenda'               ],
  [ 'books'        , '/books'                ],
  [ 'hackers'      , '/hackers'              ],
  [ 'highlights'   , '/highlights'           ],
  [ 'invitations'  , '/invitations'          ],
  [ 'map'          , '/map'                  ],
  [ 'deals'        , '/deals'                ],

  // special routes (which will redirect)
  [ 'logout'       , '/logout'               ],
  [ 'verifyEmail'  , '/verify-email/:token'  ],
  [ 'growth_github', '/gh/:phrase/:inviteBitHash?'], // e.g. /gh/FDMwdYYXxMY7dLcD4/---_--
  [ 'invite'       , '/+/:inviteBitHash/'    ], // e.g. /+/---_--

  // bare routes (must defined as last in this list)
  [ 'hacker'       , '/:bitHash'             ], // e.g. /--_-_-


];


// the routes that DON'T require login
var noLoginRequired = [
  'docs',
  'frontpage',
  'invite',
  'growth_github',
  'verifyEmail',
];


///////////////////////////////////////////////////////////////////////////////
// Base Controllers (make instances of these controllers)
///////////////////////////////////////////////////////////////////////////////

var loginCallbackCalled = false;

DefaultController = RouteController.extend({
  layoutTemplate: "main",
  loadingTemplate: "loading",
  fastRender: true,
  onBeforeAction: function() {

    /* Default Spin design */
    Spin.default = { color: '#fff' }

    // call login callback after user logged in
    if (Meteor.loggingIn()) {
      loginCallbackCalled = false;
    } else if (!loginCallbackCalled && this.ready() && Meteor.userId() && !Meteor.loggingIn()) {
      loginCallbackCalled = true;
      Login.loggedIn()
    }

    this.next();
  },
  onAfterAction: function() {

    // change the style of the navigation header to default, every route
    Interface.setHeaderStyle('default');
  }
});

DefaultAdminController = DefaultController.extend({
  layoutTemplate: "admin_layout",
  loadingTemplate: "loading",
  fastRender: true,
  onBeforeAction: function() {

    /* Default Spin design */
    Spin.default = { color: '#ccc' }

    // check permissions to view admin panel
    if (!Users.hasAmbassadorPermission())
      return this.redirect('frontpage');

    this.next();
  }
});


///////////////////////////////////////////////////////////////////////////////
// Normal Controller Instances
///////////////////////////////////////////////////////////////////////////////

FrontpageController = DefaultController.extend({
  template: 'frontpage',
  waitOn: function() {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('staff'),
      Meteor.subscribe('ambassadors')
    ];
  },
  onBeforeAction: function() { // async
    if (Meteor.isClient)
      this.subscribe('inviteBroadcastUser', Session.get('inviteBitHash'))
    this.next();
  },
});

AgendaController = DefaultController.extend({
  template: 'agenda',
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

BooksController = DefaultController.extend({
  template: 'books',
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

DealsController = DefaultController.extend({
  template: 'deals',
  waitOn: function () {
    var city = Url.city();
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ].concat(!city ? [] : [
      Meteor.subscribe('deals', city),
      Meteor.subscribe('dealsSort', city)
    ]);
  }
});

HackerController = DefaultController.extend({
  template: 'hacker',
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ];
  },
  onBeforeAction: function() {
    if (this.ready() && !this.initialized) {
      var userId = (Users.userForBitHash(this.params.bitHash) || {})._id;
      Session.set('hackerId', userId);
      Session.set('hackerEditMode', Users.myProp('isAccessDenied'));
      this.initialized = true;
    }
    this.next();
  }
});

HackersController = DefaultController.extend({
  template: 'hackers',
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('invitations'),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});


HighlightsController = DefaultController.extend({
  template: 'highlights',
  waitOn: function() {
    var city = Url.city();
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ].concat(!city ? [] : [
      Meteor.subscribe('highlights', city),
      Meteor.subscribe('highlightsSort', city)
    ]);
  },
  onBeforeAction: function() {
    var city = Session.get('currentCity');
    var selector = Users.hasAmbassadorPermission() ? {} : {hiddenIn: {$ne: city}};

    // redirect to hackers page if there are no highlights
    // except for ambassadors and admins
    if (this.ready() && Highlights.find(selector).count() === 0 && !Users.hasAmbassadorPermission())
      this.redirect('hackers');
    else
      this.next();
  },
  onAfterAction: function() {
    Interface.setHeaderStyle('fixed');
  }
});

InvitationsController = DefaultController.extend({
  template: 'invitations',
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('invitations'),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

MapController = DefaultController.extend({
  template: 'map',
  waitOn: function () {
    var city = Url.city();
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ].concat(!city ? [] : [
      Meteor.subscribe('places', city),
      Meteor.subscribe('mapHackersLocations', {excludeCity: city}) // load anonym location data of all users world wide (XXX TODO: async)
    ]);
  },
  onAfterAction: function() {
    Interface.setHeaderStyle('fixed');
  }
});



///////////////////////////////////////////////////////////////////////////////
// Special Controller Instances
///////////////////////////////////////////////////////////////////////////////

VerifyEmailController = DefaultController.extend({
  template: 'frontpage',
  onBeforeAction: function() {
    Accounts.verifyEmail(this.params.token, checkAccess);
    this.redirect('hackers');
  }
});

InviteController = DefaultController.extend({
  template: 'frontpage',
  onBeforeAction: function() {
    // set some session variables and then redirects to the frontpage
    // the frontpage is now showing a picture of the user that has invited this visitor;
    Session.set('inviteBitHash', this.params.inviteBitHash);
    this.redirect('frontpage');
  }
});

GrowthGithubController = DefaultController.extend({
  template: 'frontpage',
  onBeforeAction: function() {
    Session.set('growthType', 'github');
    Session.set('growthPhrase', this.params.phrase);
    if (this.params.inviteBitHash)
      this.redirect('invite', {inviteBitHash: this.params.inviteBitHash});
    else
      this.redirect('frontpage');
  }
});

LogoutController = DefaultController.extend({
  template: 'loading',
  onBeforeAction: function() {
    if (Meteor.userId()) {
      GAnalytics.event("LoginService", "logout");
      Meteor.logout();
      this.render('loading');
    } else {
      this.redirect('frontpage');
    }
  }
});


///////////////////////////////////////////////////////////////////////////////
// Admin Controller Instances
///////////////////////////////////////////////////////////////////////////////

AdminController = DefaultAdminController.extend({
  waitOn: function() {
    return [];
  },
  onBeforeAction: function() {
    this.redirect('admin_hackers');
  }
});

AdminDashboardController = DefaultAdminController.extend({
  template: 'admin_dashboard',
  waitOn: function() {
    return [];
  },
});

AdminDealsController = DefaultAdminController.extend({
  template: 'admin_deals',
  fastRender: false,
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('deals', isAdmin ? 'all' : city),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

AdminEmailTemplatesController = DefaultAdminController.extend({
  template: 'admin_emailTemplates',
  fastRender: false,
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('emailTemplates'),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

AdminGrowthController = DefaultAdminController.extend({
  template: 'admin_growth',
  fastRender: false,
  onRun: function() {
    AdminGrowth.setCity(Session.get('currentCity'))
  },
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      // load all github users from the selected city
      Meteor.subscribe('growthGithub', AdminGrowth.getCity()),
      Meteor.subscribe('emailTemplates'),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

AdminHackersController = DefaultAdminController.extend({
  template: 'admin_hackers',
  fastRender: false,
  waitOn: function () {
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});

AdminHighlightsController = DefaultAdminController.extend({
  template: 'admin_highlights',
  fastRender: false,
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('highlights', isAdmin ? 'all' : city),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});


AdminPlacesController = DefaultAdminController.extend({
  template: 'admin_places',
  fastRender: false,
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [
      Meteor.subscribe('currentUser', Meteor.userId()),
      Meteor.subscribe('places', isAdmin ? 'all' : city),
      Meteor.subscribe('users') // XXX be more precise
    ];
  }
});


///////////////////////////////////////////////////////////////////////////////
// Hooks
///////////////////////////////////////////////////////////////////////////////

var loginRequired = function() {
  if (!Meteor.userId()) {
    if (!Session.get('redirectUrl'))
      Session.set('redirectUrl', location.pathname + location.search + location.hash);
    return this.redirect('frontpage');
  }
  this.next();
}

// make sure that user is allowed to enter the site
var allowedAccess = function() {
  var user = Users.myProps(['isAccessDenied','globalId','bitHash']) || {};
  if(user.isAccessDenied) {
    if (user._id !== Url.userIdFromUrl(window.location.href)) {
      this.redirect('hacker', user);
    }
  }
  this.next();
}

if (Meteor.isClient) {
  // make sure the user is logged in, except for the pages below
  Router.onRun(loginRequired, {except: noLoginRequired});
  Router.onBeforeAction(loginRequired, {except: noLoginRequired});

  // make sure that user is allowed to enter the site
  Router.onBeforeAction(allowedAccess, {except: noLoginRequired });
}



///////////////////////////////////////////////////////////////////////////////
// Setup routes
///////////////////////////////////////////////////////////////////////////////

_.each(routes, function(route) {
  Router.route(route[1], {name: route[0]});
});
