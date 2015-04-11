Package.describe({
  name: 'collection-highlights',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');

  api.use('base');
  api.use('collection-users');

  api.addFiles('highlights/collection.jsdoc');
  api.addFiles('highlights/schema.js');
  api.addFiles('highlights/allow-deny.js');
  api.addFiles('highlights/publish.js', 'server');
  api.addFiles('highlights/methods.js', 'server');

  api.export([
    'Highlights',
    'HighlightsSort',
  ]);
});
