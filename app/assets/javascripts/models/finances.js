App.Models.Finances = Backbone.Model.extend({
  maxValue: 10000000, // $ 10,000,000
  minValue: 20000, // $ 20,000

  defaults: {
    cash:               0,
    college_savings:    0,
    retirement_savings: 0,
    credit_cards:       0,
    student_loans:      0,
    other_debts:        0,
    home_value:         0,
    mortgage:           0,
    synced:             false
  },

  updateParam: function(attr, value){
    value = App.utils.parseMoney(value);
    if (this.get(attr) == value) return false;

    let data = { synced: false };
    data[attr] = value;
    this.set(data);
    this.saveLocal();
    this.syncParams([attr]);
  },

  updateBalances: function(balances){
    this.set(balances);
    if (this.hasChanged()){
      this.set({synced: true})
      this.saveLocal();
      this.syncParams();
    }
  },

  saveLocal: function(){
    App.storage.setItem('finance_details', JSON.stringify(this.attributes))
  },

  restoreLocal: function(){
    let details = localStorage.getItem('finance_details');
    if (details){
      details = JSON.parse(details);
      _.each(details, (value, key) => {
        details[key] = typeof value == 'string' ? parseInt(value) : value;
      })
      this.set(details)
    }
  },

  syncParams: function(names){
    if (!App.syncOn() || this.get('synced')) return false;

    let data = this.attributes;
    if (names){
      data = _.pick(data, names)
    }else{
      delete data.synced;
    }
    $.ajax({
      url: '/finance_details', type: 'PATCH', dataType: 'json',
      data: data,
      success: (data) => {
        this.set('synced', true)
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

  isEmpty: function(options){
    let attrs = _.pick(this.attributes, 'cash', 'college_savings', 'retirement_savings', 'credit_cards', 'student_loans', 'other_debts', 'home_value', 'mortgage', 'synced');
    return _.filter(attrs, (value) => { return value && value > 0}).length == 0;
  },

  getLiquidNetWorth: function(){
    let attrs = this.attributes;
    return attrs.cash + attrs.college_savings + attrs.retirement_savings -
          attrs.credit_cards - attrs.student_loans - attrs.other_debts;
  }

})