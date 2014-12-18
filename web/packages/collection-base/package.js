Package.describe({
  name: 'collection-base',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('aldeed:collection2@2.2.0');
  api.use('mrt:collection-hooks@0.7.2');

  api.use('base');
  api.use('util-url');
  api.use('cities');

  api.addFiles('collection-base/collection.jsdoc');
  api.addFiles('collection-base/schemas.jsdoc');
  api.addFiles('collection-base/auto-value.jsdoc');
  api.addFiles('collection-base/permissions.jsdoc');

  api.imply('aldeed:collection2');
  api.export([
    'Collection',
    'Schemas',
    'AutoValue',
    'Permissions',
  ]);
});
