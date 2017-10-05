App.Views.SharkAttack = Backbone.View.extend({
  elementSelector: '#shark-attack-screen',
  tpl: JST['templates/savings/shark_attack'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInput);
  },

  render: function(){
    const [name1, name2] = App.family.getNames();
    App.transitPage(this.tpl({
      name1: name1,
      name2: name2
    }))
    this.setElement($(this.elementSelector))

    App.utils.setPageHeight(this.el);

    this.targetBar = this.$el.find('.efund-target-bar')[0];
    this.pxFactor = (this.$el.find('.efund-bar-inner').width() - this.targetBar.offsetWidth/2) / 12;
    // width: 720, targetWidth/2: 48
    // pxFactor: 56
    this.monthsText = this.$el.find('[role=target-months]')[0]
    this.efundText = this.$el.find('[role=efund-value]')[0]

    this.resetInput();
  },

  resetInput: function(){
    this.monthExpenses = App.retirementFunding.getMonthExp();
    this.setMonths(this.model.get('efund_months'), true);

    var draggie = new Draggabilly(
      '.efund-target-bar',
      {axis: 'x', containment: '.efund-bar'}
    );

    let newPoint = this.months;

    draggie.on( 'dragMove', (event, pointer, moveVector) => {
      newPoint = Math.round((this.targetBar.offsetLeft + moveVector.x) / this.pxFactor);
      if (newPoint < 0) { newPoint = 0; }
      else if (newPoint > 12){ newPoint = 12; }

      if (newPoint != this.months){
        this.months = newPoint
        this.setMonths(newPoint);
      }
    })

  },

  setMonths: function(months, manual){
    this.monthsText.textContent = `${months} Month` + (months == 1 ? '' : 's');
    this.months = months;
    this.efundText.textContent = App.utils.toMoney(Math.ceil(months * this.monthExpenses / 1000) * 1000);
    if (manual){
      let pos = this.months * this.pxFactor;
      if (this.months == 12) {
        // from zepto.js instead of $(this.targetBar).css('paddingRight')
        pos += parseInt(getComputedStyle(this.targetBar).getPropertyValue('padding-right')) / 2;
      }
      this.targetBar.style.left = `${pos}px`;
      return;
    }
    this.model.updateParam('efund_months', months);
  },

})