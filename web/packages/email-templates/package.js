Package.describe({
  name: 'email-templates',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.addFiles('email-wrappers/html-email.html', 'server', {isAsset: true});
});