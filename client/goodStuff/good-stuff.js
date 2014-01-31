Session.set('newGoodStuffItem', false);

// use local temporary collection to build up a good-stuff item
// at the end the item can be inserted in the real collection.
var previewItem = new Meteor.Collection(null);





// TEMPLATE DATA
// feed templates with data

Template.goodStuffGrid.helpers({ 
  'goodStuff': function() {
    return GoodStuffItems.find({}, {sort: {createdAt: -1}}).fetch();
  },
});

Template.goodStuffItem.helpers({
  'relatedUser': function(userId) {
    return Users.findOne(userId);
  },
  'active': function() {
    return this.isActive ? 'active' : '';
  }
});

Template.newGoodStuffItem.helpers({
  'hackingTypes': function() {
    return HACKING;
  },
  'itemTypes': function() {
    return ITEM_TYPES;
  },
  'previewItem': function() {
    return previewItem.findOne();
  },
  'activeTag': function(type) {
    var item = previewItem.findOne();
    var tag = this.toString();
    return hasTag(item, type, tag) ? 'active' : '';
  }
});




// EVENTS
// handle user interactions

Template.pasteDroplet.events({
  'mouseover #pasteDroplet': function() {
    focusPasteDroplet();
  },
  'blur input': function() {
    blurPasteDroplet();
  },
  'paste input': function(event) {
    var url = getClipboardData(event);
    if (!Match.test(url, Match.URL))
      return alert('Invalid URL');
    openNewItem(url); //create a new item
  }
});

Template.newGoodStuffItem.events({
  'submit form': function(event) {
    event.preventDefault();
    saveNewItem(); // save & close
  },
  'click .cancel': function() { 
    cancelNewItem(); // reset & close
  },
  'keyup input': function(event) { 
    var $elm = $(event.currentTarget); //input element
    var field = $elm.attr('name');
    var value = $elm.val();
    updatePreviewItem(field, value, true);
  },
  'click .arrow-left': function() {
    slideImage(1);
  },
  'click .arrow-right': function() {
    slideImage(-1);
  },
  'click .tag': function(event) {
    var $elm = $(event.currentTarget); // clicked element
    var type = $elm.data('type');
    var tag = $elm.data('tag');
    toggleTag(type, tag);
  }
});










// RENDERING
// managing jquery stuff

Template.pasteDroplet.rendered = function() {
  focusPasteDroplet();
}

Template.goodStuffGrid.rendered = function() {

  // settings
  var _gutter = 6;
  var _itemWidth = 320;
  
  // initialize grid
  window.msnry = new Masonry("#goodStuffMasonry", {
    'gutter': _gutter,
    'itemSelector': '.item'
  });

  // resize handler
  var resizeGrid = function() {
    var width = $('#goodStuffGrid').width();
    var columnCount = Math.floor(width / (_itemWidth+_gutter));
    var columnWidth = width / columnCount - _gutter;
    $('#goodStuffMasonry .item').width(columnWidth);
    msnry.layout();
  }
  
  // add resize listener (remove previous one)
  $(window).off('resize', this.resizeHandler);
  this.resizeHandler = resizeGrid;
  $(window).on('resize', this.resizeHandler);

  // correct layout after interval
  // to ensure relayout on when images are loaded
  if (this.intervalHandler) Meteor.clearInterval(this.intervalHandler);
  this.intervalHandler = Meteor.setInterval(this.resizeHandler, 1000);
  
  // initial layout the grid
  resizeGrid();
}

Template.goodStuffGrid.destroyed = function() {
  // remove resize handler
  $(window).off('resize', this.resizeHandler);

  // remove interval handler
  if (this.intervalHandler) Meteor.clearInterval(this.intervalHandler);
}




// helper function

var hasTag = function(item, type, tag) {
  return item.tags && _.contains(item.tags[type], tag);
}





// ACTIONS


var focusPasteDroplet = function() {
  $("#pasteDroplet .on-active").show();
  $("#pasteDroplet .on-inactive").hide();
  $("#pasteDroplet input").focus();
}

var blurPasteDroplet = function() {
  $("#pasteDroplet .on-active").hide();
  $("#pasteDroplet .on-inactive").show();
  if (!Session.get('newGoodStuffItem'))
    setTimeout(focusPasteDroplet, 10); // directly focusing again
}

