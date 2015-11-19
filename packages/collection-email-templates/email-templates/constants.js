/* Template Groups */

// These Array of usage options describes for groups of
// email templates which variables may be used.
EMAIL_TEMPLATE_GROUPS_OPTIONS = [

  // "growthGithub" is located within the admin panel
  // and allows us to mail a group of github users.
  // The variables corresponds to the user data from Github.
  {
    value: "growthGithub",
    label: "Growth Github",
    vars: [ /* automatic extracted from example */ ],
    example: {
      'SIGNUP_URL': 'http://utrecht.hckrs.io/gh/FDMwdYYXxMY7dLcD4',
      'CITY_KEY': 'utrecht',
      'CITY_NAME': 'Utrecht',
      'USERNAME': 'Jarnoleconte',
      'EMAIL': 'jarno.leconte@me.com',
      'AVATAR_URL': 'https://avatars.githubusercontent.com/u/279767?v=2',
      'FOLLOWERS': 4,
      'FOLLOWING': 2,
      'REPOS': 3,
      'GISTS': 0,
      'NAME': 'Jarno Le Conté',
      'FIRSTNAME': 'Jarno',
      'WEBSITE': 'http://jarno.me',
      'COMPANY': 'Flyingweb',
      'ADMIN_NAME': 'Toon van Ramshorst',
      'ADMIN_FIRSTNAME': 'Toon',
      'ADMIN_EMAIL': 'toon@hckrs.io',
      'ADMIN_TITLE': 'co-founder hckrs.io',
      'ADMIN_IMAGE_URL': 'https://graph.facebook.com/toon.vanramshorst/picture?type=large',
    }
  },

];

// extract and attach variable names for quick access
_.each(EMAIL_TEMPLATE_GROUPS_OPTIONS, function(group) {
  group.vars = _.keys(group.example);
});

// List containing names of all different template groups
EMAIL_TEMPLATE_GROUPS_VALUES = _.pluck(EMAIL_TEMPLATE_GROUPS_OPTIONS, 'value');
