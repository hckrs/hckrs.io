// ROUTES 

var routes = [
  
  // normal routes
  [ 'about'        , '/about'                ],
  [ 'agenda'       , '/agenda'               ],
  [ 'books'        , '/books'                ],
  [ 'frontpage'    , '/'                     ],
  [ 'hackers'      , '/hackers'              ],
  [ 'highlights'   , '/highlights'           ],
  [ 'invitations'  , '/invitations'          ],
  [ 'mergeAccount' , '/mergeAccount'         ],
  [ 'places'       , '/places'               ],
  [ 'sponsors'     , '/sponsors'             ],
  [ 'verifyEmail'  , '/verify-email/:token'  ],
  
  // special routes
  [ 'hacker'       , '/:localRankHash'       ],
  [ 'invite'       , /^\/\+\/(.*)/           ],

];

// the routes that DON'T require login
var noLoginRequired = [
  'about',
  'frontpage', 
  'invite', 
  'verifyEmail',
];




/* hooks */

var loginRequired = function() {
  if (!Meteor.userId()) {
    Session.set('redirectUrl', location.pathname + location.search + location.hash);
    this.redirect('frontpage');  
  }
}

// make sure that user is allowed to enter the site
var allowedAccess = function() {
  if(Meteor.user() && Meteor.user().isAccessDenied) {
    this.redirect('hacker', Meteor.user()); 
  }
}

// check if there are duplicate accounts, if so request for merge
var checkDuplicateAccounts = function() {
  if (Session.get('requestMergeDuplicateAccount')) {
    this.redirect('mergeAccount');
  }
}

// scroll to hash element (when present in url)
var scrollToTop = function() {
  Session.equals('pageScrollDirection', null);
  var hash = this.params.hash;
  if (!hash) return $("#mainWrapper").scrollTop(0);
  var scrollTo = function() {
    if (!$("#"+hash).length) return;
    Meteor.clearInterval(timer);
    $("#mainWrapper").scrollTo($("#"+hash), {duration: 0, offset: 0});  
  }
  scrollTo();
  var timer = Meteor.setInterval(scrollTo, 200);
}

// scroll to top when user enters a route
Router.onRun(scrollToTop);

// make sure the user is logged in, except for the pages below
Router.onRun(loginRequired, {except: noLoginRequired});
Router.onBeforeAction(loginRequired, {except: noLoginRequired});

// make sure that user is allowed to enter the site
Router.onBeforeAction(allowedAccess, {except: ['hacker','mergeAccount'].concat(noLoginRequired) });

// check for duplicate accounts, if so request for merge
Router.onBeforeAction(checkDuplicateAccounts, {except: ['mergeAccount'].concat(noLoginRequired) });

// log pageview to Google Analytics
Router.onRun(GAnalytics.pageview);







/* global router configuration */

Router.configure({
  autoRender: true,
  layoutTemplate: "main"
});

IronRouterProgress.configure({
  enabled: false,
  spinner: false
});



// internals

Router.map(function () {
  _.each(routes, function(route) {
    this.route(route[0], {path: route[1]});
  }, this);
});


/* resolve url helpers */

Router.reload = function() {
  var path = location.pathname + location.search + location.hash;
  Router.go("/");
  Router.go(path); 
}

Router.routes['invite'].url = function(params) {
  return Meteor.absoluteUrl('+/' + params.phrase);
}