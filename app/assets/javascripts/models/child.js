App.Models.Child = Backbone.Model.extend({

  validation: {
    year: [
      {
        min: 1900,
        msg: 'Too old'
      },
      {
        max: 2100,
        msg: 'Too far in future'
      }
    ]
  }
})