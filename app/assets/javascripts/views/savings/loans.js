App.Views.Loans = Backbone.View.extend({
  elementSelector: '#loans-screen',
  mainTemplate: JST['templates/savings/loans'],
  loanTemplate: JST['templates/savings/loans/loan'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetLoanDom);
  },

  events: {
    'click .form-group': 'selectFormGroup',
    'click [role=add-loan]': 'clickAddLoan',
    'click [role=remove-loan]': 'removeLoan',
    'keyup input': 'onKeyUp',
    'click #next-btn': 'onNextClick',
    'click #import-btn': 'onImportClick',
  },

  selectFormGroup: function(event){
    const $target = $(event.target)
    if ($target.hasClass('ask-desi') || $target.hasClass('icon-cross')) { return true; }
    const $block = $(event.currentTarget).addClass('active')
    $block.siblings().removeClass('active');
    $block.children('input').first().trigger('focusin')
  },

  render: function(step){
    let stepIndex = this.steps.indexOf(step)
    if (stepIndex < 0) { step = this.steps[stepIndex = 0] };

    this.step = step;
    const prevStep = stepIndex == 0 ? 'savings_intro' : 'savings_loans/' + this.steps[stepIndex-1]
    const nextStep = stepIndex == (this.steps.length - 1) ? 'savings_401k' : 'savings_loans/' + this.steps[stepIndex+1]

    let data = this.stepsData[step];
    this.targetValue = App.finances.get(step);
    data.targetValue = App.utils.toMoney(this.targetValue);

    App.transitPage(this.mainTemplate({
      prevStep: prevStep,
      nextStep: nextStep,
      step: step,
      data: data
    }))

    this.setElement($(this.elementSelector))
    this.nextBtn = document.getElementById('next-btn');
    this.panel = this.$el.find('[role=loans]');
    this.totalInput = this.$el.find('[role=total-amount]')

    App.utils.setPageHeight(this.el);
    this.resetLoanDom()
  },

  addLoan: function(data, validate = false){
    this.panel.removeClass('hidden')
    this.panel.append(this.loanTemplate({
      index: data.index, label: data.label,
      balance: data.value, rate: data.rate
    }))
    const group = this.panel.children().last();
    VMasker(group.find('input[name=balance]')).maskMoney({precision: 0, delimiter: ',', unit: '$'});
    VMasker(group.find('input[name=rate]')).maskPercent();
    group.find('input[name=label]').trigger('keyup');
  },

  clickAddLoan: function(event){
    const data = this.model.addLoan(this.step);
    this.addLoan(data)
  },

  resetLoanDom: function(){
    this.model.getByKey(this.step).forEach((data) => { this.addLoan(data, true) })
    this.updatePanelTotal();
  },

  removeLoan: function(event){
    const group = $(event.target).closest('.form-group')
    this.model.removeLoan(this.step, group[0].dataset.index);
    group.remove();
    this.updatePanelTotal();
  },

  onKeyUp: function(event){
    const input = event.target;
    const $input = $(input);
    const $group =$input.closest('.form-group');
    const index = parseInt($group[0].dataset.index);
    let value = input.value;
    switch(input.name){
      case 'label':
        $group.find('.error-msg').remove();
        if (value.length >= 2){
          $input.removeClass('error');
        } else {
          $input.addClass('error');
          $group.append($(`<p class='error-msg' style='text-align: left;'>Too few characters</p>`));
        }
        this.checkNextNavigation();
        break;
      case 'balance':
        value = App.utils.parseMoney(value);
        break;
      case 'rate':
        value = App.utils.parsePercent(value);
        break;
    }

    this.model.updateParam(this.step, index, input.name, value)

    if (input.name == 'balance'){ this.updatePanelTotal(); }
  },

  updatePanelTotal: function() {
    let total = 0;
    this.panel.find('input[name=balance]').forEach((input) => {
      total += App.utils.parseMoney(input.value);
    })
    this.totalInput.text(App.utils.toMoney(total));
  },

  checkNextNavigation: function(opts){
    App.utils.timeout(this, ()=>{
      this.nextBtn.disabled = opts ? opts.disabled : this.$el.find('.error-msg').length > 0;
    }, 30, 'nextBtnCheckTimeout')
  },

  onNextClick: function(event){
    const oldVal = this.targetValue;
    const newVal = App.utils.parseMoney(this.totalInput.text());
    const diff1 = Math.abs( newVal - oldVal );
    const diff2 = oldVal == 0 ? newVal : Math.abs( Math.round( newVal / oldVal * 100) - 100 );
    if (diff1 < 100 && diff2 < 10) return true;

    event.preventDefault();
    App.simplePage.openDesiYesNoModal(
      `Your total balance is ${App.utils.toMoney(diff1)} ${newVal > oldVal ? 'more' : 'less'} than the amount you told me in the Retirement chapter. Click OK to go back or CANCEL to adjust your balances here.`,
      ()=>{ App.router.navigate('/finance_details/total', {trigger: true}) },
      ()=>{  },
      { cancelTitle: 'CANCEL', btnTitle: 'OK'}
    )
    return false;
  },

  steps: [ 'credit_cards', 'student_loans', 'other_debts' ],

  stepsData: {
    credit_cards: {
      label: 'Card Name',
      title: 'Credit Cards',
      hint: 'savings_loans_credit_cards', //"Credit cards are a convenient but very expensive way to borrow money. Studies show that people find it easier to spend more money when using credit than cash. Enter the card names, the balance you carry from one month to the next, and the interest rate from a recent credit card bill.",
    },
    student_loans: {
      label: 'Loan Name',
      title: 'Student Loans',
      hint: 'savings_loans_student_loans', //"Did you know that there is $1.3 TRILLION of student loan debt and 20 percent of that is delinquent (late)? I'm developing a tool to help people manage their student loan debt. Enter the student loan names, the amount you owe and the interest rate from a recent student loan bill."
    },
    other_debts: {
      label: 'Loan Name',
      title: 'Car & Other Debts',
      hint: 'savings_loans_other_debts', //"Did you know that there is now $1.2 TRILLION of auto loan debt, record high? I'm developing a tool to help people manage their student loan debt. Enter auto and personal loans amounts you owe and the interest rates from recent bills."
    },

  },

  onImportClick: function(event){
    App.importPage.render('loans', event.currentTarget, (data)=>{
      if (data.credit_cards){
        console.log(data);
        this.model.set(data);
        this.resetLoanDom();
      }
    }, ()=>{
      this.render(this.step);
    })
  },

})