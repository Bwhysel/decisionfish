App.Views.SavingsMonthPlan = Backbone.View.extend({
  elementSelector: '#savings-plan-month-screen',

  template: JST['templates/savings/plan_month'],
  fieldsTpl: JST['templates/savings/plan/month_fields'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInputs)
  },

  events: {
    'focusin input': 'selectInput',
    'keyup input': 'keyUpInput',
    'click #import-btn': 'onImportClick'
  },

  render: function(){
    App.transitPage(this.template());
    this.setElement($(this.elementSelector));
    this.totalInput = this.$el.find('[role=total-amount]')[0];
    this.resetInputs();
  },

  resetInputs: function(){
    this.model.calcOpportunities(true);

    this.fields = {};
    this.newCharges = _.clone(this.model.get('new_charges'));
    const yourAmounts = this.model.get('your_amounts');

    this.model.opportunities.forEach((opp, i)=>{
      if (!opp.isDebt || !opp.balance) { return }
      this.fields[opp.field] = {
        title: opp.title, value: this.newCharges[opp.field],
        allocMinPmnt: opp.allocMinPmnt, yourAmount: yourAmounts[opp.field]
      };

    })
    this.$el.find('[role=plan-fields]').html(this.fieldsTpl({fields: this.fields}))

    this.$el.find('input[type=text]').forEach((input) => {
      VMasker(input).maskMoney({precision: 0, delimiter: ',', unit: '$'});
      input.value = this.fields[input.name].value;
      if (input.value>=0) {
        $(input).trigger('keyup', true); // to apply mask for input
      }
    })

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
    let v = App.utils.parseMoney(target.value);
    $(target).closest('.form-group').find('.static-number').text(App.utils.toMoneyWithCents(this.monthValue(target.name, v)))

    if (manual){ return };

    target.value = App.utils.toMoney(v);

    this.newCharges[target.name] = v;
    this.model.updateParam('new_charges', this.newCharges[target.name], target.name)
    this.updatePanelTotal();
  },

  monthValue: function(param, newCharge){
    let attrs = this.fields[param];
    if (!attrs){ return 0; }
    let debtToBeRepaid = attrs.yourAmount;
    if (param == 'mortgage'){
      debtToBeRepaid += App.retirementFunding.get('mortgage_payment') - attrs.allocMinPmnt;
    }
    return parseFloat((newCharge + attrs.allocMinPmnt + debtToBeRepaid).toFixed(2));
  },

  updatePanelTotal: function() {
    let total = 0;
    _.each(this.newCharges, (value, field)=>{
      total += this.monthValue(field, value);
    })
    total = parseFloat(total.toFixed(2));
    this.totalInput.textContent = App.utils.toMoneyWithCents(total);
  },

  onImportClick: function(event){
    App.importPage.render('credit_charges', event.currentTarget, (data)=>{
      $.each(this.fields, (name, opts) => {
        let v = data[opts.title];
        if (v !== undefined){
          this.model.updateParam('new_charges', v, name)
        }
      })
    }, ()=>{
      this.render();
    })
  }

})