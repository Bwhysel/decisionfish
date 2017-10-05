App.Models.Loans = Backbone.Model.extend({
  key: 'loans',

  defaults: {
    credit_cards:        [0],
    student_loans:       [0],
    other_debts:         [0, 0],
    credit_cards_names:  ['Card 1'],
    student_loans_names: ['Loan 1'],
    other_debts_names:   ['Car 1', 'Other Loan'],
    credit_cards_rates:  [0],
    student_loans_rates: [0],
    other_debts_rates:   [0, 0],
  },

  addLoan: function(kind){
    const ind = this.get(kind).length
    data = {
      index: ind,
      label: `${kind == 'credit_cards' ? 'Card' : (kind=='student_loans' ? 'Stud ' : '')+'Loan'} ${ind+1}`,
      value: 0,
      rate: 0
    }
    this.get(kind).push(data.value);
    this.get(`${kind}_names`).push(data.label);
    this.get(`${kind}_rates`).push(data.rate);
    this.saveLocal();
    this.syncParams();
    return data
  },

  updateParam: function(kind, index, attr, value){
    let suffix = attr == 'balance' ? '' : attr == 'label' ? '_names' : '_rates'
    attr = `${kind}${suffix}`;
    let data = { synced: false };
    data[attr] = this.get(attr);
    const prevVal = data[attr][index];
    //if (index >= data[attr].length || prevVal == value) return false;
    if (prevVal == value) return false;

    data[attr][index] = value;
    this.set(data);
    this.saveLocal();
    this.syncParams([attr]);
  },

  removeLoan: function(kind, index){
    this.get(kind).splice(index, 1);
    this.get(`${kind}_names`).splice(index, 1);
    this.get(`${kind}_rates`).splice(index, 1);
    this.saveLocal();
    this.syncParams();
  },

  getByKey: function(key){
    let loans = [];
    this.get(key).forEach((value, i)=>{
      loans.push({
        index: i,
        value: value,
        label: this.get(`${key}_names`)[i],
        rate: this.get(`${key}_rates`)[i],
      })
    })
    return loans;
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes))
  },

  restoreLocal: function(){
    let details = localStorage.getItem(this.key);
    if (details){
      details = JSON.parse(details);
      this.set(details)
    }
  },

  syncParams: function(fields){
    if (!App.syncOn() || this.get('synced')) return false;

    let data = this.attributes;
    fields ? data = _.pick(data, fields) : delete data.synced;

    $.ajax({
      url: '/loans', type: 'PATCH', dataType: 'json',
      data: data,
      success: (data) => {
        this.set('synced', true)
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

})