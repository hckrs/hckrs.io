Package.describe({
  summary: 'My node-dependencies.'
});

Package.on_use(function (api) {

  Npm.depends({
    "cheerio": '0.13.1',
    'request': '2.33.0',
  });

  api.add_files('export.js', 'server');
  
  api.export([
    'cheerio', 
    'request'
  ], 'server');
});

