App.Views.SavingsPlan = Backbone.View.extend({
  elementSelector: '#savings-plan-screen',

  template: JST['templates/savings/plan'],
  fieldsTpl: JST['templates/savings/plan/fields'],
  increment: 25,

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInputs)

  },

  events: {
    'focusin input': 'selectInput',
    'keyup input': 'keyUpInput',
    'click [role=fun-need-select]': 'selectFunNeed',
    'click [role=increase]': 'onIncreaseParam',
    'click [role=decrease]': 'onDecreaseParam',
    'click #next-btn': 'onNextClick'
  },

  render: function(){
    App.transitPage(this.template());
    this.setElement($(this.elementSelector));
    this.$panel = this.$el.find('.panel');
    this.safeState = this.$el.find('[role=safe-state]');
    this.unsafeState = this.$el.find('[role=unsafe-state]');
    this.nextBtn = this.$el.find('#next-btn')[0];
    this.$bar = this.$el.find('.earnings-bar');
    //this.nextBtn.disabled = true;

    //tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});

    this.resetInputs();
  },

  onNextClick: function(event){
    //=IF(N300<>0,"IF(N300>0," (Invest "&TEXT(N300,"$#,###")&" more)."," (You've invested "&TEXT(-N300,"$#,###")&" too much!)"),"")
    let targetInvested = App.bigDecision.get('monthly_savings');
    let diff = targetInvested - this.totalInvested;
    if (diff != 0){
      let content = `Please change your amounts so that the total is ${App.utils.toMoney(targetInvested)}.`;
      content += diff > 0 ? ` Invest ${App.utils.toMoney(diff)} more.` : `You've invested ${App.utils.toMoney(-diff)} too much!`;
      App.simplePage.openDesiModal(content)
      event.stopPropagation()
      return false
    }
  },

  resetInputs: function(){
    this.model.calcOpportunities(true);

    this.fields = {};
    this.yourAmounts = _.clone(this.model.get('your_amounts'));
    this.totalSuggestedEarnings = 0
    this.model.opportunities.forEach((opp, i)=>{
      let earnings = opp.earningsPer100 / 100.0;
      this.fields[opp.field] = {
        rankID: i, title: opp.title,
        suggested: opp.investment, custom: this.yourAmounts[opp.field],
        earnings: earnings
      };
      this.totalSuggestedEarnings += opp.investment * earnings
    })
    this.totalSuggestedEarnings = parseFloat(this.totalSuggestedEarnings.toFixed(2))
    //this.checkValues();
    this.$el.find('[role=plan-fields]').html(this.fieldsTpl({fields: this.fields}))

    this.$el.find('input[type=text]').forEach((input) => {
      VMasker(input).maskMoney({precision: 0, delimiter: ',', unit: '$'});
      input.value = this.fields[input.name].custom;
      if (input.value) {
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
    if (manual){ return };

    let val = App.utils.parseMoney(target.value);
    this.yourAmounts[target.name] = val;
    target.value = App.utils.toMoney(val);

    this.model.updateParam('your_amounts', this.yourAmounts[target.name], target.name)
    this.updatePanelTotal();
  },

  updatePanelTotal: function() {
    let total = 0, totalEarn = 0;
    const totalInput = this.$panel.find('[role=total-amount]');

    _.each(this.fields, (attrs, field)=>{
      total += this.yourAmounts[field]
      totalEarn += this.yourAmounts[field] * attrs.earnings;
    })
    totalEarn = parseFloat(totalEarn.toFixed(2));
    totalInput.text(App.utils.toMoney(total));
    this.totalInvested = total;
    const needEarn = parseFloat(Math.max(0, this.totalSuggestedEarnings - totalEarn).toFixed(2));
    this.$el.find('[role=earnings]').text(App.utils.toMoneyWithCents(totalEarn));
    this.$el.find('[role=earnings-more]').text(App.utils.toMoneyWithCents(needEarn));
    let leftPercent = totalEarn / (totalEarn+needEarn) * 100;
    let rightPercent = 100 - leftPercent;
    if (leftPercent > 0 && leftPercent < rightPercent && leftPercent < 20){
      leftPercent = 20; rightPercent = 80;
    }
    if (rightPercent > 0 && leftPercent > rightPercent && rightPercent < 20){
      leftPercent = 80; rightPercent = 20;
    }
    this.$bar.find('.earnings-bar-made').css('width', `${leftPercent}%`)
    let moreBar = this.$bar.find('.earnings-bar-more').css('width', `${rightPercent}%`)
    if (rightPercent == 0){ moreBar.text('') }

    if (needEarn > 0){
      this.unsafeState.removeClass('hidden');
      this.safeState.addClass('hidden');
    }else{
      this.safeState.removeClass('hidden');
      this.unsafeState.addClass('hidden');
    }
  },

  onIncreaseParam: function(event){ this.onChangeParam(event, 1) },
  onDecreaseParam: function(event){ this.onChangeParam(event, -1) },
  onChangeParam: function(event, direction){
    const $input = $(event.currentTarget).closest('.form-group').find('input');
    let v = App.utils.parseMoney($input.val()) + direction * this.increment;
    v = Math.max(0, v);

    $input.val(v).trigger('keyup');
  },

})