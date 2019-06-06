App.Views.BudgetSpend = Backbone.View.extend({
  elementSelector: '#budget-spend-screen',

  template: JST['templates/budget/spend'],
  increment: 25,

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInputs)

  },

  events: {
    'focusin input': 'selectInput',
    'keyup input': 'keyUpInput',
    'click [role=increase]': 'onIncreaseParam',
    'click [role=decrease]': 'onDecreaseParam',
    'click #next-btn': 'onNextClick'
  },

  render: function(){
    let captions = _.clone(this.model.captions);
    captions.fun.title = this.model.getFunData().title;
    _.each(captions, (attrs, category) => {
      if ((category == 'credit_card') || (category == 'savings')) {return;}
      if (category == 'savings'){
        attrs.suggestKlass = 'spend-more';
        attrs.suggestion = 'SAVE<br/>MORE!';
        attrs.disabled = true
      }else if (category == 'everything'){
        attrs.suggestKlass = 'spend-less';
        attrs.suggestion = 'SPEND<br/>LESS';
        attrs.disabled = true
      }else if (this.model.get(`${category}_spend`)){
        let need = category == 'fun' ? this.model.getNeed(category) : attrs.need
        if (App.budgetNeeds.isMet(need)){
          attrs.suggestKlass = 'spend-less';
          attrs.suggestion = 'SPEND<br/>LESS';
        }else {
          attrs.suggestKlass = 'spend-more';
          attrs.suggestion = 'SPEND<br/>MORE';
        }
      }else{
        attrs.suggestKlass = 'spend-protect'
        attrs.suggestion = 'PROTECT';
      }
    })
    this.savingsGoal = App.bigDecision.get('monthly_savings');
    App.transitPage(this.template({
      takeHomePay: App.utils.toMoney(App.retirementFunding.get('at_income_r')),
      fields: captions,
      goal: App.utils.toMoney(this.savingsGoal)
    }));

    this.setElement($(this.elementSelector));

    this.nextBtn = this.$el.find('#next-btn').addClass('disabled')

    const prevAction = Backbone.history.pastFragments[Backbone.history.pastFragments.length - 1]
    //console.log(prevAction, Backbone.history.pastFragments)
    if (!prevAction || prevAction == 'budget_walkthrough'){
      App.simplePage.openDesiModal("Here's where we design your budget for happiness! Consider each category carefully: decide whether to spend less, spend more, or leave it unchanged (\"protect\"), based on what you need to be happier.")
    }

    const scrollableArea = $('.scrollable-area');
    const scrollableHeight = document.documentElement.clientHeight - ($('.wrapper').height() - scrollableArea.height());
    scrollableArea.css('maxHeight', ''+scrollableHeight+'px');

    this.proposedStick = this.$el.find('.proposed-stick')
    this.savingsProgress = this.$el.find('.savings-progress');
    this.savingsProgressArea = this.$el.find('.savings-progress');

    this.savingsValue = this.$el.find('[role=savings-value]');
    this.safeState = this.$el.find('[role=safe-state]');
    this.unsafeState = this.$el.find('[role=unsafe-state]');

    tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});

    this.resetInputs();
    this.savingsUpdate();

    if (!this.model.areBalanced()){
      setTimeout(()=>{
        App.simplePage.openDesiModal("You're ready to make your budget happier! Just add and subtract spending from categories to meet your needs.")
      }, 20);
    }
  },

  onNextClick: function(){
    let diff = this.savingsAboveGoal();
    if (diff >= 0) return true;

    event.preventDefault();

    let msg = `You are so close to done! Please reduce your spending by ${App.utils.toMoney(-diff)} so that you can meet your monthly savings goal of ${App.utils.toMoney(this.savingsGoal)}. Need some help? Try "Give and Get Ideas", below or ask for me for help. You can also return to the Retirement chapter to change your savings goal.`
    App.simplePage.openSectionModal({
      btnTitle: 'RETIREMENT',
      cancelTitle: 'OK',
      helpBtn: true,
      content: msg
    }, ()=>{
      App.router.navigate('/family', {trigger: true})
    }, ()=>{
      console.log('cancel')
    })

    return false;
  },

  resetInputs: function(){
    let attrs = this.model.attributes;
    this.$el.find('input[type=text]').forEach((input) => {
      VMasker(input).maskMoney({precision: 0, delimiter: ',', unit: '$'});
      input.value = attrs[input.name];
      const $input = $(input)
      //if (input.value) { $input.trigger('keyup', true); }
      $input.trigger('keyup', true);

      $input.siblings('.spend-suggest').toggleClass('spend-zero', input.value==0)
    })
    this.savingsValue.text(App.utils.toMoney(attrs.savings))
    this.$el.find('[role=credit-card-value]').text(App.utils.toMoney(attrs.credit_card))

    this.checkNextState()
  },

  selectInput: function(event){
    const $input = $(event.target)
    $block = $input.closest('.form-group')

    this.$el.find('.active').removeClass('active');
    $block.addClass('active');
  },

  keyUpInput: function(event, manual){
    const target = event.currentTarget;
    if (manual){ return };
    const curValue = App.utils.parseMoney(target.value || 0);
    const prevValue = this.model.get(target.name);
    const newSavings = this.model.get('savings') - (curValue - prevValue);
    //console.log(this.model.get('savings'),'; ', curValue, ' <= ', prevValue);
    if (curValue < 0 || newSavings < 0){
      target.value = App.utils.toMoney(prevValue);
      return false;
    }
    target.value = App.utils.toMoney(curValue);
    this.model.updateParam(target.name, target.value, {beforeDiff: false})
    this.savingsUpdate();
    this.checkNextState();
  },

  percent: function(part, whole){
    return Math.round(part/whole * 100);
  },

  savingsUpdate: function(){
    this.model.recalcSavings();
    const proposed = this.model.get('savings');
    this.savingsValue.text(App.utils.toMoney(proposed));

    // GENERATE BAR & LEGEND
    let maxValue = Math.max(proposed, this.savingsGoal);
    let proposedPos = this.percent(proposed, maxValue);
    let gradientPos = this.percent(this.savingsGoal, maxValue);

    if (proposedPos > 90){ maxValue = Math.round(maxValue * 1.05) }
    let factor = maxValue > 500 ? 100 : maxValue > 100 ? 50 : 10;
    if (maxValue > 500){
      factor = Math.round(maxValue / 5 / factor) * factor;
    }

    proposedPos = this.percent(proposed, maxValue)
    gradientPos = this.percent(this.savingsGoal, maxValue);

    this.savingsProgressArea.find('.axis-label').remove();

    let i = 0;
    while (i <= maxValue){
      let p = this.percent(i, maxValue);
      this.savingsProgressArea.append($("<span class='axis-label' style='left: "+p+"%'>"+App.utils.toMoney(i)+"</span>"))
      i += factor;
    }

    this.proposedStick.css('left', `${proposedPos}%`);
    this.savingsProgress.css('width', `${gradientPos}%`);
  },

  savingsAboveGoal: function(){
    return this.model.get('savings') - this.savingsGoal;
  },

  checkNextState: function() {
    if (this.savingsAboveGoal() >= 0){
      this.safeState.removeClass('hidden');
      this.unsafeState.addClass('hidden');
      this.nextBtn.removeClass('disabled');
    }else{
      this.unsafeState.removeClass('hidden');
      this.safeState.addClass('hidden');
      this.nextBtn.addClass('disabled');
    }
    this.model.recalcNeeds();
  },

  onIncreaseParam: function(event){ this.onChangeParam(event, 1) },
  onDecreaseParam: function(event){ this.onChangeParam(event, -1) },
  onChangeParam: function(event, direction){
    const $input = $(event.currentTarget).closest('.form-group').find('[role=expense-field]');
    let v = App.utils.parseMoney($input.val()) + direction * this.increment;

    $input.val(v).trigger('keyup');
  },

})