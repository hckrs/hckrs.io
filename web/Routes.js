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
  [ 'about'        , '/about'                ],
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
  [ 'growth_github', '/gh/:phrase'           ], // e.g. /gh/FDMwdYYXxMY7dLcD4
  [ 'invite'       , '/+/:inviteBitHash/'    ], // e.g. /+/---_--

  // bare routes (must defined as last in this list)
  [ 'hacker'       , '/:bitHash'             ], // e.g. /--_-_-


];


// the routes that DON'T require login
var noLoginRequired = [
  'docs',
  'about',
  'frontpage',
  'invite',
  'verifyEmail',
];


///////////////////////////////////////////////////////////////////////////////
// Base Controllers (make instances of these controllers)
///////////////////////////////////////////////////////////////////////////////


DefaultController = RouteController.extend({
  layoutTemplate: "main",
  loadingTemplate: "loading",
  fastRender: true,
  onBeforeAction: function() {

    /* Default Spin design */
    Spin.default = { color: '#fff' }

    // wait on global subscriptions ready
    if (!Subscriptions.ready() || Meteor.loggingIn()) {
      this.render('loading');
      return;
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
      this.redirect('frontpage');

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
      Meteor.subscribe('staff'),
      Meteor.subscribe('ambassadors'),
    ]
  }
});

AgendaController = DefaultController.extend({
  template: 'agenda',
  waitOn: function () {
    return [];
  }
});

BooksController = DefaultController.extend({
  template: 'books',
  waitOn: function () {
    return [];
  }
});

DealsController = DefaultController.extend({
  template: 'deals',
  waitOn: function () {
    var city = Url.city();
    return !city ? [] : [
      Meteor.subscribe('deals', city),
      Meteor.subscribe('dealsSort', city)
    ];
  }
});

HackerController = DefaultController.extend({
  template: 'hacker',
  waitOn: function () {
    return [];
  },
  onBeforeAction: function() {
    if (Subscriptions.ready() && !this.initialized) {
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
      Meteor.subscribe('invitations'),
    ];
  }
});


HighlightsController = DefaultController.extend({
  template: 'highlights',
  waitOn: function() {
    var city = Url.city();
    return !city ? [] : [
      Meteor.subscribe('highlights', city),
      Meteor.subscribe('highlightsSort', city),
    ];
  },
  onBeforeAction: function() {
    var city = Session.get('currentCity');
    var selector = Users.hasAmbassadorPermission() ? {} : {hiddenIn: {$ne: city}};

    // redirect to hackers page if there are no highlights
    // except for ambassadors and admins
    if (this.ready() && Highlights.find(selector).count() === 0 && !Users.hasAmbassadorPermission())
      this.redirect('hackers');

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
      Meteor.subscribe('invitations')
    ];
  }
});

MapController = DefaultController.extend({
  template: 'map',
  waitOn: function () {
    var city = Url.city();
    return !city ? [] : [
      Meteor.subscribe('places', city),
      // load anonym location data of all users world wide (XXX TODO: async)
      Meteor.subscribe('mapHackersLocations', {excludeCity: city})
    ];
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
  onRun: function() {
    var token = this.params.token;

    // log to google analytics
    Meteor.call('getEmailVerificationTokenUser', token, function(err, user) {
      if (!err && user)
        GAnalytics.event('EmailVerification', 'verified user', user._id);
      else GAnalytics.event('EmailVerification', 'invalid token', token);
    });

    this.next();
  },
  waitOn: function () {
    return [];
  },
  action: function() {
    Accounts.verifyEmail(this.params.token, checkAccess);
    this.redirect('hackers');
    this.next();
  }
});

InviteController = DefaultController.extend({
  template: 'frontpage',
  onBeforeAction: function() {
    // set some session variables and then redirects to the frontpage
    // the frontpage is now showing a picture of the user that has invited this visitor;
    Session.set('inviteBitHash', this.params.inviteBitHash);
    this.redirect('frontpage');
    this.next();
  }
});

GrowthGithubController = DefaultController.extend({
  template: 'frontpage',
  onBeforeAction: function() {
    Session.set('growthType', 'github');
    Session.set('growthPhrase', this.params.phrase);
    this.redirect('frontpage');
    this.next();
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
  onBeforeAction: function() {
    Router.go('admin_hackers');
    this.next();
  }
});

AdminDashboardController = DefaultAdminController.extend({
  template: 'admin_dashboard',
  waitOn: function () {
    return [ ];
  }
});

AdminDealsController = DefaultAdminController.extend({
  template: 'admin_deals',
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [
      Meteor.subscribe('deals', isAdmin ? 'all' : city),
    ];
  }
});

AdminEmailTemplatesController = DefaultAdminController.extend({
  template: 'admin_emailTemplates',
  waitOn: function () {
    return [
      Meteor.subscribe('emailTemplates'),
    ];
  }
});

AdminGrowthController = DefaultAdminController.extend({
  template: 'admin_growth',
  onRun: function() {
    state.set('city', Session.get('currentCity'));
  },
  waitOn: function () {
    return [
      // load all github users from the selected city
      Meteor.subscribe('growthGithub', state.get('city')),
      Meteor.subscribe('emailTemplates'),
    ];
  }
});

AdminHackersController = DefaultAdminController.extend({
  template: 'admin_hackers',
  waitOn: function () {
    return [ ];
  }
});

AdminHighlightsController = DefaultAdminController.extend({
  template: 'admin_highlights',
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [
      Meteor.subscribe('highlights', isAdmin ? 'all' : city),
    ];
  }
});


AdminPlacesController = DefaultAdminController.extend({
  template: 'admin_places',
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [
      Meteor.subscribe('places', isAdmin ? 'all' : city),
    ];
  }
});





_.each(routes, function(route) {
  Router.route(route[1], {name: route[0]});
});
