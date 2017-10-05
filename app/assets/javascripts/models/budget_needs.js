App.Models.BudgetNeeds = Backbone.Model.extend({
  key: 'budget_needs',

  defaults: {
    basics_met:    false,
    love_met:      false,
    respect_met:   false,
    control_met:   false,
    expert_met:    false,
    helping_met:   false,
    fun_met:       false,
    basics_value:  0,
    love_value:    0,
    respect_value: 0,
    control_value: 0,
    expert_value:  0,
    helping_value: 0,
    fun_value:     0,
    none_value:    0,
    synced:        false
  },

  captions: {
    basics: {
      title: 'Basics',
      prefix: "Let's start with ",
      hint: 'Do you have sufficient food and housing? Are you healthy? Do you feel safe?',
      content: 'Includes housing, transportation, healthcare, insurance, groceries.'
    },
    love: {
      title: 'Love & Friendship',
      prefix: "Let's move on to<br/>",
      hint: 'Do you regularly feel loved and have companionship and people you can count on for help in an emergency?',
      content: 'Includes dining out and entertaining.'
    },
    respect: {
      title: 'Respect & Pride',
      prefix: "Now, think about<br/>",
      hint: 'Do you feel proud of something in your life, worthy of respect and respected by others enough?',
      content: 'Includes personal care, clothing and fitness spending.'
    },
    expert: {
      title: 'Being Good at Something',
      prefix: "Great! How about<br/>",
      hint: 'Are you doing what you do best and learning new things enough?',
      content: 'Includes education spending.'
    },
    control: {
      title: 'In Control of Your Life',
      prefix: "Almost done. Consider the<br/>need, ",
      hint: 'Can you chose how your time is spent and do you experience freedom in life enough?',
      content: 'Includes credit card minimum payments and savings/debt reduction spending.'
    },
    helping: {
      title: 'Helping Others',
      prefix: "And then there's<br/>",
      hint: 'Do you feel you do enough to improve your community, country, planet?',
      content: 'Includes charity/gift spending.'
    },
    fun: {
      title: 'Leisure & Fun',
      prefix: "Finally, how about <i>Leisure,<br/>Fun & Relaxation?</i>",
      hint: 'Do you get enough leisure, fun & relaxation?',
      content: 'Includes vacation and [fun] spending.'
    },
    none: {
      title: 'None',
      disabled: true,
      content: "Includes all spending that doesn't have a category."
    }
  },

  getVariants: function(){
    variants = {};
    _.each(App.budgetCategories.mx_categories, (attrs, mx_category) => {
      let needCaption = this.captions[App.budgetCategories.captions[attrs.our].need].title;
      if (needCaption.indexOf('Control')>=0) needCaption = 'In Control';
      variants[mx_category] = `${attrs.title} | ${needCaption}`;
    })
    return variants;
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes));
  },

  restoreLocal: function(){
    let temp = localStorage.getItem(this.key);
    if (!temp) return;
    this.set(JSON.parse(temp));
  },

  updateParam: function(need, kind, value){
    const field = `${need}_${kind}`;
    if (this.get(field) == value){ return; }
    let data = { synced: false };
    data[field] = value;
    this.set(data);
    this.saveLocal();
    this.syncParams([field]);
  },

  updateNeed: function(need, value){
    this.updateParam(need, 'met', value);
    if (App.budgetNeeds.hasChanged(`${need}_met`)){
      App.budgetCategories.resetSpendingByNeed(need, value)
    }
  },
  updateValue: function(need, value){
    this.updateParam(need, 'value', value);
  },

  isMet: function(need){
    return this.get(`${need}_met`) === true;
  },

  getValue: function(need){
    return this.get(`${need}_value`);
  },

  getDiff: function(need){
    let diff = 0;
    App.budgetCategories.selectByNeed(need).forEach((category)=>{
      diff += App.budgetCategories.get(`${category}_diff`);
    })
    return diff;
  },

  syncParams: function(fields){
    if (!App.syncOn() || this.get('synced')) return false;

    App.utils.timeout(this, ()=>{
      let data = this.attributes;
      fields ? data = _.pick(data, fields) : delete data.synced;

      let xhr = $.ajax({
        url: '/budget_needs', type: 'PATCH', dataType: 'json',
        data: data,
        success: (data) => {
          this.set('synced', true);
        },
        error: (xhr, errorStatus, error) => {
          console.log(error)
        }
      })

      return xhr;
    }, 20)

  },
})