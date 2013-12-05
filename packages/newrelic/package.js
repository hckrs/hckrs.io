Package.describe({
  summary: 'Package wrapper for newrelic monitoring service.'
});

Package.on_use(function (api) {

  Npm.depends({
    "newrelic": '1.1.1'
  });
  api.use('underscore', 'server');
  api.add_files('startup.js', 'server');
});

