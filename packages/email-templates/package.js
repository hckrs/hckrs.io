Package.describe({
  name: 'email-templates',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  api.addFiles('HTMLEmailTemplates.js', 'server');
  api.addFiles('email-wrappers/html-email.html', 'server', {isAsset: true});
  api.export([
    'HTMLEmailTemplates'
  ]);
});
