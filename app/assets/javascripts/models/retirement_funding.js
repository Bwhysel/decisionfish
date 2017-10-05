App.Models.RetirementFunding = Backbone.Model.extend({
  key: 'retirement_funding',

  getMonthExp: function(){
    return this.get('base_expenses') / 12.0;
  },

  isEmpty: function(){
    return localStorage.getItem(this.key) == undefined;
  },

  isSafe: function(){
    return this.get('success');
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes))
  },

  restoreLocal: function(){
    const temp = localStorage.getItem(this.key);
    if (temp){ this.set(JSON.parse(temp)); }
  }

})