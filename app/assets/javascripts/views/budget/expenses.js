App.Views.BudgetExpenses = Backbone.View.extend({
  elementSelector: '#budget-expenses-screen',

  template: JST['templates/budget/expenses'],
  increment: 25,

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInputs)

  },

  events: {
    'focusin input': 'selectInput',
    'keyup input': 'keyUpInput',
    'click [role=fun-need-select]': 'selectFunNeed',
    'click .icon-dropdown-arrow': 'selectFunNeed',
    'click [role=increase]': 'onIncreaseParam',
    'click [role=decrease]': 'onDecreaseParam',
    'click #next-btn': 'onNextClick'
  },

  render: function(){
    App.transitPage(this.template({
      fields: this.model.captions
    }));
    this.setElement($(this.elementSelector));
    this.$panel = this.$el.find('.panel');
    this.safeState = this.$el.find('[role=safe-state]');
    this.unsafeState = this.$el.find('[role=unsafe-state]');
    this.funCategory = this.$el.find('[role=fun-need-select]');
    this.funVariants = App.budgetNeeds.getVariants();
    this.nextBtn = this.$el.find('#next-btn');

    tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});

    this.scrollableArea = $('.scrollable-area');

    this.resetInputs();
  },

  onNextClick: function(){
    let diff = this.model.balanceState();
    if (diff == 0) return true;

    let msg;
    if(diff>0){
      msg = `You haven't accounted for ${App.utils.toMoney(diff)}. Please adjust your current spending. Maybe add it to 'Everything Else' or 'Savings/Debt Reduction'?`
    }else{
      msg = `You seem to be spending ${App.utils.toMoney(-diff)} more than your after-tax income. Is this correct? You may need to reduce current spending above or go back to the Retirement module and adjust your income higher.`
    }
    event.preventDefault();

    App.simplePage.openDesiModal(msg)

    return false;
  },

  resetInputs: function(){
    let attrs = _.clone(this.model.attributes);
    let totalDiff = 0;
    this.model.categoryNames.forEach((category)=>{
      const diff = attrs[`${category}_diff`];
      attrs[category] -= diff;
      totalDiff += diff;
    })
    attrs.savings += totalDiff;
    this.minSavings = App.bigDecision.get('monthly_savings');
    if (attrs.savings == 0){
      attrs.savings = this.minSavings;
      this.model.updateParam('savings', App.utils.toMoney(this.minSavings), {beforeDiff: true})
    }
    const takeHomePay = App.utils.toMoney(App.retirementFunding.get('at_income_r'))
    this.$el.find('[role=take-home-pay]').text(takeHomePay);

    // TODO: decrease values of categories with DIFF.
    this.$el.find('input[type=text]').forEach((input) => {
      if (input.name != 'fun_caption'){
        VMasker(input).maskMoney({precision: 0, delimiter: ',', unit: '$'});
      }
      input.value = attrs[input.name];
      if (input.value) {
        $(input).trigger('keyup', true); // to apply mask for input
      }
    })
    this.funCategory.text(this.model.getFunData().title);

    App.simplePage.openDesiModal(`I see that your take-home pay is ${takeHomePay}. Tell me roughly how much you have been spending it in each category, monthly, on average.`)
    this.updatePanelTotal()
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
    if (target.name == 'savings'){
      App.utils.timeout(this, ()=>{
        let v = App.utils.parseMoney(target.value);
        if (v < this.minSavings){
          target.value = App.utils.toMoney(this.minSavings);
          App.simplePage.openDesiYesNoModal(
            "You will have to go back to Retirement chapter to reduce your savings.",
            ()=>{ App.router.navigate('/big_decision', {trigger: true}) },
            ()=>{},
            {btnTitle: 'GO BACK', cancelTitle: 'NEVER MIND'}
          );
        }
        this.afterKeyUp(target);
      }, 500, 'budget_expense_check');
    }else{
      this.afterKeyUp(target);
    }
  },
  afterKeyUp: function(target){
    if (this.model.categoryNames.indexOf(target.name)>=0) {
      target.value = App.utils.toMoney(App.utils.parseMoney(target.value));
    }
    this.model.updateParam(target.name, target.value, {beforeDiff: true})
    this.updatePanelTotal();
  },

  updatePanelTotal: function() {
    let total = 0;
    const totalInput = this.$panel.find('[role=total-amount]');

    this.$panel.find('input[type=text]').forEach((input) => {
      if (this.model.categoryNames.indexOf(input.name)<0) { return; }
      let val = input.value.replace(/\$\s?|\,/g, '')
      if (val.length){
        total += parseInt(val);
      }
    })

    totalInput.text(App.utils.toMoney(total));

    let msg = '';
    let diff = this.model.balanceState();
    if (diff > 0){
      msg = `You haven't accounted for ${App.utils.toMoney(diff)}`;
    }else if (diff < 0){
      msg = `Dude, you're spending ${App.utils.toMoney(-diff)} more than you earn. Cut some spending, please.`
    }
    /*if ((diff < 0) && (this.model.get('savings') == 0)){
      msg += ` If you're adding debt, enter ${App.utils.toMoney(diff)} in 'Savings/Debt Reduction' (as a negative number)`
    }*/
    if (msg){
      this.unsafeState.removeClass('hidden').find('.error-msg').text(msg);
      this.safeState.addClass('hidden');
      this.nextBtn.addClass('disabled');
    }else{
      this.model.recalcNeeds();
      this.safeState.removeClass('hidden');
      this.unsafeState.addClass('hidden');
      this.nextBtn.removeClass('disabled');
    }
    //const scrollableHeight =  - ($('.wrapper').height() - this.scrollableArea.height() - this.scrollableArea.siblings().height()+50);
    if (screen.height > 450){
      const scrollableHeight = document.documentElement.clientHeight - ($('.wrapper').height() - this.scrollableArea.height() - this.scrollableArea.siblings().height());
      this.scrollableArea.css('maxHeight', ''+scrollableHeight+'px');
    }else{
      this.scrollableArea.css('overflow', 'inherit');
    }
  },

  selectFunNeed: function(event){
    const target = this.$('[role=fun-need-select]')
    const modalId = 'fun-need-modal';
    App.simplePage.selectModal('fun-need-modal',
      this.funVariants, this.model.get('fun_mx_category'), (selectedId) => {
        target.text(this.model.mx_categories[selectedId].title);
        this.model.updateParam('fun_mx_category', selectedId);
        this.model.updateParam('fun_spend', App.budgetNeeds.isMet(this.model.getNeed('fun')));
        this.model.recalcNeeds();
      }
    )
  },

  onIncreaseParam: function(event){ this.onChangeParam(event, 1) },
  onDecreaseParam: function(event){ this.onChangeParam(event, -1) },
  onChangeParam: function(event, direction){
    const $input = $(event.currentTarget).closest('.form-group').find('[role=expense-field]');
    let v = App.utils.parseMoney($input.val()) + direction * this.increment;

    $input.val(v).trigger('keyup');
  },

})