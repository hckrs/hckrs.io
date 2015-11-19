
Schemas.Deal = new SimpleSchema([
  Schemas.default,
  Schemas.city,
  Schemas.userId,
  Schemas.private(true),
  Schemas.hiddenIn,
  {
    "title": {
      type: String,
      label: 'Deal description'
    },
    "description": {
      type: String,
      optional: true,
      label: 'Extra information'
    },
    "url": {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Url,
      autoValue: AutoValue.prefixUrlWithHTTP,
      autoform: { type: 'url' },
      label: 'Company URL'
    },
    "code": {
      type: String,
      optional: true,
      label: 'Deal code / URL'
    },
  }
]);

Schemas.DealsSort = new SimpleSchema([
  Schemas.city,
  {
    "sort": {
      type: [SimpleSchema.RegEx.Id]
    }
  }
]);

Deals.attachSchema(Schemas.Deal);
DealsSort.attachSchema(Schemas.DealsSort);
