// ROUTES 

var routes = [
  
  // staff routes
  [ 'admin'                 , '/admin'                  ],
  [ 'admin_dashboard'       , '/admin/dashboard'        ],
  [ 'admin_highlights'      , '/admin/highlights'       ],
  [ 'admin_hackers'         , '/admin/hackers'          ],
  [ 'admin_deals'           , '/admin/deals'            ],
  [ 'admin_places'          , '/admin/places'           ],
  [ 'admin_growth'          , '/admin/growth'           ],
  [ 'admin_growthTemplates' , '/admin/growth/templates' ],

  // normal routes
  [ 'about'        , '/about'                ],
  [ 'agenda'       , '/agenda'               ],
  [ 'books'        , '/books'                ],
  [ 'frontpage'    , '/'                     ],
  [ 'hackers'      , '/hackers'              ],
  [ 'highlights'   , '/highlights'           ],
  [ 'invitations'  , '/invitations'          ],
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




// set meta data
Router.onRun(setMetaData);

// make sure the user is logged in, except for the pages below
Router.onRun(loginRequired, {except: noLoginRequired});
Router.onBeforeAction(loginRequired, {except: noLoginRequired});

// make sure that user is allowed to enter the site
Router.onBeforeAction(allowedAccess, {except: noLoginRequired });

// log pageview to Google Analytics
Router.onRun(GAnalytics.pageview);



// save and restore scroll state for every page

var scrollState = new State('routerScrollState', {
  routes: {}
});

Router.restoreScrollState = function() {
  var params = Router.current().params;
  var route = Router.current().path;
  var top = scrollState.get(route);

  if (top === 0 && params.hash)
    $(window).scrollTo($("#"+params.hash), {duration: 0, offset: 0});  
  else
    $(window).scrollTop(top || 0);  
}

var scrollHandler = function(event) {
  var route = Router.current().path;
  var top = $(window).scrollTop();
  scrollState.set(route, top);
}

Meteor.startup(function() {
  var routes = _.map(Router.routes, _.property('name'));

  _.each(Template, function(template, templateName) {
    if (_.contains(routes, templateName)) { // is route template
      var prevRenderFunc = template.rendered;
      template.rendered = function() {
        if (prevRenderFunc) prevRenderFunc.call(this);  
        Router.restoreScrollState(); // restore scroll state
      }
    }
  });

  $(window).on("scrollstop", scrollHandler);
});





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
  $(window).scrollTop(0); 
}

// reload current route (hack)
Router.reload = function() {
  var path = Router.current().path;
  Router.go('/about');
  Tracker.flush();
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
    url = Router.routes['invite'].url({invitationPhrase: phrase});
  
  url = Url.replaceCity(city, url);

  Router.refresh(url);
}



Router.routes['hacker'].path = function(user) {
  var redirect = (_.isObject(user) && user.redirect) || false;
  
  user = OtherUserProps(user, ['globalId']);

  if (!user || !user.globalId)
    return;

  if (userIsForeign(user) && redirect)
    return Router.routes['hacker'].url(user); // make full url

  if (userIsForeign(user))
    return '#'; // no url

  return "/" + Url.bitHash(user.globalId);
}
Router.routes['hacker'].url = function(user) {
  return userProfileUrl(user);
}

Router.routes['invite'].url = function(user) {
  return userInviteUrl(user);
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


