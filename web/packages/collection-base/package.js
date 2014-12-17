Package.describe({
  name: 'collection-base',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('aldeed:collection2@2.2.0');
  api.use('mrt:collection-hooks@0.7.2');

  api.use('base');
  api.use('util-url');
  api.use('cities');

  api.addFiles('collection-base/schemas.js');
  api.addFiles('collection-base/auto-value.js');
  api.addFiles('collection-base/permissions.js');

  api.imply('aldeed:collection2');
  api.export([
    'Schemas',
    'AutoValue',
    'Permissions',
  ]);
});
