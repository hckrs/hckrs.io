Package.describe({
  name: 'ext-jquery',
  summary: ' /* Fill me in! */ ',
  version: '1.1.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('jquery');

  api.addFiles('plugins/autogrow.js', 'client');
  api.addFiles('plugins/browserDetect.js', 'client');
  api.addFiles('plugins/chosen.js', 'client');
  api.addFiles('plugins/chosen.css', 'client');
  api.addFiles('plugins/onepage-scroll.js', 'client');
  api.addFiles('plugins/onepage-scroll.css', 'client');
  api.addFiles('plugins/onscreen.js', 'client');
  api.addFiles('plugins/scrollstop.js', 'client');
  api.addFiles('plugins/scrollTo.js', 'client');
  api.addFiles('plugins/serializeObject.js', 'client');
  api.addFiles('plugins/typewriter.js', 'client');
  api.addFiles('plugins/scrollspy.js', 'client');
});
