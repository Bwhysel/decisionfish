App.Views.FutureAssumptions = Backbone.View.extend({
  elementSelector: '#future-assumptions-screen',
  mainTemplate: JST['templates/future/assumptions/index'],
  investmentsTpl: JST['templates/future/assumptions/investments'],

  initialize: function(options){
    //this.listenTo(this.model, 'reset', this.resetInputs)
    // commented due to validation simplicity for that model
    // Backbone.Validation.bind(this, {model: this.model });
  },

  events: {
    'focusin input': 'selectInput',
    'focusin input[name=college_type]': 'selectCollege',
    'focusout input': 'deselectInput',
    'keyup input': 'keyUpInput',
    'keyup input[data-target=rt_avg]': 'reCalcAvgReturn',
    'keyup input[data-limit=p100]': 'check100percents',
    'keyup input[name=longevity_risk]': 'reCalcLifeExpectancy',
    'keydown input[name=college_type]': 'blockInput',
    'click #next-btn': 'onNextClick',
    'click [role=reset]': 'onResetClick'
  },

  onResetClick: function(event){
    let decision_opts = App.bigDecision.decisionOpts(true);
    $.ajax({
      type: 'POST', url: '/defaults',
      data: decision_opts, dataType: 'json',
      success: (data) => {
        //console.log(data)
        if (App.differentDecisions) { App.differentDecisions.changed = true; }
        App.retirementFunding.set(data.retirement_funding).saveLocal();
        App.finAssumptions.setSynced().set(data.assumptions).saveLocal();
        App.finAssumptions.setRecalculatables(data.recalculated, true)
        this.resetInputs();
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

  onNextClick: function(event){
    if (this.step == 'income') { return true }
    if (this.forceRedirect) {
      this.forceRedirect = false;
      return true;
    }
    event.preventDefault();

    let decision_opts = App.bigDecision.decisionOpts();
    $.ajax({
      type: 'POST', url: '/big_decision/solve', data: decision_opts, dataType: 'json',
      success: (data) => {
        //console.log(data)
        if (App.differentDecisions) { App.differentDecisions.changed = true; }
        App.retirementFunding.set(data.retirement_funding).saveLocal();
        App.finAssumptions.setSynced().set(data.assumptions).saveLocal();
        App.finAssumptions.setRecalculatables(data.recalculated)
        //this.resetValues();
        if (App.retirementFunding.get('success')){
          this.forceRedirect = true;
          $(event.currentTarget).trigger('click')
        }else {
          App.simplePage.openConfirmationDialog({
            content: 'Your retirement is UNSAFE. "Try again" button will redirect you to the Big Decision page.',
            btnTitle: 'TRY AGAIN', cancelTitle: 'CANCEL'
          }, () => {
            App.router.navigate('/big_decision', {trigger: true})
          })
        }
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })

    return false;
  },

  check100percents: function(event, manual){
    if (manual) return false;
    const name = event.target.name;
    let values = {};
    this.rt100percents.forEach((input) => {
      values[input.name] = this.getInputVal(input) * 100;
    })
    let [other1, other2] = name == 'rt_cash_alloc' ? [1, 2] :
                           name == 'rt_fi_alloc' ? [2, 0] : [0, 1]
    other1 = this.rt100percents[other1];
    other2 = this.rt100percents[other2];

    let v = values[name],
        v1 = values[other1.name],
        v2 = values[other2.name];
    let diff = v + v1 + v2 - 100;
    if (diff == 0){
      return true;
    }else{
      v1 -= diff;
      if (v1 < 0){
        v2 += v1;
        v1 = 0;
      }
      other1.value = VMasker.toPercent(v1);
      other2.value = VMasker.toPercent(v2);
      this.model.updateParam(other1.name, v1 / 100);
      this.model.updateParam(other2.name, v2 / 100);
    }
  },

  render: function(step){
    let stepIndex = this.steps.indexOf(step)
    if (stepIndex < 0) { step = this.steps[stepIndex = 0] };

    this.onLastPage = stepIndex == (this.steps.length - 1);
    this.step = step;
    let data = _.clone(this.stepsData[step]);
    if (step == 'income'){
      if (!App.family.childrenYears.length){ delete data.college; }
      if (!App.finances.get('mortgage')){ delete data.mortgage; }
    }
    const tpl = step == 'investments' ? 'investmentsTpl' : 'mainTemplate';
    let fields = App.finAssumptions.fieldsData();
    const [name1, name2] = App.family.getNames();

    App.transitPage(this[tpl]({
      prevStep: (stepIndex ? 'future_assumptions/' + this.steps[stepIndex-1] : 'different_decisions/quick_note'),
      nextStep: (this.onLastPage ? 'future_congratulations' : 'future_assumptions/' + this.steps[stepIndex+1]),
      data: data,
      fields: fields,
      name1: name1,
      name2: name2
    }))
    this.setElement($(this.elementSelector))

    this.nextBtn = document.getElementById('next-btn');
    this.rtAvg = this.$el.find('[name=rt_avg]')[0];
    this.rt100percents = this.$el.find('input[data-limit=p100]');
    this.life1 = this.$el.find('[name=life_expectancy1]')[0];
    this.life2 = this.$el.find('[name=life_expectancy2]')[0];

    tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});

    App.utils.setPageHeight(this.el);
    this.resetInputs();
  },

  resetInputs: function(){
    let invalid = false;
    this.$el.find('input[name]').forEach((input) => {
      const name = input.name;
      if (name == 'life_expectancy2' || name == 'life_expectancy1') { return; }
      input.value = this.model.get(input.name);

      const vMask = VMasker(input);
      switch(input.dataset.type){
        case 'percent':
          input.value = parseFloat(input.value)*100
          vMask.maskPercent();
          break;
        case 'money':
          vMask.maskMoney({precision: 0, delimiter: ',', unit: '$'})
          break
        case 'select':
          input.value = this.model.collegeTypeVariants[input.value];
          break;
      }

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
    return true;
  },

  selectCollege: function(event){
    const $input = $(event.target);
    const variants = this.model.collegeTypeVariants;
    App.simplePage.selectModal('college-modal', variants, this.model.get('college_type'),
      (selectedId) => {
        const priceInput = this.$el.find('input[name=net_college_cost]');
        let text = variants[selectedId];
        if (text) {
          $input.val(text).trigger('keyup');
          let newPrice = App.finAssumptions.changeCollegePrice(selectedId);
          if (newPrice){
            priceInput.val(newPrice).trigger('keyup')
          }
          this.$el.find('input[name=years_in_college]').val(this.model.get('years_in_college')).trigger('keyup')
        }
        priceInput.focus();
      }
    )
  },

  deselectInput: function(event){
    const target = event.target
    if (target.dataset.type != 'select'){
      this.validateInput(target);
      this.model.updateParam(target.name, this.getInputVal(target))
    }
  },

  getInputVal: function(input){
    let value = input.value;
    switch(input.dataset.type){
    case 'percent':
      value = parseFloat(value) / 100;
      break;
    case 'money':
      value = App.utils.parseMoney(value);
      break;
    }
    return value;
  },

  keyUpInput: function(event, manual){
    let $target = $(event.currentTarget);
    if ($target.val().length || manual){
      this.validateInput($target[0])
    }

    if ($target[0].dataset.type == 'money'){
      let v = this.getInputVal($target[0]);
      $target.val(App.utils.toMoney(v));
    }
  },

  blockInput: function(event){
    if (event.keyCode != 9) return false;
  },

  reCalcLifeExpectancy: function(event){
    if (!this.life1) { return true; }
    const input = event.target;
    const [life1, life2] = App.finAssumptions.calcLifeExpectations(this.getInputVal(input));
    this.life1.value = life1;
    if (this.life2) { this.life2.value = life2; }
  },

  reCalcAvgReturn: function(event, manual){
    if (!manual){
      if (this.recalcRtAvgTimeout) { clearTimeout(this.recalcRtAvgTimeout) }
      this.recalcRtAvgTimeout = setTimeout(() => {
        const input = event.target
        const rt = this.model.calcAvgReturn(input.name, this.getInputVal(input))
        this.rtAvg.value = VMasker.toPercent(rt*100) ;
        this.recalcRtAvgTimeout = null;
      }, this.validateDelay * 2)
    }
  },

  validateDelay: 30,

  validateInput: function(input){
    if (this.validateTimeout){ clearTimeout(this.validateTimeout) }
    this.validateTimeout = setTimeout(()=>{
      const income = this.getInputVal(input);
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
      this.checkNextNavigation();
      this.validateTimeout = null;
    }, this.validateDelay)
  },

  checkNextNavigation: function(opts){
    if (this.nextBtnCheckTimeout){ clearTimeout(this.nextBtnCheckTimeout); }
    this.nextBtnCheckTimeout = setTimeout(() => {
      this.nextBtn.disabled = opts ? opts.disabled : this.$el.find('.error-msg').length > 0;
      this.nextBtnCheckTimeout = null;
    }, 30)
  },

  steps: ['income', 'investments'],

  stepsData: {
    income: {
      your_income: {
        title: 'Your Income',
        fields: ['income_growth', 'until_age', 'income_growth2']
      },
      college: {
        title: 'College for your kids',
        fields: ['college_type', 'net_college_cost', 'college_inflation', 'college_age', 'years_in_college']
      },
      morgage: {
        title: 'Mortgage on your home',
        fields: ['mortgage_rate', 'original_term', 'mortgage_age']
      },
      life_expectancy: {
        title: 'How Long Will You Live?',
        fields: ['change_in_expenses', 'longevity_risk', 'life_expectancy1', 'life_expectancy2']
      },
      social_security: {
        title: 'Social Security',
        fields: ['soc_sec1', 'soc_sec2', 'ss_benefit_cut', 'soc_sec_min_age']
      }
    },
    investments: {
      insurance: {
        title: 'How Much Life Insurance?',
        fields: [ 'income_replacement', 'value_of_housework' ]
      },
      pensions: {
        title: 'Pensions',
        fields: [ 'pensions', 'pension_begins_at' ]
      },
      investments: {
        title: 'Investments',
        fields: [ 'rt_cash', 'rt_fi', 'rt_eq', 'rt_avg', 'rt_re', 'inflation', 'rt_loan' ]
      }
    }

  }

})