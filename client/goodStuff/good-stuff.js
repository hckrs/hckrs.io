


// EVENTS
// handle user interactions

Template.goodStuff.events({
  /* empty */
});

Template.newGoodStuffItem.events({
  'submit form': function(e) {
    e.preventDefault();
    var data = $(e.currentTarget).serializeObject();
    if (data.costs)
      data.costs = parseInt(data.costs);
    if (data.eventDate)
      data.eventDate = moment(data.eventDate, 'DD-MM-YYYY hh:mm').toDate();
    GoodStuffItems.insert(data);
  },
  'keydown, keypress, keyup, paste, blur, focus #gs_website': function(e) {
    Meteor.setTimeout(function() {
      var url = $(e.target).val();
      if (Session.equals('newGoodStuffItemUrl', url))
        return; // url not changed
      if (Match.test(url, Match.URL)) {
        Session.set('newGoodStuffItemUrl', url);
        analyzeWebpage(url); // fetch webpage content
      }
    }, 100);
  }
});





// TEMPLATE DATA
// feed templates with data

Template.goodStuff.helpers({ 
  'goodStuff': function() {
    return GoodStuffItems.find({}, {sort: {createdAt: -1}}).fetch();
  },
  'user': function(userId) {
    return Users.findOne(userId);
  }
});

Template.newGoodStuffItem.helpers({
  /* empty */
});




// RENDERING
// managing jquery stuff

Template.goodStuff.rendered = function() {
  var msnry = new Masonry("#goodStuffGrid");
}

Template.newGoodStuffItem.rendered = function() {
  /* empty */
}




// HELPERS

analyzeWebpage = function(url) {
  log('analyze webpage: ' + url);
  Meteor.call('requestWebpageMetadata', url, function(err, meta) {
    if (err) return log(err);
    
    // decode html entities
    meta.title = decodeHtmlEntities( meta.title );
    meta.subtitle = decodeHtmlEntities( meta.subtitle );
    meta.description = decodeHtmlEntities( meta.description );

    // fill data into form
    $("#newGoodStuffItem .details").removeClass('hide');
    $("#newGoodStuffItem #gs_title").val( meta.title );
    $("#newGoodStuffItem #gs_subtitle").val( meta.subtitle );
    $("#newGoodStuffItem #gs_description").val( meta.description );


    /* handle images */

    // load an image into the DOM, so we can retrieve the image size
    var loadImage = function(url, cb) {
      $("<img />").on('load', function() { cb(null, this); }).attr('src', url);  
    }

    // filter the largest 20 pictures
    var imagesLoaded = function(images) {
      var minSize = function(img) { return Math.min(img.width, img.height); };
      var maxSize = function(img) { return Math.max(img.width, img.height); };
      images = _.reject(images, function(img) { return minSize(img) < 180; });
      images = _.sortBy(images, maxSize).reverse();
      images = _.first(images, 20);
      createImageChooser(images);
    }

    // create image chooser
    var createImageChooser = function(images) {
      $("#newGoodStuffItem .images").append(images);
    }

    // get the 20 largest pictures, then create the image chooser
    async.map(meta.images, loadImage, succeed(imagesLoaded));

  });
}










// DEMO
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
    if (!GoodStuffItems.findOne(item)) {
      GoodStuffItems.insert(item);
    }
  });
}
