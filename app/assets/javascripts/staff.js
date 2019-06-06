//= require raven.min
//= require html2canvas
//= require rmodal
//= require zepto
//= require rails-ujs
//= require underscore-1.8.3

'use strict';

(function(){
  if (location.port != '3000'){
    Raven.config('https://a3fa0c40103f43d98f1dedfe962fa8e1@sentry.io/195972').install()
  }

  $('table.table-with-entity tr').click((event) => {
    const url = event.target.href;
    if (url){
      return true;
    }
    $(event.currentTarget).find('[role=edit-link]').trigger('click');
  })

})()