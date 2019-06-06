App.Models.Loans = Backbone.Model.extend({
  key: 'loans',

  defaults: {
    credit_cards:        [],
    student_loans:       [],
    other_debts:         [],
    credit_cards_names:  [],
    student_loans_names: [],
    other_debts_names:   [],
    credit_cards_rates:  [],
    student_loans_rates: [],
    other_debts_rates:   []
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
    this.set('synced', undefined); // required for proper record update
    this.saveLocal();
    this.syncParams();
    return data
  },

  updateParam: function(kind, index, attr, value){
    let suffix = attr == 'balance' ? '' : attr == 'label' ? '_names' : '_rates'
    attr = `${kind}${suffix}`;
    let data = { synced: false };
    const isNewRecord = this.get('synced') === undefined;

    data[attr] = this.get(attr);
    const prevVal = data[attr][index];
    if ((prevVal == value) && !isNewRecord) return false;

    data[attr][index] = value;
    this.set(data);
    this.saveLocal();
    this.syncParams(isNewRecord ? null : [attr]);
  },

  removeLoan: function(kind, index){
    this.get(kind).splice(index, 1);
    this.get(`${kind}_names`).splice(index, 1);
    this.get(`${kind}_rates`).splice(index, 1);
    this.set('synced', false)
    this.saveLocal();
    this.syncParams([kind, `${kind}_names`, `${kind}_rates`]);
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
    let details = App.storage.getItem(this.key);
    if (details){
      details = JSON.parse(details);
      this.set(details)
    }
  },

  syncParams: function(fields){
    if (!App.syncOn() || this.get('synced')) return false;

    let data = this.attributes;
    fields ? data = _.pick(data, fields) : delete data.synced;

    _.each(data, (value, key)=>{
      if (_.isEqual(value, [])){
        data[key] = [null]
      }
    })
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