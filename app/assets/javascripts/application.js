// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require highcharts
//= require chartkick
//= require numeral.min
//= require twitter/bootstrap
//= require autonumeric
//= require_tree .

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(document).ready(function (){
  $('#assumptions_form').on("keypress", function (e) {
      if (e.keyCode == 13) {
          return false;
      }
  });

  $('#update_home_value_field').keyup(function() {
    delay(function(){
      $('#update_home_value_btn').click();
    }, 1000 );
  });

  $('#budget_field').keyup(function() {
    delay(function(){
      $('#update_budget_btn').click();
    }, 1000 );
  });

    // tooltips for different devices
  	var toolOptions;
  	var isOS = /iPad|iPhone|iPod/.test(navigator.platform);
  	var isAndroid = /(android)/i.test(navigator.userAgent);

  	///////////////////////////////////////// if OS
  	if (isOS){
  		$('[data-toggle="tooltip"]').tooltip({trigger: 'click'});

  		// $('[data-toggle="tooltip"]').css( 'cursor', 'pointer' );
  		//  $('body').on("touchstart", function(e){
  		// 	$('[data-toggle="tooltip"]').each(function () {
  		// 		// hide any open tooltips when the anywhere else in the body is clicked
  		// 		if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.tooltip').has(e.target).length === 0) {
  		// 			$(this).tooltip('hide');
  		// 		}////end if
  		// 	});
  		// });
  	///////////////////////////////////////// if Android
  	} else if(isAndroid){
  		$('[data-toggle="tooltip"]').tooltip({trigger: 'click'});
  	///////////////////////////////////////// if another system
  	} else {

  		$('[data-toggle="tooltip"]').tooltip({trigger: 'click hover'});

  	}//end if system

  ////////////////////// CHARTS /////////////////////////////////////////////
  $('#affordability_analysis_chart').highcharts({
    chart: {
      type: 'line'
    },
    tooltip: {
      formatter: function() {
        return 'Max. Home Price:' + '<b> ' +
        numeral(this.y).format('$0,0') + '</b>' + '<br> Cut Expenses By:' +
        '<b> '+ numeral(this.x).format('$0,0') + '</b>';
      },
    },
    title: {
      text: 'Cutting Expenses Makes Higher Priced Homes Affordable'
    },
    xAxis: {
      title: {
        text: 'Cut Expenses By ($)'
      }
    },
    yAxis: {
      labels: {
        formatter: function () {
                    return numeral(this.value).format('0,0');
                }
      },
      title: {
        text: 'Max. Home Price ($)'
      }
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle'
        }
      }
    },
    series: [{
      name: 'Bank Estimate',
      data: gon.data_for_chart_bank,
      color: 'red'
    },{
      name: 'Decision Fish',
      data: gon.data_for_chart_fish,
      color: '#2E3192'
    }]
  });
  ////////////////////////////////////////////////////////////////////////////
  $('#savings_target_analysis_chart').highcharts({
    chart: {
      type: 'line'
    },
    tooltip: {
      formatter: function() {
        return 'Max. Home Price:' + '<b> ' +
        numeral(this.y).format('$0,0') + '</b>' + '<br> Savings Rate:' +
        ' <b>'+ this.x + '% </b>';
      },
    },
    title: {
      text: 'A Less Costly Home Allows Higher Savings Rate'
    },
    xAxis: {
      title: {
        text: 'Savings Rate (%)'
      }
    },
    yAxis: {
      labels: {
        formatter: function () {
                    return numeral(this.value).format('0,0');
                }
      },
      title: {
        text: 'Max. Home Price ($)'
      }
    },
    plotOptions: {
      series: {
        marker: {
          enabled: true,
          symbol: 'circle'
        }
      }
    },
    series: [{
      name: 'Bank',
      data: gon.data_for_bank_price,
      color: 'red',
      marker: {
        radius: 5
      }
    },{
      name: 'Home Price',
      data: gon.data_for_home_value,
      color: '#2E3192',
      marker: {
        enabled: false,
        symbol: 'circle'
      }
    }]
  });
  /////////////////////////////////////////////////////////////////////////////
  $('#value_of_waiting_chart').highcharts({
    chart: {
      type: 'line'
    },
    tooltip: {
      formatter: function() {
        return 'Max. Home Price:' + '<b> ' +
        numeral(this.y).format('$0,0') +
        '</b>' + '<br> Months:' + ' <b>'+ this.x + '</b>';
      },
    },
    title: {
      text: 'If You Wait to Buy, You Can Afford to Spend More'
    },
    xAxis: {
      title: {
        text: 'Months'
      }
    },
    yAxis: {
      labels: {
        formatter: function () {
                    return numeral(this.value).format('0,0');
                }
      },
      title: {
        text: 'Max. Home Price ($)'
      }
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          symbol: 'circle'
        }
      }
    },
    series: [{
      name: 'Bank',
      data: gon.data_for_banks_val_of_wait,
      color: 'red'
    },{
      name: 'Decision Fish',
      data: gon.data_for_decision_fish_val_of_wait,
      color: '#2E3192'
    }]
  });
  ////////////////////// END CHARTS /////////////////////////////////////////
});
