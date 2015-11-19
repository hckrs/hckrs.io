Package.describe({
  name: 'base',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.imply('meteor-platform');

  api.imply('stylus');
  api.imply('http');
  api.imply('reactive-var');
  api.imply('email');

  api.imply('ext-underscore');
  api.imply('ext-random');
  api.imply('ext-match');
  api.imply('ext-email');
  api.imply('ext-jquery');

  api.imply('util-base');
  api.imply('settings');
});
