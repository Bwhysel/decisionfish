App.Models.BudgetCategories = Backbone.Model.extend({
  key: 'budget_categories',

  defaults: {
    housing:             0,
    transportation:       0,
    health_care:         0,
    insurance:           0,
    groceries:           0,
    dining_out:          0,
    personal_care:       0,
    clothing:            0,
    entertaining:        0,
    fitness:             0,
    education:           0,
    charity:             0,
    vacation:            0,
    fun:                 0,
    everything:          0,
    credit_card:         0,
    savings:             0,
    fun_mx_category:     'hobbies',
    synced:              false,
    housing_spend:       false,
    transportation_spend: false,
    health_care_spend:   false,
    insurance_spend:     false,
    groceries_spend:     false,
    dining_out_spend:    false,
    personal_care_spend: false,
    clothing_spend:      false,
    entertaining_spend:  false,
    fitness_spend:       false,
    education_spend:     false,
    charity_spend:       false,
    vacation_spend:      false,
    fun_spend:           false,
    credit_card_spend:   false,
    savings_spend:       false,
    housing_diff:        0,
    transportation_diff:  0,
    health_care_diff:    0,
    insurance_diff:      0,
    groceries_diff:      0,
    dining_out_diff:     0,
    personal_care_diff:  0,
    clothing_diff:       0,
    entertaining_diff:   0,
    fitness_diff:        0,
    education_diff:      0,
    charity_diff:        0,
    vacation_diff:       0,
    fun_diff:            0,
    everything_diff:     0,
    credit_card_diff:    0,
    savings_diff:        0,
  },

  getHint: function(category){
    let meta = this.captions[category];
    let need = App.budgetNeeds.captions[this.getNeed(category)]
    let hint = meta.hint;
    if (!need.disabled){
      hint += ` Satisfies need for ${need.title}.`;
    }
    return hint;
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes));
  },

  restoreLocal: function(){
    let temp = localStorage.getItem(this.key);
    if (!temp) return;
    temp = JSON.parse(temp)
    if (!temp.hasOwnProperty('transportation')){
      temp.transportation = temp.trasportation
      temp.transportation_diff = temp.trasportation_diff
      temp.transportation_spend = temp.trasportation_spend
    }
    this.set(temp);
  },

  updateParam: function(attr, value, opts){
    if (!opts) opts = {};
    let prevVal = this.get(attr);
    let data = { synced: false };

    if (this.categoryNames.indexOf(attr) >= 0){
      if (typeof value != 'number') { value = App.utils.parseMoney(value); }
      const diffAttr = `${attr}_diff`;
      let diff = this.get(diffAttr);
      if (!opts.hasOwnProperty('beforeDiff')) opts.beforeDiff = false;
      if (opts.beforeDiff){
        // change value on Expenses page. Diff is not recalculated. Data was showed to user w/o diffs.
        value += diff;
      }else{
        // change value on Spend page. (diff is not there)
        // Savings should
        data[diffAttr] = diff + value - prevVal;
        //data['savings'] = this.get('savings') - newDiff;
      }
      //Expenses:
      //  house&utilities: 150
      //Spend:
      //  house&utilities: 150 -> 250. Diff: +100
      //Return to expenses:
      //  house&utilities: 150 (show)
      //  after change: 150 -> 170 diff should be the same. The end value should be 270
    }
    if (prevVal == value) return false;
    data[attr] = value;
    //console.log(data);
    this.set(data);
    this.saveLocal();
    this.syncParams([attr]);
  },

  recalcSavings: function(){
    let value = this.get('savings')
    const prevValue = value;
    this.categoryNames.forEach((category)=> {
      value -= this.get(`${category}_diff`);
    })
    // We're expect here non-zero total diff. Total zero == 0 for stable state.
    //console.log('recalc savings: ', prevValue, ' => ', value);
    this.updateParam('savings', value, {beforeDiff: false});
  },

  categoryNames: ['housing', 'transportation', 'health_care', 'insurance', 'groceries', 'dining_out', 'personal_care', 'clothing', 'entertaining', 'fitness', 'education', 'charity', 'vacation', 'fun', 'everything', 'credit_card', 'savings'],

  balanceState: function(){
    let sum = 0;
    _.each(this.attributes, (value, field) => {
      if (this.categoryNames.indexOf(field) >= 0){
        sum += value;
      }
    })
    return App.retirementFunding.get('at_income_r') - sum;
  },

  getFunData: function(){
    return this.mx_categories[this.get('fun_mx_category') || 'hobbies'];
  },

  getNeed: function(category){
    if (category == 'fun'){ category = this.getFunData().our  }
    return this.captions[category].need
  },
  getTitle: function(category){
    //return category == 'fun' ? this.get('fun_caption') : this.captions[category].title
    return category == 'fun' ? this.getFunData().title : this.captions[category].title
  },

  selectByNeed: function(need){
    let categories = [];
    _.each(this.attributes, (value, field) => {
      if (this.categoryNames.indexOf(field) >= 0 && this.getNeed(field) == need){
        categories.push(field);
      }
    })
    return categories;
  },

  getDiff: function(need){
    let diff = 0;
    this.selectByNeed(need).forEach((category)=>{
      diff += this.model.get(`${category}_diff`);
    })
    return diff;
  },

  resetSpendingByNeed: function(need, isMet){
    this.selectByNeed(need).forEach((category)=>{
      this.updateParam(`${category}_spend`, isMet);
    })
    return this;
  },

  getDataByNeed: function(need, isMet){
    let data = {};
    this.selectByNeed(need).forEach((category) => {
      const value = this.get(category);
      if (isMet && value == 0) { return; }
      const meta = this.captions[category];
      data[category] = {
        title: this.getTitle(category),
        hint: meta.hint,
        valueS: App.utils.toMoney(value),
        spend_change: this.get(`${category}_spend`)
      }
    })
    delete data.credit_card;
    delete data.savings;
    return data;
  },

  areBalanced: function(){ return this.balanceState() == 0; },
  hasEnoughSavings: function() {
    return this.get('savings') >= App.bigDecision.get('monthly_savings');
  },

  recalcNeeds: function(){
    needVals = {};
    _.each(this.attributes, (value, field) => {
      if (this.categoryNames.indexOf(field) >= 0){
        const need = this.getNeed(field);
        let sum = needVals[need] || 0;
        sum += value;
        needVals[need] = sum;
      }
    })
    _.each(needVals, (value, need) => {
      App.budgetNeeds.updateValue(need, value);
    })
  },

  syncParams: function(fields){
    if (!App.syncOn() || this.get('synced')) return false;

    let data = this.attributes;
    fields ? data = _.pick(data, fields) : delete data.synced;

    $.ajax({
      url: '/budget_categories', type: 'PATCH', dataType: 'json',
      data: data,
      success: (data) => {
        this.set('synced', true);
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

  captions: {
    housing: {
      title: 'Housing',
      hint: 'Rent, mortgage, taxes, HOA, maintenance, utilities etc.',
      need: 'basics'
    },
    transportation: {
      title: 'Transportation',
      hint: 'Car payments & insurance, fuel, maintenance, train fare.',
      need: 'basics'
    },
    health_care: {
      title: 'Health care',
      hint: 'Health insurance premiums, co-pays, drug costs.',
      need: 'basics'
    },
    insurance: {
      title: 'Insurance',
      hint: 'Life, disability, long-term care insurance.',
      need: 'basics'
    },
    groceries: {
      title: 'Groceries',
      hint: 'A fish has gotta eat, right?',
      need: 'basics'
    },
    dining_out: {
      title: 'Dining Out',
      hint: 'Restaurants, ordering-in/take-out, coffee shops, etc.',
      need: 'love'
    },
    personal_care: {
      title: 'Personal Care',
      hint: 'Hair care, cosmetics, etc.',
      need: 'respect'
    },
    clothing: {
      title: 'Clothing',
      hint: 'Um, that strange covering humans cover their bodies with?',
      need: 'respect'
    },
    entertaining: {
      title: 'Entertaining',
      hint: 'Meals and other activities with family and friends.',
      need: 'love'
    },
    fitness: {
      title: 'Fitness',
      hint: 'Excerice classes, gym, equipment. Can I interest you in some swimming lessons?',
      need: 'respect'
    },
    education: {
      title: 'Education',
      hint: 'Tuition, fees, books for all in your household. I love my school!',
      need: 'expert'
    },
    charity: {
      title: 'Charity/Gifts',
      hint: 'Money donations to charities and the cost of gifts to friends and family.',
      need: 'helping'
    },
    vacation: {
      title: 'Vacation',
      hint: 'Take what you spend on travel, hotel etc each year, divided by 12.',
      need: 'fun'
    },
    fun: {
      title: 'Fun',
      hint: 'Other things you spend money on (for leisure, fun and relaxation or for something else… edit the category as left if you like).',
      need: 'fun',
      editable: true
    },
    everything: {
      title: 'Everything Else',
      hint: 'All the expenses that you haven\'t accounted for yet… include a little extra for the unexpected.',
      need: 'none',
    },
    credit_card: {
      title: 'Credit Card Min. Pmts.',
      hint: 'Enter the minimum required payment on cards/loans.',
      need: 'control'
    },
    savings: {
      title: 'Savings/Debt Reduction',
      hint: 'Extra, voluntary payments to reduce debt or additions to savings.',
      need: 'control',
      readonly: true
    },
  },

  mx_categories: {
    alco: {
      title: "Alcohol & Bars",
      our: "dining_out",
    },
    books: {
      title: "Books",
      our: "fun"
    },
    business_services: {
      title: "Business Services",
      our: "everything"
    },
    hobbies: {
      title: 'Hobbies',
      our: 'fun'
    },
    home_improvement: {
      title: 'Home Improvement',
      our: 'housing'
    },
    home_services: {
      title: 'Home Services',
      our: 'housing'
    },
    kids: {
      title: 'Kids',
      our: 'everything'
    },
    pets: {
      title: 'Pets',
      our: 'fun'
    },
    sporting_goods: {
      title: 'Sporting Goods',
      our: 'fitness'
    },
    sports: {
      title: 'Sports',
      our: 'fitness'
    },
    // Clothing
    // Gym
  },
})