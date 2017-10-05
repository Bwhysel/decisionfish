App.Views.BigDecision = Backbone.View.extend({
  elementSelector: '#big-decision-screen',
  mainTemplate: JST['templates/future/big_decision'],

  increments: {
    monthly_savings: 10,
    retire_age: 1,
    parent_contribute: 10
  },

  events: {
    'click #next-btn': 'onNextClick',
    'click [role=increase]': 'onIncreaseParam',
    'click [role=decrease]': 'onDecreaseParam',
    'click [role=target-solve]': 'onTargetSolveClick',
    'keyup input': 'keyUpInput',
  },

  render: function(){
    let p1 = App.family.at(0);
    let p2 = App.family.at(1);
    this.age1 = parseInt(p1.get('age'));
    this.age2 = p2 ? parseInt(p2.get('age')) : null;
    this.withChildren = App.family.childrenYears.length>0;

    App.transitPage(this.mainTemplate({
      name1: p1.get('name'),
      name2: (p2 ? p2.get('name') : null),
      age1: this.age1,
      age2: this.age2,
      withChildren: this.withChildren,
      decisions: this.model.attributes
    }))
    this.setElement($(this.elementSelector));

    let additionalText = this.withChildren ? " and Retirement Age" : ", Retirement Age and Your Share of Kids' College"
    setTimeout(()=>{
      this.firstModal = App.simplePage.openSectionModal({
        title: 'Big Decisions',
        content: `Let's make a savings plan that works. Adjust your Future Monthly Savings${additionalText} until you can Retire Safely. Play around and see what makes you happiest!`
      }, () => {
        this.firstCall = true;
        this.solve('monthly_savings');
      });
    }, 20);

    this.gradient = this.$el.find('.gradient-bar-inner');
    this.triangle = this.$el.find('[role=triangle]');
    this.nextBtn = this.$el.find('#next-btn');

    this.safeState = this.$el.find('[role=safe-state]')
    this.unsafeState = this.$el.find('[role=unsafe-state]')

    VMasker(this.$el.find('[role=monthly_savings]')[0]).maskMoney(
      {precision: 0, delimiter: ',', unit: '$'}
    );
    VMasker(this.$el.find('[role=retire_age]')[0]).maskPattern('99');
    if (this.withChildren){
      VMasker(this.$el.find('[role=parent_contribute]')[0]).maskPercent({precision: 0});
    }

    this.retireAgeMin = parseInt(App.family.at(0).get('age'))+1;
    this.monthlySavingsMax = Math.round(parseInt(App.family.at(0).get('income')) / 12 / 2);

  },

  keyUpInput: function(event, manual){
    if (this.changeTimeout) { clearTimeout(this.changeTimeout) }
      this.changeTimeout = setTimeout(() => {

        const input = event.target
        const name = input.getAttribute('role');
        let v = input.value;
        switch(name){
        case 'monthly_savings':
          v = v.replace(/\$|\s|\,/g, '');
          v = v.length ? parseInt(v) : 0;
          v = Math.min(v, this.monthlySavingsMax);
          break;
        case 'retire_age':
          v = v.length ? parseInt(v) : 0;
          v = Math.max(v, this.retireAgeMin);
          break;
        case 'parent_contribute':
          v = v.length ? parseInt(v) : 0;
          break;
        }
        this.model.updateParam(name, v);
        this.setInputValue(name, v);
        this.solve();
        this.changeTimeout = null;
    }, 1000)

  },

  solve: function(target) {
    let decision_opts = this.model.decisionOpts();
    decision_opts.target = target;

    if (this.firstModal){
      this.firstModal.close();
      this.firstModal = null;
    }
    let delay = target == undefined ? 0 : 2000;
    let t0 = new Date().getTime();


    App.utils.timeout(this, () => {
      const xhr = $.ajax({
        type: 'POST', url: '/big_decision/solve', data: decision_opts, dataType: 'json',
        success: (data) => {
          delay = Math.max(0, delay-(new Date().getTime()-t0));
          this.income_stats = data.income_stats;
          let setValueToInput = false;
          App.retirementFunding.set(data.retirement_funding).saveLocal();
          if (data.value!=null && data.value!=undefined && target){
            this.model.updateParam(target, data.value);
            setValueToInput = true;
          }
          if (delay && setValueToInput){
            let fromValue = target == 'retire_age' ? this.retireAgeMin : target == 'parent_contribute' ? 100 : 0;
            let diff = data.value - fromValue;
            if (diff != 0){
              setValueToInput = false;
              const stepNegative = diff < 0;
              diff = Math.abs(diff);

              let steps = 10;
              let step = Math.round(diff / steps);
              if (step == 0){ step = Math.max(Math.round(steps / diff), 1) }
              steps = Math.ceil(diff / step);
              if (stepNegative) { step *= -1; }

              let fn = (value)=>{
                setTimeout(()=>{
                  value = stepNegative ? Math.max(data.value, value) : Math.min(data.value, value);
                  this.setInputValue(target, value);
                  if (value != data.value){
                    fn(value + step)
                  }
                }, delay/steps)
              }
              fn(fromValue + step);
            }
          }
          if (setValueToInput){
            this.setInputValue(target, data.value);
          }

          App.finAssumptions.setSynced().set(data.assumptions).saveLocal();
          App.finAssumptions.setRecalculatables(data.recalculated)

          this.showResult(delay, target ? data.msg : '');
        },
        error: (xhr, errorStatus, error) => {
          console.log(error)
        }
      })
      return xhr;
    }, 100, 'big_decision_solve')

  },

  showResult: function(delay, err){
    const transitionDuration = (delay/1000+0.5).toFixed(3)+'s';
    const fundingOpts = App.retirementFunding.attributes;
    const factor = fundingOpts.money_runs_out_age / fundingOpts.last_retirement_age;
    const percent = Math.min(0.98, factor);
    let newPos = this.triangle.parent().width() * percent - this.triangle.width()/2
    this.triangle.css('transition-duration', transitionDuration);
    this.triangle.css('left', '' + newPos + 'px');

    let gradientPercent = Math.min(100, 1 / factor * 100).toFixed(2)
    this.gradient.css('transition-duration', transitionDuration);
    this.gradient.css('width', '' + gradientPercent + '%');

    setTimeout(()=>{
      if (!fundingOpts.success && err){
        App.simplePage.openDesiModal(err)
      }
      this.$el.find('[role=age1]').text(App.retirementFunding.get('until_age1'))
      if (this.age2){ this.$el.find('[role=age2]').text(App.retirementFunding.get('until_age2')) }

      this.safeState.toggleClass('hidden', !fundingOpts.success);
      this.unsafeState.toggleClass('hidden', fundingOpts.success);

      this.$el.find('[role=retirement-warning]').toggleClass('hidden', this.model.get('retire_age') <= 62)
      if (this.income_stats){
        this.increments['monthly_savings'] = this.income_stats.increment;
        this.$el.find('[role=savings-percent]').text(this.income_stats.savings_rate);
        this.$el.find('[role=savings-percent-warning]').toggleClass('hidden', !this.income_stats.too_much)
        this.savingsInc = this.income_stats.increment;
      }
      this.$el.find('[role=retirement-funded]').toggleClass('hidden', fundingOpts.overfunded)
      this.$el.find('[role=retirement-overfunded]').toggleClass('hidden', !fundingOpts.overfunded)
    }, delay)
  },

  setInputValue: function(target, value){
    if (target == 'monthly_savings'){
      value = App.utils.toMoney(value);
    }else if (target == 'parent_contribute'){
      value = '' + parseInt(value) + '%';
    }
    this.$el.find(`[role=${target}]`).val(value);
  },

  onNextClick: function(event){
    if (!App.retirementFunding.get('success')){
      let additionalText = this.withChildren ? ', reducing college contribution' : ''
      App.simplePage.openDesiModal(`Please try again to make the Big Decisions that will work for the long run. A happy fish will show. Try increasing savings${additionalText}, retiring later.<br/><br/>You can do it!`)
      event.stopPropagation()
      return false
    }
  },

  onIncreaseParam: function(event){ this.onChangeParam(event, 1) },
  onDecreaseParam: function(event){ this.onChangeParam(event, -1) },
  onChangeParam: function(event, direction){
    const $block = $(event.currentTarget).closest('[data-target]');
    const target = $block[0].dataset.target;
    let prevV = this.model.get(target)
    let v = prevV + direction * this.increments[target]

    switch (target){
    case 'retire_age':
      if (v < this.retireAgeMin || v > 100) return;
      break;
    case 'monthly_savings':
      let maxVal = this.monthlySavingsMax;
      if (v < 0 && prevV != 0){
        v = 0
      }else if (v > maxVal && prevV != maxVal){
        v = maxVal
      }else if (v > maxVal || v < 0){ return }
      break;
    case 'parent_contribute':
      if (v < 0 && prevV > 0){
        v = 0;
      }else if (v > 100 && prevV < 100){
        v = 100
      }
      if (v < 0 || v > 100) return;
      break;
    }
    this.model.updateParam(target, v);
    this.setInputValue(target, v)
    this.solve()
  },

  onTargetSolveClick: function(event) {
    const $block = $(event.currentTarget).closest('[data-target]');
    const target = $block[0].dataset.target;
    this.solve(target);
  }

})