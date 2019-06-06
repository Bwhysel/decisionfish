App.Views.EfundReady = Backbone.View.extend({
  elementSelector: '#efund-ready-screen',
  tpl: JST['templates/savings/efund_ready'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetLoanDom);
  },

  events: {
    'keyup input': 'onKeyUp',
    'click #next-btn': 'onNextClick',
    'click #import-btn': 'onImportClick',
  },

  render: function(){
    App.transitPage(this.tpl({}))
    this.setElement($(this.elementSelector))

    App.utils.setPageHeight(this.el);
    this.progressText = this.$el.find('[role=efund-progress]')[0]
    this.congratsText = this.$el.find('[role=efund-congrats]')
    this.efundHintText = this.$el.find('[role=efund-good-job]')[0]
    this.hint1 = "Great job! Your emergency fund is full: You're ready for (almost) anything!";
    this.hint2 = "A good start! Let's keep building it.";
    this.hint3 = "Let's get started!";
    this.$svg = this.$el.find('svg');
    this.prepareDonut();

    this.resetInput();
  },

  onNextClick: function(event){
    const oldVal = App.finances.get('cash');
    const newVal = this.model.get('efund_current');
    if (newVal <= oldVal) return true;

    event.preventDefault();
    App.simplePage.openDesiYesNoModal(
      "You savings is more than cash/investments value entered in the first, RETIREMENT chapter. Please go back and check the retirement plan.",
      ()=>{ App.router.navigate('/finance_details/total', {trigger: true}) },
      ()=>{  },
      { cancelTitle: 'CANCEL', btnTitle: 'OK'}
    )
    return false;
  },

  resetInput: function(){
    this.months = this.model.get('efund_months');
    this.monthExp = App.retirementFunding.getMonthExp();
    this.targetMoney = this.model.getShortEfundTarget(0);
    this.$el.find('[role=target-months]').text(`${this.months} Month` + (this.months == 1 ? '' : 's'))

    const input = this.$el.find('input[name]')[0]
    input.value = this.model.getEfundCurrent();
    if (this.model.get('efund_current') === null){
      this.model.updateParam('efund_current', parseInt(input.value))
    }
    VMasker(input).maskMoney({precision: 0, delimiter: ',', unit: '$'});
    $(input).trigger('keyup', true);
  },

  onKeyUp: function(event, manual){
    const input = event.target;
    value = App.utils.parseMoney(input.value);
    let progress
    [ this.targetMoney, progress ] = this.model.getEfundProgress(value);

    let shortOfTarget = Math.max(0, this.targetMoney); // short version of getShortEfundTarget function

    this.efundHintText.textContent = (progress != 0) && (shortOfTarget == 0) ? this.hint1 : progress > 0 ? this.hint2 : this.hint3;
    this.drawDonut(progress);
    this.progressText.textContent = progress;
    this.congratsText.toggleClass('hidden', this.targetMoney>0)
    if (manual) return;

    this.model.updateParam('efund_current', value);
  },

  onImportClick: function(event){
    App.importPage.render('balances', event.currentTarget, (data)=>{
      console.log(data)
      if (data.cash){
        let currentSavings = data.cash + data.college_savings + data.retirement_savings;
        this.$('input[name]').val(currentSavings).trigger('keyup')
      }
    }, ()=>{
      this.render();
    })
  },

  prepareDonut: function(){
    const width = this.$svg.width();
    const height = width;
    const radius = width/2;
    const radScale = screen.width < 700 ? 0.85 : 0.75
    const svgEl = d3.select("svg").append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    this.tau = 2 * Math.PI;

    const arcBack = d3.arc().outerRadius(radius).innerRadius(radius*radScale).startAngle(0);
    svgEl.append("path").datum({endAngle: this.tau}).style("fill", "#0DB09D").attr("d", arcBack);

    this.arcProgress = d3.arc().outerRadius(radius).innerRadius(radius*radScale).startAngle(0);
    this.foreground = svgEl.append("path")
        .datum({endAngle: 0 * this.tau})
        .style("fill", '#2E3192')
        .attr("d", this.arcProgress);
  },

  drawDonut: function(progress){
    // http://bl.ocks.org/mbostock/5100636
    this.foreground.transition().duration(700)
      .attrTween("d", this.arcTween(progress / (this.months||1) * this.tau));
  },


  arcTween: function(newAngle) {
    return (d)=>{
      var interpolate = d3.interpolate(d.endAngle, newAngle);
      return (t)=> {
        d.endAngle = interpolate(t);
        return this.arcProgress(d);
      };
    };
  }

})