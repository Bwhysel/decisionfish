App.Views.DifferentDecisions = Backbone.View.extend({
  elementSelector: '#different-decisions-screen',
  mainTemplate: JST['templates/future/different_decisions/index'],
  quickNoteTpl: JST['templates/future/different_decisions/quick_note'],

  events: {
  },

  render: function(step){
    let steps = _.clone(this.steps);
    const childrenCount = App.family.childrenYears.length;
    if (childrenCount == 0){
      steps.splice(2,1) // remove college & parent_contribute steps
    }
    let stepIndex = steps.indexOf(step)
    if (stepIndex < 0) { step = steps[stepIndex = 0] };
    this.onLastPage = stepIndex == (steps.length - 1);

    const prevStep = stepIndex == 0 ? 'projected_net_worth' : 'different_decisions/' + steps[stepIndex-1]
    const nextStep = this.onLastPage ? 'future_assumptions/income' : 'different_decisions/' + steps[stepIndex+1]

    let tplOpts = {
      prevStep: prevStep,
      nextStep: nextStep,
      step: step,
      data: this.stepsData[step]
    };
    App.transitPage(step == 'quick_note' ? this.quickNoteTpl(tplOpts) : this.mainTemplate(tplOpts));

    this.setElement($(this.elementSelector))

    if (!App.differentDecisions || App.differentDecisions.changed){
      this.decisionOpts = App.bigDecision.decisionOpts();
      $.ajax({
        type: 'POST', dataType: 'json', url: '/different_decisions/solve',
        data: this.decisionOpts,
        success: (data) => {
          App.finAssumptions.setSynced();
          App.differentDecisions = data;
          this.drawChart(step, App.differentDecisions);
        },
        error: (xhr, errorStatus, error) => {
          console.log(error)
        }
      })
    }else{
      this.drawChart(step, App.differentDecisions)
    }
    App.utils.setPageHeight(this.el);
  },

  steps: [
    'monthly_savings', 'retire_age', 'college', 'quick_note'
  ],
  stepsData: {
    monthly_savings: {
      title: 'the amount you save',
      axisLabel: 'Monthly Savings',
    },
    retire_age: {
      title: 'your retirement age',
      axisLabel: 'Retirement Age',
    },
    college: {
      title: 'your contribution to college',
      axisLabel: 'College contribution',
    },
    quick_note: {
      axisLabel: 'Investment Returns'
    }
  },


  drawChart: function(step, differentData){
    let data = [];
    let yPoints = [];
    const realStepName = step == 'college' ? 'parent_contribute'
                        : step == 'quick_note' ? 'rt_avg' : step;
    _.each(differentData[realStepName], (age, key) => {
      yPoints.push(key);
      data.push({key: key, value: age})
    })
    const [name1, name2] = App.family.getNames();
    const [age1, age2] = differentData.expected_life_age;

    let successBorder = d3.max(differentData.expected_life_age);
    let selectedVal = this.decisionOpts[realStepName];
    if (selectedVal == undefined) { selectedVal = differentData.investment_returns }
    //console.log(selectedVal)
    if (step == 'college' || step == 'quick_note'){
      let temp = -1;
      _.clone(yPoints).sort().forEach((v) => {
        if (v <= selectedVal){
          temp = v;
        }
      })
      selectedVal = temp;
    }

    let exSvg = this.$el.find('svg');
    let externalWidth = exSvg.width();

    const forDesktop = screen.width > 700;
    var margin = {
      top: forDesktop ? 70 : 30,
      right: 20,
      bottom: forDesktop ? 120 : 100,
      left: forDesktop ? 120 : 100};

    let width = externalWidth - margin.left - margin.right;
    let height = (forDesktop ? 450 : 320) - margin.top - margin.bottom;

    let svg = d3.select("svg").attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let descOrder = step == 'monthly_savings'
    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range(descOrder ? [height, 0] : [0, height]);
    const xFn = (d)=>{ return Math.max(x(d.value), 0); }
    const yFn = (d)=>{ return y(d.key); }

    // scale the range of the data
    x.domain([70, 120]);
    //y.domain([0, d3.max(data, (d) => { return d.key; })]);
    y.domain([yPoints[0], yPoints[yPoints.length-1]])
    //y.domain(yPoints)

   // add the X Axis
    svg.append("g").attr("class", "axis").attr("transform", "translate(0," + (height+(forDesktop ? 45 : 20) ) + ")").call(
      d3.axisBottom(x).tickValues([70, 80, 90, 100, 110])
    );
    svg.append("g").attr("class", "grid").attr("transform", "translate(0," + height + ")").call(
      d3.axisBottom(x).tickValues([70]).tickSize(-height).tickFormat("")
    )

    // add the Y Axis
    svg.append("g").attr("class", "axis y-axis").call(
      d3.axisLeft(y).tickValues(yPoints).tickFormat((v) => {
        switch(step){
          case 'monthly_savings': return App.utils.toMoney(v);
          case 'retire_age': return v;
          case 'college': return v + '%';
          case 'quick_note': return Math.round(v*100,2) + '%';
        }
      })
    );
    svg.append("text").attr('class', 'axis-label')
      .attr('text-anchor', 'end')
      .attr('x', width-(forDesktop ? 50 : 0))
      .attr('y', height+margin.bottom*2/3)
      .text(`${age2 ? name1 + "'s" : 'Your'} Age When Money Runs Out`);
    svg.append("text").attr('class', 'axis-label')
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (-margin.left*2/3) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text(this.stepsData[step].axisLabel);


    var bars = svg.selectAll(".bar").data(data).enter().append("g")

    //append rects
    let barShift = forDesktop ? -8 : -6
    bars.append("rect").attr("class", (d) => {
        return 'bar ' + (d.value >= successBorder ? 'bar-success' : 'bar-fail');
      })
      .attr("y", (d) => { return yFn(d) + barShift } ).attr("x", 0).attr("width", 0)//.attr('height', '30');

    d3.select("svg").selectAll("rect").transition().duration(700).attr("width", xFn)

    let ticks = d3.selectAll(".y-axis .tick text");
    ticks.attr("class", function(d,i){
      return d == selectedVal ? "selected" : "";
    });

    //LIFE EXPECTANCY lines and text
    const anchor1 = !age2 || (age1 > age2) ? 'start' : 'end';
    const anchor1_start = anchor1 == 'start'

    const
      offset = forDesktop ? 40 : 20,
      x_offset = forDesktop ? 10 : 4;
    const xAge1 = x(age1);
    svg.append("line").attr('class', 'life-gray')// attach a line
      .attr("x1", xAge1).attr("x2", xAge1)
      .attr("y1", -offset).attr("y2", height+offset);


    svg.append("text").attr('class', 'life-gray')
      .attr('text-anchor', anchor1)
      .attr('y', -offset).attr('x', xAge1 + (anchor1 == 'start' ? x_offset : -x_offset))
      .text(age2 ? `${name1}'s Life Expectancy` : 'Life Expectancy')

    if (age2){
      const xAge2 = x(age2)
      svg.append("line").attr('class', 'life-blue')// attach a line
        .attr("x1", xAge2).attr("x2", xAge2)
        .attr("y1", -offset).attr("y2", height+offset);

      const anchor2 = anchor1_start ? 'end' : 'start'
      svg.append("text").attr('class', 'life-blue')
        .attr('text-anchor', anchor2)
        .attr('y', -offset).attr('x', xAge2 + (anchor2 == 'start' ? x_offset : -x_offset))
        .text(`${name2}'s Life Expectancy`)
    }

  }

})