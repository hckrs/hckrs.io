
Highlights = new Meteor.Collection('highlights');
HighlightsSort = new Meteor.Collection('highlightsSort');

Schemas.Highlight = new SimpleSchema([
  Schemas.default,
  Schemas.userId,
  Schemas.private(true),
  Schemas.hiddenIn,
  Schemas.city,
  {
    "imageUrl": {
      type: String,
      label: 'Image URL',
      regEx: SimpleSchema.RegEx.Url,
      autoValue: AutoValue.prefixUrlWithHTTP,
      autoform: { type: 'url' },
    },
    "title": {
      type: String,
      label: 'Name'
    },
    "subtitle": {
      type: String,
      optional: true,
      label: 'Information'
    },
    "url": {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Url,
      autoValue: AutoValue.prefixUrlWithHTTP,
      autoform: { type: 'url' },
      label: 'Website URL'
    },
  }
]);

Schemas.HighlightsSort = new SimpleSchema([
  Schemas.city,
  {
    "sort": {
      type: [SimpleSchema.RegEx.Id]
    }
  }
])

Highlights.attachSchema(Schemas.Highlight);
HighlightsSort.attachSchema(Schemas.HighlightsSort);
