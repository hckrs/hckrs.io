
var TEST_BUTTON = false;          // activate test button
var TEMPLATE_RENDER_LOGS = true;  // show rendered templates in console


// test something (when clicked on the "test something" button)
test = function() {
  Meteor.call("test", function(err, res) {
    if (err) throw new Meteor.Error(500, err.reason); 
    else console.log(res);
  });
}



/* TEST button */

// insert test button when page is loaded that can trigger the test function
Meteor.startup(function() {
  if (TEST_BUTTON) {
    $button = $('<button class="btn">TEST something</button>');
    $button.css({position: 'absolute', bottom: 0, left: 0, zIndex: 999});
    $button.click(test);
    $("body").prepend($button)
  }
});


/* Template render feedback */

if (TEMPLATE_RENDER_LOGS) {
  Meteor.startup(function() {
    _.each(Template, function(val, key) {
      var original = Template[key].rendered || (function() {});
      if (key[0] != '_') {
        Template[key].rendered = function() {
          var currentDate = '[' + new Date().toUTCString() + '] ';
          console.log(currentDate, "--> " + key);
          original();
        }
      }
    });  
  });
}
