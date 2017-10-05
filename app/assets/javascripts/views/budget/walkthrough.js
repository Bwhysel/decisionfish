App.Views.BudgetWalkthrough = Backbone.View.extend({
  elementSelector: '#budget-walkthrough-screen',
  mainTemplate: JST['templates/budget/walkthrough'],

  events: {
    'click .ios-styled-checkbox': 'clickCheckboxSpace',
    'change input[type=checkbox]': 'clickCheckbox',
  },

  steps: ['basics', 'love', 'respect', 'expert', 'control', 'helping', 'fun'],

  clickCheckbox: function(event){
    const target = event.target;
    const $block = $(target).closest('.ios-styled-checkbox')
    target.checked ? $block.addClass('checked') : $block.removeClass('checked');
    App.budgetCategories.updateParam(target.name, target.checked);
  },

  clickCheckboxSpace: function(event){
    const $target = $(event.target);
    if (!$target.hasClass('ios-styled-checkbox')) { return true; }
    $target.find('label').trigger('click');
  },

  render: function(need){
    let steps = _.clone(this.steps);
    steps = steps.filter((need) => {
      return !_.isEmpty(this.model.getDataByNeed(need, App.budgetNeeds.isMet(need)))
    })
    let stepIndex = steps.indexOf(need)
    if (stepIndex < 0) { need = steps[stepIndex = 0] };
    this.onLastPage = stepIndex == (steps.length - 1);
    const prevStep = stepIndex == 0 ? 'budget_intro_2' : 'budget_walkthrough/' + steps[stepIndex-1]
    const nextStep = this.onLastPage ? 'budget_spend' : 'budget_walkthrough/' + steps[stepIndex+1]

    const captions = App.budgetNeeds.captions[need];
    const isMet = App.budgetNeeds.isMet(need);
    const categories = this.model.getDataByNeed(need, isMet);
    const data = { met: isMet, categories: categories };
    if (need == 'control'){
      data.monthlySavings = App.utils.toMoney(App.bigDecision.get('monthly_savings'));
    }

    let title = captions.prefix;
    if (!this.onLastPage) { title += '<i>'+captions.title+'</i>'}

    App.transitPage(this.mainTemplate({
      prevStep: prevStep,
      nextStep: nextStep,
      title: title,
      step: need,
      data: data
    }))

    //Yes/No + Met/Unmet function to the next screens (create budget) labels spend less/more:
    //‘Yes’ leads to Spend less (if need is MET) | Spend more (if need is UNMET) icons on the next screen
    //‘No’ = Protect

    this.setElement($(this.elementSelector))

    this.$el.find('[data-source=steps-progress]').html(App.simplePage.circleProgressTpl({
      stepIndex: stepIndex, stepsCount: steps.length
    }))
    tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});

    App.utils.setPageHeight(this.el);

    this.setChanges(data.categories);
  },

  setChanges(categoriesData){
    let categories = App.budgetCategories;
    _.each(categoriesData, (attrs, category) => {
      let name = `${category}_spend`;
      const $input = this.$el.find(`input[type=checkbox][name=${name}]`);
      $input[0].checked = attrs.spend_change;
      $input.trigger('change')
    })
  }

})