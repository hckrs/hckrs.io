Package.describe({
  name: 'util',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('base');
  api.use('util-base');
  api.use('util-url');

  api.addFiles('util/util.js');

  api.imply('util-base');
  api.imply('util-url');
});