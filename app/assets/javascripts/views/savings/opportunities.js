App.Views.Opportunities = Backbone.View.extend({
  elementSelector: '#opportunities-screen',
  tpl: JST['templates/savings/opportunities'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.calcOpps);
  },

  render: function(){
    App.transitPage(this.tpl({
      want_efund: this.model.getShortEfundTarget() > 0
    }))
    this.setElement($(this.elementSelector))

    App.utils.setPageHeight(this.el);

    this.drawBars();
  },

  drawBars: function(){
    const opps = this.model.calcOpportunities(true);
    let categories= [];
    let dollars = [];
    opps.forEach((opp)=>{
      categories.push(opp.title);
      dollars.push(opp.earningsPer100);
    })


    let exSvg = this.$el.find('svg');
    let externalWidth = exSvg.width();

    const forDesktop = externalWidth < 700;
    var margin = {top: parseInt(exSvg.css('margin-top')), right: 0, bottom: 0, left: forDesktop ? 150 : 340};
    let width = externalWidth - margin.left - margin.right;
    let height = categories.length * (forDesktop ? 25 : 55) //exSvg.height() - margin.top - margin.bottom - 100;

    let svg = d3.select("svg").attr("width", width + margin.left + margin.right)
                .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
                console.log()
    exSvg.css('height', height + 2.2 * (margin.top + margin.bottom))


    // set the ranges
    var x = d3.scaleLinear().domain([0, Math.max(...dollars)]).range([0, width]);
    var y = d3.scalePoint().domain(categories).range([0, height]);
    const xFn = (d)=>{ return x(d); }
    const yFn = (i)=>{ return y(categories[i]); }

    // add Verticalline
    svg.append("g").attr("class", "grid").attr("transform", `translate(0,${height})`).call(
      d3.axisBottom(x).tickValues([0]).tickSize(-height).tickFormat("")
    )
    // add the Y Axis
    svg.append("g").attr("class", "axis y-axis").call(
      d3.axisLeft(y)//.tickValues(categories)//.tickFormat((d,i) => { return categories[i]; })
    );

    var bars = svg.append('g').attr('id', 'dollar-bars').selectAll(".bar").data(dollars).enter().append("g")

    const txtOffset = forDesktop ? 5 : 10;
    //append rects
    let barShift = forDesktop ? -8 : -19;
    let textBarShift = forDesktop ? 7 : 15;
    bars.append("rect").attr("class", 'bar')
      .attr("y", (d,i) => {return yFn(i)+barShift;}).attr("x", 0).attr("width", 0);//.attr('height', '30')
    bars.append('text').attr("x", txtOffset).attr("y", (d,i)=>{ return yFn(i)+textBarShift; }).text('');

    const delay = 700
    d3.select("svg").selectAll("rect").transition().duration(delay).attr("width", xFn)

    setTimeout(function(){
      bars.selectAll('text').text((d)=>{ return App.utils.toMoneyWithCents(d); });
      exSvg.find('#dollar-bars text').forEach((input)=>{
        const $text = $(input);
        const rectWidth = $text.siblings().width();
        if ($text.width()+txtOffset > rectWidth){
          $text.addClass('inversed').attr('x', txtOffset/2 + rectWidth);
        }
      })
    }, delay)

  },

})