var openNewItem = function(url) {
  previewItem.clear();
  previewItem.insert({website: url});
  Session.set('newGoodStuffItem', true);
  autoFillIn(url);
}

var closeNewItem = function() {
  Session.set('newGoodStuffItem', false);  
  focusPasteDroplet();
  previewItem.clear();
}

var cancelNewItem = function() {
  closeNewItem();  
}

var updatePreviewItem = function(key, val, showInPreview) {
  var itemId = previewItem.findOne()._id;  
  previewItem.update(itemId, {$set: _.object([key], [val])});
  if (showInPreview)
    activatePreview();
}

var toggleTag = function(type, tag) {
  var item = previewItem.findOne();
  var action = hasTag(item, type, tag) ? '$pull' : '$addToSet';
  previewItem.update(item._id, _.object([ action ], [ _.object(['tags.'+type], [tag]) ]));
}

var saveNewItem = function() {
  var preview = previewItem.findOne();
  var item = _.pick(preview, [
    'title', 'subtitle', 'imageUrl',
    'description', 'website', 'tags'
  ]);

  // XXX TODO
  //   if (data.costs) data.costs = parseInt(data.costs);
  //   if (data.eventDate) data.eventDate = moment(data.eventDate, 'DD-MM-YYYY hh:mm').toDate();

  GoodStuffItems.insert(item);
  closeNewItem();
}

var activeTimer;
var activatePreview = function() {
  if (activeTimer) Meteor.clearTimeout(activeTimer);
  var item = previewItem.findOne(); 
  previewItem.update(item._id, {$set: {'isActive': true}});
  activeTimer = Meteor.setInterval(function() {
    previewItem.update(item._id, {$unset: {'isActive': 0}});
  }, 4000);
}

var slideImage = function(x) {
  var item = previewItem.findOne();
  if (!_.isArray(item.images)) return;
  var length = item.images.length;
  var index = _.indexOf(item.images, item.imageUrl) + x;
  if (index === -1) index = length - 1;
  if (index === length) index = 0;
  var imageUrl = item.images[index] || "";
  updatePreviewItem('imageUrl', imageUrl);
}




// AUTOFILL 
// fill the form with webpage data

var autoFillIn = function(url) {
  async.parallel([
    function(cb) { getMetadata(url, _.compose(cb, fillInMetadata)); },
    function(cb) { getImages(url, _.compose(cb, fillInImages)); },
    function(cb) { getTags(url, _.compose(cb, fillInTags)); }
  ]);
}

var fillInMetadata = function(meta) {
  log('meta', meta);
  updatePreviewItem('title', meta.title);
  updatePreviewItem('description', meta.description);
  if (meta.titleParts.length > 1) {
    updatePreviewItem('title', _.first(meta.titleParts));
    updatePreviewItem('subtitle', _.last(meta.titleParts));
  }
}

var fillInImages = function(images) {
  log('images', images);
  updatePreviewItem('images', images || []);
  updatePreviewItem('imageUrl', images[0] || "");
}

var fillInTags = function(data) {
  log('tags', data);
  updatePreviewItem('tags.hacking', data.hacking || []);
  updatePreviewItem('tags.types', data.types || []);
  updatePreviewItem('tags.keywords', data.keywords || []);
  updatePreviewItem('keywords', data.keywords || []);
}




// GET WEBPAGE DATA
// retrieve webpage and extract data

var getMetadata = function(url, callback) {
  var yql = new YQL(url);
  yql.metadata(callback);
}

var getImages = function(url, callback) {
  var yql = new YQL(url);
  yql.contentSearch('img', function(images) {

    images = _.pluck(images, 'src');

    // load an image into the DOM, so we can retrieve the image size
    var loadImage = function(url, cb) {
      $("<img />").on('load', function() { cb(null, this); }).attr('src', url);  
    }

    // filter the largest 5 pictures
    var imagesLoaded = function(images) {
      var minSize = function(img) { return Math.min(img.width, img.height); };
      var maxSize = function(img) { return Math.max(img.width, img.height); };
      var reject = function(img) { return minSize(img) < 180; };
      var images = _.chain(images).reject(reject).sortBy(maxSize).last(5).pluck('src').value();
      callback(images);
    }

    // get the 5 largest pictures, then create the image chooser
    async.map(images, loadImage, succeed(imagesLoaded));

  });
}

