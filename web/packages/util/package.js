Package.describe({
  name: 'util',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('collection-users', {unordered: true});
  api.use('util-base');
  api.use('util-url');
  api.imply('util-geo');
  
  api.addFiles('util/util.jsdoc');

  api.imply('util-base');
  api.imply('util-url');
  api.imply('util-geo');

  api.export('Util');
});