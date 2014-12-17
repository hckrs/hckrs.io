// library created by Jarno Le Conté
// dependencies: Meteor, underscore

// XXX need to INSTALL node package 'request'

YQL = function(url) {
  this.url = url;
};

YQL.prototype.request = function(query, params, cb) {
  if (typeof(params) == 'function') {
    cb = params;
    params = {};
  }

  _.extend(params, {q: query, format: 'json'});

  HTTP.get('http://query.yahooapis.com/v1/public/yql', {params: params}, function(err, res) {
    if (err || !_.isObject(res.data)) return cb({});
    cb(res.data);
  });
}

YQL.prototype.contentSearch = function(selector, cb) {
  var cb = cb.bind(this);
  var params = {selector: selector, url: this.url};
  var query = "use 'http://yqlblog.net/samples/data.html.cssselect.xml' as cssselect \
               select * from cssselect where url=@url \
               and css=@selector";

  this.request(query, params, function(data) {
    var results = Util.property(data, 'query.results.results');
    results = this.parseContent(results);
    if (selector.indexOf(',') === -1)
      results = _.values(results)[0] || [];
    cb( results  );
  }.bind(this));
}

YQL.prototype.contentAnalysis = function(cb) {
  var cb = cb.bind(this);
  var params = {url: this.url};
  var query = "select * from contentanalysis.analyze where url=@url";
  
  this.request(query, params, function(data) {
    var results = Util.property(data, 'query.results');
    var data = {};
    data.categories = Util.property(results, 'yctCategories.yctCategory') || [];
    data.entities = Util.property(results, 'entities.entity') || [];
    cb(data);
  });
}


YQL.prototype.metadata = function(selector, cb) {
  if (typeof(selector) == 'function') {
    cb = selector;
    selector = "";
  }
  var metaSelector = [
    "title",
    "meta[name='keywords']", "meta[name='KEYWORDS']", 
    "meta[name='description']", "meta[name='DESCRIPTION']", 
    "h1"
  ];
  selector = _.compact(_.union(metaSelector, selector.split(/,\s*/gi))).join(',');
  this.contentSearch(selector, function(data) {
    data.title = data.title && data.title[0].content;
    data.titleParts = data.title && data.title.split(/\s[\|\-\–\—\/]\s/) || [];
    data.header = data.h1 && data.h1[0].content;
    data.description = (_.findWhere(data.meta, {name: 'description'}) || {}).content;
    data.keywords = (_.findWhere(data.meta, {name: 'keywords'}) || {}).content;
    cb(data);
  });
}



// make sure that we always return an array
// and each item in the array is an object with a content property
// result example:
/*
  [
    { content: "some text 1" },
    { content: "some text 2", class: 'lead' },
    { content: "some text 3", id: 'title' },
  ]
*/
YQL.prototype.parseContent = function(data) {
  var data = _.clone(data);
  
  var parseItem = function(val) {
    if (_.isObject(val))
      val.content = Util.decodeHtmlEntities(val.content);
    else
      val = { content: Util.decodeHtmlEntities(val.toString()) };
    return val;
  }

  _.each(data, function(val, key) {
    data[key] = _.isArray(val) ? _.map(val, parseItem) : [ parseItem(val) ];
  });

  return data || {};
}
