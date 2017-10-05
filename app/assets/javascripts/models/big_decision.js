App.Models.BigDecision = Backbone.Model.extend({
  key: 'big_decision',

  defaults: {
    retire_age:      70,
    monthly_savings: 0,
    parent_contribute: 25
  },

  isEmpty: function(){
    return localStorage.getItem(this.key) == undefined;
  },

  updateParam: function(attr, value){
    if (this.get(attr) == value) return false;
    this.set(attr, value);
    if (App.differentDecisions){ App.differentDecisions.changed = true; }
    this.saveLocal();
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes));
  },

  restoreLocal: function(){
    const temp = localStorage.getItem(this.key);
    if (temp){ this.set(JSON.parse(temp)); }
  },

  decisionOpts: function(excludeAssumptions){
    let data = {
      retire_age:         this.get('retire_age'),
      monthly_savings:    this.get('monthly_savings'),
      parent_contribute:  this.get('parent_contribute')
    }
    if (App.finAssumptions.wasChanged() && !excludeAssumptions){
      data.assumptions = App.finAssumptions.toActualJSON();
    }
    if (!App.authorized){
      let i = 1;
      App.family.forEach((person) => {
        data[`age${i}`]    = person.get('age');
        data[`income${i}`] = person.get('income');
        data[`sex${i}`]    = person.get('sex');
        i++;
      })
      data.children_years = App.family.childrenYears;
      data.mortgage = App.finances.get('mortgage');
      data.home_value = App.finances.get('home_value');
      data.liquid_net_worth = App.finances.getLiquidNetWorth();
    }

    return data;
  }

})