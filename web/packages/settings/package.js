Package.describe({
  name: 'settings',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('meteor-platform');
  api.use('underscore');

  api.addFiles('settings/settings.jsdoc');
  api.addFiles('settings/settings-server.js', 'server');
  
  api.export('Settings');
});