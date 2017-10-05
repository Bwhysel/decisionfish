App.Models.Idea = Backbone.Model.extend({
  key: 'idea',

  defaults: {
    need: null,
    saves_money: 0,
    content: ''
  },

  needChoosed: function(){
    return this.get('need') !== null;
  },

})