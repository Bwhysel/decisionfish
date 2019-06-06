App.Views.FinanceDetails = Backbone.View.extend({
  elementSelector: '#finance-details-screen',
  mainTemplate: JST['templates/future/finance_details/index'],
  sumTemplate: JST['templates/future/finance_details/summarize'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInputs)
    // commented due to validation simplicity for that model
    // Backbone.Validation.bind(this, {model: this.model });
  },

  events: {
    'click [role=step-link]': 'selectStep', // OR JUST use goto_link with proper page
    'click #import-btn': 'onImportClick',
    'focusin input': 'selectInput',
    //'focusout input': 'deselectInput',
    'keyup input': 'keyUpInput'
  },

  render: function(step){
    let steps = _.clone(this.steps);
    const withoutChildren = App.family.childrenYears.length == 0;
    if (withoutChildren){
      steps.splice(1,1) // remove college_savings
    }
    let stepIndex = steps.indexOf(step)
    if (stepIndex < 0) { step = steps[stepIndex = 0] };
    this.step = step;
    this.onLastPage = stepIndex == (steps.length - 1);
    const prevStep = stepIndex == 0 ? 'family' : 'finance_details/' + steps[stepIndex-1]
    const nextStep = this.onLastPage ? 'big_decision' : 'finance_details/' + steps[stepIndex+1]


    App.transitPage(this.mainTemplate({
      prevStep: prevStep,
      nextStep: nextStep,
      step: step,
      data: this.stepsData[step]
    }))

    this.setElement($(this.elementSelector))
    this.nextBtn = document.getElementById('next-btn');

    if (step == 'total'){
      $('.icon-back').attr('role', 'goto-back').attr('data-safe-path', prevStep)
    }

    if (this.onLastPage){
      this.$el.find('[role=partial-placeholder]').replaceWith(this.sumTemplate({withoutChildren: withoutChildren}))
    }else{
      this.$el.find('[data-source=steps-progress]').html(App.simplePage.circleProgressTpl({
        stepIndex: stepIndex,
        stepsCount: steps.length-1
      }))
    }

    App.utils.setPageHeight(this.el);
    this.resetInputs();

    $(this.$el.find('input[name]')[0]).focus();
    if (this.onLastPage){
      this.totalInvests = 0;
      this.totalDebt = 0;
      this.totalHome = 0;
      this.netFinance = this.$el.find('[role=financial-net]');
      this.netTotal = this.$el.find('[role=total-net]');
      this.$el.find('.countable').forEach((panel) => { this.updatePanelTotal($(panel)) });
      tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});
    }
  },

  updatePanelTotal: function($panel) {
    let total = null;
    const totalInput = $panel.find('[role=total-amount]');
    const totalName = totalInput[0].dataset.name;

    let isHome = totalName == 'totalHome';
    $panel.find('input[name]').forEach((input) => {
      let val = input.value.replace(/\$\s?|\,/g, '')
      if (val.length){
        val = parseInt(val);
        total = total === null ? val : total + val * (isHome ? -1 : 1);
      }
    })

    totalInput.text(App.utils.toMoney(total));
    this[totalName] = total;

    let temp = this.totalInvests - this.totalDebt;
    let str = App.utils.toMoney(temp).replace(/^\-/,'');
    if (temp < 0) {
      this.netFinance.text(`(${str})`).addClass('negative')
    } else {
      this.netFinance.text(str).removeClass('negative')
    }

    temp += this.totalHome;
    str = App.utils.toMoney(temp).replace(/^\-/,'');
    if (temp < 0) {
      this.netTotal.text(`(${str})`).addClass('negative')
    } else {
      this.netTotal.text(str).removeClass('negative')
    }

    return total;
  },

  resetInputs: function(){
    let invalid = false;
    this.$el.find('input[type=text]').forEach((input) => {

      VMasker(input).maskMoney({precision: 0, delimiter: ',', unit: '$'});
      input.value = this.model.get(input.name);
      if (input.value) {
        $(input).trigger('keyup', true); // to apply mask for input
      }else {
        invalid = true;
      }
    })

    if (invalid){ this.checkNextNavigation({disabled: true}) }
  },

  selectInput: function(event){
    const $input = $(event.target)
    $block = $input.closest('.form-group')

    this.$el.find('.active').removeClass('active');
    $block.addClass('active');
  },

  keyUpInput: function(event, manual){
    const target = event.currentTarget;
    const $target = $(target);
    let v = $target.val();
    if (v.length || manual){
      this.validateInput(target)
    }
    if (manual) { return }

    if (this.onLastPage){
      this.updatePanelTotal($target.closest('.countable'));
    }
    $target.val(App.utils.toMoney(App.utils.parseMoney(v)))
    this.model.updateParam(target.name, target.value)
  },

  validateInput: function(input){
    const income = parseInt(input.value.replace(/\$\s|\,/g, ''));
    const $input = $(input);
    $input.next().remove();

    let err = income > App.finances.maxValue ? 'Too much' :
              income < 0 ? 'No negative numbers, please' : null;
    if (err){
      $input.addClass('error');
      $(`<p class='error-msg'>${err}</p>`).insertAfter($input);
    } else {
      $input.removeClass('error');
    }
    this.checkNextNavigation()
  },

  checkNextNavigation: function(opts){
    if (this.nextBtnCheckTimeout){ clearTimeout(this.nextBtnCheckTimeout); }
    this.nextBtnCheckTimeout = setTimeout(() => {
      this.nextBtn.disabled = opts ? opts.disabled : this.$el.find('.error-msg').length > 0;
    }, 30)
  },

  steps: [
    'cash', 'college_savings', 'retirement_savings', 'credit_cards',
    'student_loans', 'other_debts', 'home_value', 'mortgage', 'total'
  ],
  stepsData: {
    'cash': {
      title: 'Cash/Investment',
      hint: "How much savings do you have in taxable accounts, including emergency funds and savings for specific purposes like home purchasing. Don\'t include college or retirement savings."
    },
    'college_savings': {
      title: 'College Savings',
      hint: "How much do you have saved for your kids' college in 529, prepaid tuition or other programs?"
    },
    'retirement_savings': {
      title: 'Retirement Savings',
      hint: "How much do you have saved for retirement in IRAs, 401ks, but not traditional (\"defined benefit\") pensions?"
    },
    'credit_cards':       {
      title: 'Credit Cards',
      hint: "What is the total amount you owe on credit cards, which remains on your balance?"
    },
    'student_loans': {
      title: 'Student Loans',
      hint: "How much do you owe in total on your student loans?"
    },
    'other_debts': {
      title: 'Car & Other Debt',
      hint: "How much do you owe in total on other debts?"
    },
    'home_value': {
      title: 'Home Value',
      hint: "What is your house worth, if you own it? You can try websites like <a href='https://www.zillow.com/' target='_blank'>Zillow</a>. If you rent, then just enter $0."
    },
    'mortgage': {
      title: 'Mortgage',
      hint: "How much do you owe on your home mortgage?"
    },
  },

  onImportClick: function(event){
    App.importPage.render('balances', event.currentTarget, (data)=>{
      this.model.updateBalances(data);
      this.resetInputs();
    }, ()=>{
      this.render(this.step);
    })
  },

})