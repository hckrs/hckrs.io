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

// set meta data based on current city
var setMetaData = function() {
  var city = CITYMAP[Session.get('currentCity')];
  var title, description;

  // modify meta data
  title = "hckrs.io";
  if (city) description = "Hackers community of " + city.name;
  else      description = "Hackers community in your city";

  // actually set data
  setTitle(title);
  setMeta("title", title);
  setMeta("description", description);
  setMetaProperties({
    "og:title": description,
    "og:site_name": title,
    "og:url": city ? Url.replaceCity(city.key, Meteor.absoluteUrl()) : Meteor.absoluteUrl(),
    "og:image": Meteor.absoluteUrl("img/favicons/apple-touch-icon-precomposed.png"),
    "og:description": description
  });
}

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
  if (!hash) return $(window).scrollTop(0);
  var scrollTo = function() {
    if (!$("#"+hash).length) return;
    Meteor.clearInterval(timer);
    $(window).scrollTo($("#"+hash), {duration: 0, offset: 0});  
  }
  scrollTo();
  var timer = Meteor.setInterval(scrollTo, 200);
}


// set meta data
Router.onRun(setMetaData);

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

Router.goToCity = function(city) {
  var url;
  
  var phrase = Session.get('invitationPhrase');
  if (phrase)
    url = Router.routes['invite'].url({phrase: Url.bitHash(phrase)});

  window.location.href = Url.replaceCity(city, url);
}

Router.routes['hacker'].path = function(user, absolute) {
  return user.isForeign && !absolute ? "#" : "/"+user.localRankHash;
}
Router.routes['hacker'].url = function(user) {
  var path = Router.routes['hacker'].path(user, true);
  var url = Url.replaceCity(user.city, Meteor.absoluteUrl(Url.stripTrailingSlash(path)));
  return url;
}

Router.routes['invite'].url = function(params) {
  return Meteor.absoluteUrl('+/' + params.phrase);
}


// set meta data helpers

var setTitle = function(value) {
  $("title").text(value);
}
var setMeta = function(name, content) {
  $("meta[name='"+name+"']").attr('content', content);
}
var setMetaProperties = function(properties) {
  _.each(properties, function(content, property) {
    $("meta[property='"+property+"']").remove(); // remove existing one
    $("<meta>").attr({property: property, content: content}).appendTo('head');
  });
}
var clearProperties = function() {
  $("meta[property]").remove(); // remove all properties
}
var clear = function() {
  setTitle("");
  setMeta("description", "");
  clearProperties();
}


