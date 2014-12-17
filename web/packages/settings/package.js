Package.describe({
  name: 'settings',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('meteor-platform');
  api.use('underscore');

  api.addFiles('settings/settings.js');
  api.addFiles('settings/settings-server.js', 'server');
  
  api.export('Settings');
});