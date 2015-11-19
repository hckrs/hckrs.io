// ROUTES


/* hooks */

// set meta data based on current city
var setMetaData = function() {
  var city = City.lookup(Session.get('currentCity'));
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

  this.next();
}


// GAnalytics
var pageView = function(route) {
  GAnalytics.pageview(route);
  this.next();
}




// set meta data
Router.onRun(setMetaData);

// log pageview to Google Analytics
Router.onRun(pageView);





// save and restore scroll state for every page
var scrollState;

var scrollHandler = function(event) {
  var route = Router.current().url;
  var top = $(window).scrollTop();
  scrollState.set(route, top);
}

Meteor.startup(function() {
  scrollState = new State('routerScrollState', {
    routes: {}
  });
  $(window).on("scrollstop", scrollHandler);
});

// Restore scroll state after route is loaded
Router.restoreScrollState = function() {
  var params = Router.current().getParams();
  var route = Router.current().url;

  Tracker.nonreactive(function() {
    Tracker.afterFlush(function() {
      if (params.hash) {
        $(document).scrollTo("#"+params.hash, {duration: 800, offset: 0});
      } else {
        var top = scrollState.get(route);
        $(document).scrollTop(top || 0);
      }
    });
  });
}

// Restore scroll state after route is loaded
Router.onAfterAction(Router.restoreScrollState);





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

  var bitHash = Session.get('inviteBitHash');
  if (bitHash)
    url = Router.routes['invite'].url({inviteBitHash: bitHash});

  url = Url.replaceCity(city, url);

  Router.refresh(url);
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
