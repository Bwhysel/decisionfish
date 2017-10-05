App.Views.ProjectedNetWorth = Backbone.View.extend({
  elementSelector: '#projected-net-worth-screen',
  tpl: JST['templates/future/projected_net_worth'],

  events: {
    'click #next-btn': 'onNextClick',
  },

  onNextClick: function(event){
    if (this.forceNext){
      this.forceNext = false;
      return true;
    }
    event.preventDefault()
    this.firstModal = App.simplePage.openDesiYesNoModal(
      "Guess what? You're basically done! As a bonus for our expert fishes, we've prepared some cool charts to see and options to tweak. Click 'Yes' to dive deeper or 'No' to jump to the end.",
      ()=>{ App.router.navigate('/future_congratulations', {trigger: true}) },
      ()=>{ this.forceNext = true; $(event.target).trigger('click'); }
    );
    return false;
  },

  render: function(step){
    App.transitPage(this.tpl({}))
    this.setElement($(this.elementSelector))

    this.drawArea(App.retirementFunding.get('net_worth_chart'))

    App.utils.setPageHeight(this.el);
  },

  drawArea: function(rawData){
    let i = 0;
    let data = [];
    _.each(rawData, (value, key) => {
      data.push({year: parseInt(key), value: value})
    })

    let non_zero_found = false;
    let compacted_data = _.filter(data, (d)=>{
      let res = d.value > 0 || !non_zero_found;
      non_zero_found = d.value == 0;
      //return res;
      return d.value > 0;
    });

    let maxYear = data[data.length-1].year;
    let p1 = App.retirementFunding.get('college_starts');
    let p2 = App.bigDecision.get('retire_age');
    let p3 = App.retirementFunding.get('soc_sec_starts');
    let p4 = Math.min(App.retirementFunding.get('money_runs_out_age'), maxYear);

    let points = [];
    if (p1 && rawData[p1]) points.push({year: p1, value: rawData[p1], title: 'College Starts'});
    if (rawData[p2]) points.push({year: p2, value: rawData[p2], title: 'Retirement Starts'});
    if (rawData[p3]) points.push({year: p3, value: rawData[p3], title: 'Social Security Starts'});
    if (rawData[p4] >= 0) points.push({year: p4, value: rawData[p4], title: 'Money Lasts This Long'});

    let firstYear = data[0].year
    const deathAge = App.retirementFunding.get('last_retirement_age');
    const endYear = Math.max(deathAge, p4);

    let exSvg = this.$el.find('svg');
    let externalWidth = exSvg.width();
    const forDesktop = externalWidth < 700;

    var margin = {top: 30, right: 0,
      bottom: forDesktop ? 70 : 150,
      left: forDesktop ? 100 : 200};

    width = externalWidth - margin.left - margin.right;
    height = (forDesktop ? 400 : 800) - margin.top - margin.bottom;
    let svg = d3.select("svg").attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    const xFn = (d)=>{ return x(d.year); }
    const yFn = (d)=>{ return y(d.value); }

    const curve = d3.curveCardinal;
    const area = d3.area().curve(curve).x(xFn).y0(height).y1(yFn);
    const valueline = d3.line().curve(curve).x(xFn).y(yFn);

    // scale the range of the data
    //x.domain(d3.extent(data, (d) => { return d.year; }));
    x.domain([firstYear, endYear+10]);
    y.domain([0, d3.max(data, (d) => { return d.value; })]);

    // add the area
    svg.append("path").data([data]).attr("class", "area").attr("d", area);

    // add the X Axis
    svg.append("g").attr("class", "axis").attr("transform", "translate(0," + (height+15 ) + ")").call(
      d3.axisBottom(x).tickValues(d3.range(data[0].year, Math.max(deathAge, endYear), 10))
    );

    // add the Y Axis
    svg.append("g").attr("class", "axis").call(
      d3.axisLeft(y).ticks(6).tickFormat(function (v) {
        return App.utils.toMoney(v);
      })
    );
    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(""))

    // add the valueline
    svg.append("path").data([compacted_data]).attr("class", "line").attr("d", valueline);

    const [name1, name2] = App.family.getNames();
    let xAxisLabel = svg.append("text").attr('class', 'axis-label')
            .text(`${name2 ? name1 + "'s" : 'Your'} Age`);
    let $label = this.$el.find('.axis-label')
    xAxisLabel.attr("transform", "translate("+(width-$label.width())+","+(height+$label.height()*2.5)+")")  // centre below axis

    if (points.length > 0){
      let pointTitles = {}
      points.forEach((point) => {
        let y = point.year;
        if (pointTitles[y]){
          pointTitles[y].push(point.title)
        }else{
          pointTitles[y] = [ point.title ]
        }
      })

      const fnMakeCircleGroups = (rad1, rad2) => {
        let g = svg.selectAll("dot").data(points).enter().append("g")
                  .attr('class', 'circle-group')
                  .attr('title', (d) => {
                    let year = d.year;
                    let hint = pointTitles[year].join(',<br>');
                    let value = d.value;
                    if ((year == maxYear) && (value > 0)){ year = ''+year+'+'; }
                    value = App.utils.toMoney(value);
                    return `${hint}<br/><span class="acent">Age: ${year}<br/>Net worth: ${value}</span>`;
                  })
        g.append('circle').attr('class', 'outer-circle')
          .attr('cx', (d) => {return xFn(d) - (d.year == maxYear ? 17 : 0); })
          .attr('cy', yFn).attr('r', rad1);
        g.append('circle').attr('class', 'inner-circle')
          .attr('cx', (d) => {return xFn(d) - (d.year == maxYear ? 17 : 0); })
          .attr('cy', yFn).attr('r', rad2);
      }
      fnMakeCircleGroups(forDesktop ? "10" : "25", forDesktop ? "5" : "12")
      tippy('.circle-group', {arrow: true, position: 'top'})
    }


    let flag = this.$el.find('[role=finish-life]')
    const panel = flag.closest('.panel');
    flag.css('left', x(deathAge)+margin.left+parseInt(panel.css('padding-left')))
        .css('top', y(0) - flag.height() + margin.top + parseInt(panel.css('padding-top')))
    let value = App.utils.toMoney(rawData[deathAge]);
    flag.attr('title', `Your money must last at least until<br><span class='acent'>Age: ${deathAge}<br/>Net worth: ${value}</span>`)
    tippy('[role=finish-life]', {arrow: true, position: 'left'})
  }

})