var getTags = function(url, callback) {
  var yql = new YQL(url);
  yql.contentAnalysis(function(data) {
    var categories = data.categories;
    var entities = data.entities;
    var keywords = _.uniq(_.map(entities, function(e) { return e.text.content; }));

    callback({
      hacking: [], //XXX find hacking types e.g. web, software, hardware
      types: [], //XXX type of post e.g. product, article, video, feed 
      keywords: keywords
    });
  });
}

















// DEMO items
// adding demo items on startup

Meteor.startup(function() {
  Deps.autorun(function(c) {
    if (Session.get('userSubscriptionsReady')) {
      addDemoItems();
      c.stop();
    }
  });
});


var addDemoItems = function() {

  var items = [
    {
      "imageUrl": "/img/highlights/app-dernier-metro.jpg",
      "title": "Dernier métro",
      "subtitle": "web app pour Lyon",
      "website": "http://yannlombard.github.io/derniermetro/",
    },
    {
      "imageUrl": "/img/highlights/startupweekend-geneve.jpg",
      "title": "Startupweekend Lyon",
      "subtitle": "Digital Open Labs",
      "eventLocation": "INSA Lyon",
      "eventDate": newDate("2014-02-21 19:00"), //date YYYY-MM-DD mm:ss
      "costs": 50.00,
      "website": "http://lyon.startupweekend.org",
    },
    // {
    //   "imageUrl": "/img/highlights/arduino.jpg",
    //   "title": "Ardruino serial shield",
    //   "costs": 25.00,
    //   "website": "????????????"
    // },
    {
      "imageUrl": "/img/good-stuff/slim-fold.jpg",
      "title": "Slim fold",
      "subtitle": "crowd funded paper wallet",
      "website": "http://www.slimfoldwallet.com",
      "costs": 20.00,
    },
    {
      "imageUrl": "/img/highlights/4K-screen.jpg",
      "title": "Seiki 4K TV",
      "website": "http://tiamat.tsotech.com/4k-is-for-programmers",
      "costs": 600,
    },
    {
      "imageUrl": "/img/good-stuff/amazon-drone.jpg",
      "title": "20' delivery by Amazon",
      "subtitle": "welcome to the future",
      "website": "http://www.youtube.com/watch?v=98BIu9dpwHU",
    },
    {
      "imageUrl": "/img/good-stuff/dell-4K.jpg",
      "title": "Dell 4K",
      "subtitle": "28\" screen",
      "website": "http://accessories.us.dell.com/sna/productdetail.aspx?c=us&l=en&cs=19&sku=210-ACBL",
      "costs": 600.00,
    },
    {
      "imageUrl": "/img/good-stuff/rasbery-pi.jpg",
      "title": "Rasbery Pi",
      "subtitle": "rev.B",
      "website": "http://www.raspberrypi.org",
      "costs": 25.00,
    },
    {
      "imageUrl": "/img/good-stuff/seth-godin.jpg",
      "title": "Seth godin",
      "subtitle": "20' interview",
      "website": "http://www.youtube.com/watch?v=JecJzrIfdHg",
    },
    {
      "imageUrl": "/img/good-stuff/spark-core.jpg",
      "title": "Skark core",
      "subtitle": "push code over WiFi",
      "description": "Hier komt de description...",
      "website": "https://www.spark.io",
      "costs": 40.00,
      "eventLocation": "",
    },
    {
      "imageUrl": "/img/good-stuff/tim-ferris.png",
      "title": "Tim Ferris",
      "subtitle": "47' interview",
      "description": "How to master any skill",
      "website": "http://www.youtube.com/watch?v=AysWsbrtzMU",
    },
  ];

  _.each(items, function(item) {
    if (_.first(item.imageUrl) == '/')
      item.imageUrl = Meteor.absoluteUrl(item.imageUrl.substring(1));
    if (!GoodStuffItems.findOne(item)) {
      GoodStuffItems.insert(item);
    }
  });
}
