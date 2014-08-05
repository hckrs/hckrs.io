// ROUTES 

var routes = [
  
  // ambassador routes
  [ 'admin'              , '/admin'             ],
  [ 'admin_dashboard'    , '/admin/dashboard'   ],
  [ 'admin_highlights'   , '/admin/highlights'  ],
  [ 'admin_hackers'      , '/admin/hackers'     ],
  [ 'admin_deals'        , '/admin/deals'       ],
  [ 'admin_places'       , '/admin/places'      ],

  // normal routes
  [ 'about'        , '/about'                ],
  [ 'agenda'       , '/agenda'               ],
  [ 'books'        , '/books'                ],
  [ 'frontpage'    , '/'                     ],
  [ 'hackers'      , '/hackers'              ],
  [ 'highlights'   , '/highlights'           ],
  [ 'invitations'  , '/invitations'          ],
  [ 'mergeAccount' , '/mergeAccount'         ],
  [ 'map'          , '/map'                  ],
  [ 'deals'        , '/deals'                ],
  [ 'verifyEmail'  , '/verify-email/:token'  ],
  
  // special routes
  [ 'hacker'       , '/:bitHash'             ],
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
  if(UserProp('isAccessDenied')) {
    if (Meteor.userId() !== Url.userIdFromUrl(window.location.href)) {
      this.redirect('hacker', Meteor.userId()); 
    }
  }
}

// check if there are duplicate accounts, if so request for merge
var checkDuplicateAccounts = function() {
  var request = Session.get('requestMergeDuplicateAccount');
  var currentRoute = Router.current().route.name;
  
  if (request && currentRoute !== 'mergeAccount')
    this.redirect('mergeAccount');
  
  if (!request && currentRoute === 'mergeAccount')
    this.redirect('hacker', Meteor.userId());
}

// scroll to hash element (when present in url)
var scrollToTop = function() {
  Session.equals('pageScrollDirection', null);
  var params = Router.current().params;
  
  // scroll to top if there is no hash element
  if (!params.hash) 
    return $(window).scrollTop(0);

  // wait for hash element to become on screen
  var timer;
  var scrollTo = function() {
    if (!$("#"+params.hash).length) return;
    clearInterval(timer);
    $(window).scrollTo($("#"+params.hash), {duration: 0, offset: 0});  
  } 
  timer = setInterval(scrollTo, 200);
}


// set meta data
Router.onRun(setMetaData);

// scroll to top when user enters a route
Router.onRun(scrollToTop);

// make sure the user is logged in, except for the pages below
Router.onRun(loginRequired, {except: noLoginRequired});
Router.onBeforeAction(loginRequired, {except: noLoginRequired});

// check for duplicate accounts, if so request for merge
Router.onBeforeAction(checkDuplicateAccounts, {except: noLoginRequired });

// make sure that user is allowed to enter the site
Router.onBeforeAction(allowedAccess, {except: ['mergeAccount'].concat(noLoginRequired) });

// log pageview to Google Analytics
Router.onRun(GAnalytics.pageview);







/* global router configuration */

Router.configure({
  autoRender: true
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



/* router plugins */

Router.scrollToTop = function() {
  scrollToTop();
}

// reload current route (hack)
Router.reload = function() {
  var path = Router.current().path;
  Router.go('/about');
  Deps.flush();
  Router.go(path);
}

// browser refresh location
Router.refresh = function(path) {
  if (!path)
    path = Router.current().path;
  window.location.href = path;
}

// browser refresh location to new city
Router.goToCity = function(city) {
  var url;
  
  var phrase = Session.get('invitationPhrase');
  if (phrase)
    url = Router.routes['invite'].url({phrase: Url.bitHash(phrase)});
  
  url = Url.replaceCity(city, url);

  Router.refresh(url);
}



Router.routes['hacker'].path = function(user, disableForeign) {
  var redirect = _.isObject(user) ? user.redirect || false : false; // default false
  disableForeign = _.isBoolean(disableForeign) ? disableForeign : true; // default true
  
  user = OtherUserProps(user, ['globalId']);

  if (!user || !user.globalId)
    return;

  if (!userIsForeign(user) || disableForeign !== true) // make path url
    return "/" + Url.bitHash(user.globalId);

  if (userIsForeign(user) && redirect)
    return Router.routes['hacker'].url(user); // make full url

  return '#' // no url
}
Router.routes['hacker'].url = function(user) {
  var path = Router.routes['hacker'].path(user, false);
  var city = OtherUserProp(user, 'city');
  var url = Url.replaceCity(city, Meteor.absoluteUrl(Url.stripTrailingSlash(path)));
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


