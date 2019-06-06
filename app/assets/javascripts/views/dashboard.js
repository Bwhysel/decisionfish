App.Views.Dashboard = Backbone.View.extend({
  elSelector: '#page-content > .container',
  template: JST['templates/dashboard/index'],

  initialize: function(options){
    this.calendarView = new App.Views.Reminder()
  },

  events: {
    'click #import-btn': 'onImportClick',
  },

  render: function(without_data = false){
    const today = new Date()
    const year = today.getFullYear()
    const day = today.getDate()
    const month = today.toLocaleDateString('en-US', {month: 'long'})

    const daysCount = new Date(year, today.getMonth(), 0).getDate()

    this.efund_months_target = App.investments.get('efund_months')

    App.transitPage(this.template({
      month: month,
      day: day,
      year: year,
      efund_target: this.efund_months_target.toFixed(1)
    }));

    this.setElement($(this.elSelector));

    $(".date-stick").css('left', ''+Math.round(100*(day-1)/daysCount)+'%')

    this.$donutSvg = this.$el.find('svg.donut-chart');
    this.prepareDonut();

    this.calendarView.render()

    if (!without_data){
      //this.drawDonut(App.investments.get('efund_current'))
      this.drawDonut(0)


      this.$('.loading-indicator').removeClass('hidden')

      $.ajax({
        type: 'GET', dataType: 'json', url: '/import/dashboard_data',
        success: (data)=>{
          if (this.$el.parent().length){
            this.applyValues(data)
          }
        },
        complete: ()=>{
          this.$('.loading-indicator').remove()
        }
      })
    }

    App.utils.setPageHeight(this.el);
  },

  applyValues: function(data){
    if (data && data.hasOwnProperty('income')){
      this.drawBars(data)
      // Donut chart
      this.drawDonut(data.cash)

      this.drawNetWorth(data.net_worth)

      const needs = data.needs;
      ['basics', 'love', 'respect', 'expert', 'helping', 'fun', 'control'].forEach(x => {
        let need = needs[x]
        let planned = need.planned
        if (planned > 0){
          let current = need.current
          let progress = Math.min(current * 100 / planned, 150)
          const pEl = $(`.square[data-need=${x}] .square-progress`)
          const pElSquare = pEl.closest('.square')
          const hint = `${pElSquare.find('.menu-text').text().trim()}:<br>${App.utils.toMoneyWithCents(current)} of ${App.utils.toMoneyWithCents(planned)}`
          pElSquare.attr('title', hint).toggleClass('square-disabled', need.met != true)
          pEl.css('height', `${progress}%`).attr('title', hint)
        }
      })

      tippy('.square, .square-progress', {arrow: true, interactive: true, theme: 'light'});


      // TODO: draw donut of efund

      // TODO: draw budget cards

      // TODO: draw net worth chart
    }
  },

  drawBars: function(data){
    const plannedIncome = App.retirementFunding.get('at_income_r')
    const plannedSaving = App.bigDecision.get('monthly_savings')
    const plannedExpenses = plannedIncome - plannedSaving
    const currentSaving = data.income - data.expenses

    const incomePercent = Math.round(data.income * 100 / plannedIncome)
    const expensePercent = Math.round(data.expenses * 100 / plannedExpenses)
    const savingsPercent = Math.round(currentSaving * 100 / plannedSaving)

    let maxPercent = Math.max(incomePercent, expensePercent, savingsPercent, 100)
    let minPercent = Math.min(savingsPercent, 0)

    let percentRage = (maxPercent - minPercent) // 100%
    let koef = percentRage / 100
    let zeroPercent = Math.abs(minPercent)
    let zeroPercentScaled = zeroPercent / koef
    let stoPercentScaled = (zeroPercent + 100) / koef
    let bar100ScaledWidth = stoPercentScaled - zeroPercentScaled

    const incomeBar = this.$('.income-progress')
    const expensesBar = this.$('.expenses-progress')
    const savingsBar = this.$('.saving-progress')

    if (currentSaving < 0){
      savingsBar.css({'background-color': 'red', 'right': '100%'})
      this.$('.x-axis-legend-0').removeClass('hidden')
      savingsBar.parent().css('background-color', 'transparent')
    }
    incomeBar.parent().css({'width': `${bar100ScaledWidth}%`, 'margin-left': `${zeroPercentScaled}%`})
    expensesBar.parent().css({'width': `${bar100ScaledWidth}%`, 'margin-left': `${zeroPercentScaled}%`})
    savingsBar.parent().css({'width': `${bar100ScaledWidth}%`, 'margin-left': `${zeroPercentScaled}%`})
    setTimeout(()=>{
      incomeBar.css('width', `${incomePercent}%`)
      expensesBar.css('width', `${expensePercent}%`)
      savingsBar.css('width', `${Math.abs(savingsPercent)}%`)
    },100)
  },

  prepareDonut: function(){
    let width = this.$donutSvg.width();
    let height = width;
    let radius = width/2-5;

    this.tau = 2 * Math.PI;

    this.donutSvgEl = d3.select("svg.donut-chart").append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    this.arc = d3.arc().outerRadius(radius).innerRadius(radius*0.75).startAngle(0);
    this.arcBack = d3.arc().outerRadius(radius).innerRadius(radius*0.751).startAngle(0);
    //const arcWhiteBack = d3.arc().outerRadius(radius+5).innerRadius(radius*0.7).startAngle(0);

    // background arc
    //this.donutSvgEl.append("path").datum({endAngle: this.tau}).style("fill", "#FFF").attr("d", arcWhiteBack);
    this.donutSvgEl.append("path")
                   .attr("class", "white-bordered")
                   .datum({endAngle: this.tau})
                   .style("fill", "#0DB09D")
                   .attr("d", this.arcBack);
    this.foreground = this.donutSvgEl.append("path")
        .datum({endAngle: 0 * this.tau})
        .style("fill", '#2E3192')
        .attr("class", "white-bordered")
        .attr("d", this.arc);
  },

  drawDonut: function(cashValue){
    let [_,progress] = App.investments.getEfundProgress(cashValue);

    this.$('.donut-area [role=efund-progress]').text(progress)

    // http://bl.ocks.org/mbostock/5100636
    this.foreground.transition().duration(700)
      .attrTween("d", this.arcTween(progress / (this.months||1) * this.tau));
  },

  arcTween: function(newAngle) {
    return (d)=>{
      var interpolate = d3.interpolate(d.endAngle, newAngle);
      return (t)=> {
        d.endAngle = interpolate(t);
        return this.arc(d);
      };
    };
  },

  drawNetWorth: function(rawData){
    let i = 0;
    let data = [];
    // Example: [["2018-05-07", "1309.67"], ["2018-05-08", "863.25"], ["2018-05-15", "1000.0"]]
    let lastDay;
    let tickValues = [];
    _.each(rawData, (v) => {
      lastDay = new Date(v[0])
      tickValues.push(v[0])
      data.push({date: lastDay, value: parseFloat(v[1])})
    })

    let exSvg = this.$el.find('svg.net-chart');

    if (data.length < 2) {
      $("<p class='text-warning'>Please tap the IMPORT button below to connect your banks so I can draw this chart.</p>").insertAfter(exSvg);
      exSvg.addClass('hidden')
      return;
    }

    let firstDay = data[0].date

    let externalWidth = exSvg.width();
    const forDesktop = screen.width > 700;

    var margin = {
      top: forDesktop ? 30 : 10,
      right: forDesktop ? 30 : 10,
      bottom: forDesktop ? 40 : 20,
      left: forDesktop ? 100 : 70
    };

    width = externalWidth - margin.left - margin.right;
    height = (forDesktop ? 300 : 170) - margin.top - margin.bottom;
    let svg = d3.select("svg.net-chart").attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    const xFn = (d)=>{ return x(d.date); }
    const yFn = (d)=>{ return y(d.value); }

    const curve = d3.curveLinear;
    const valueline = d3.line().curve(curve).x(xFn).y(yFn);

    // scale the range of the data
    //x.domain(d3.extent(data, (d) => { return d.year; }));
    x.domain([firstDay, lastDay]);
    let minV, maxV;
    [minV, maxV] = [d3.min(data, (d) => { return d.value; }), d3.max(data, (d) => { return d.value; })]
    y.domain([minV, maxV]);
    // add the X Axis
    svg.append("g").attr("class", "axis").attr("transform", "translate(0," + (height+(forDesktop ? 15 : 0) ) + ")").call(
      d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%m/%d'))
    );
    // add the Y Axis
    svg.append("g").attr("class", "axis").call(
      d3.axisLeft(y).ticks(5).tickFormat((v) => { return App.utils.toMoney(v); } )
    );

    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))

    // add the valueline
    svg.append("path").data([data]).attr("class", "line dashboard").attr("d", valueline);
  },

  onImportClick: function(event){
    let savedData = null
    App.importPage.render('dashboard', event.currentTarget, (data)=>{
      savedData = data
    }, ()=>{
      this.render(savedData != null);
      if (savedData) { this.applyValues(savedData) }
    })
  },

})