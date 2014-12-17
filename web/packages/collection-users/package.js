Package.describe({
  name: 'collection-users',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('collection-base');
  api.use('cities');
  api.use('util-url');

  api.addFiles('users/constants.js');
  api.addFiles('users/schema.js');
  api.addFiles('users/helpers.js');
  api.addFiles('users/allow-deny.js');
  api.addFiles('users/publish.js', 'server');
  api.addFiles('users/hooks.js', 'server');
  api.addFiles('users/tmpl-helpers.js', 'client');

  api.imply('collection-base');  
  api.export([
    'Users',
    'HACKING_OPTIONS', 'HACKING_VALUES', 'HACKING',
    'AVAILABLE_OPTIONS', 'AVAILABLE_VALUES', 'AVAILABLE',
    'MAILING_OPTIONS', 'MAILING_VALUES',
    'SKILLS', 'SKILL_NAMES',
  ]);
});
