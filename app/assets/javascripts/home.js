//= require raven.min
//= require dom-to-image.min
//= require html2canvas
//= require rmodal
//= require zepto
//= require rails-ujs

//= require underscore-1.8.3
//= require backbone-1.3.3
//= require backbone-validation-0.11.5
//= require vanilla-masker-1.2.0
//= require d3/d3-array.js
//= require d3/d3-collection.js
//= require d3/d3-color
//= require d3/d3-interpolate
//= require d3/d3-scale.js
//= require d3/d3-time-format.js
//= require d3/d3-time.js
//= require d3/d3-dispatch
//= require d3/d3-axis
//= require d3/d3-dispatch
//= require d3/d3-ease
//= require d3/d3-format
//= require d3/d3-selection
//= require d3/d3-path
//= require d3/d3-shape
//= require d3/d3-timer
//= require d3/d3-transition
// Not used D3 libs: brush, chord, geo, dsv, hierarhy,
// quadtree, queue, random, request, voronoi, zoom
//= require tippy
//= require draggability
//= require file_saver

//= require root.js
//= require_tree ./templates
//= require_tree ./models
//= require_tree ./collections
//= require_tree ./views
//= require_tree ./routers


'use strict';

(function(){
  App.simplePage = new App.Views.SimplePage(); // determine basic events
  App.importPage = new App.Views.Import(); // import pseudo-page
  App.router = new App.Router();

  App.finances = new App.Models.Finances({});
  App.family = new App.Collections.Family();
  App.bigDecision = new App.Models.BigDecision();
  App.finAssumptions = new App.Models.FinanceAssumptions({synced: true});
  App.retirementFunding = new App.Models.RetirementFunding();
  App.budgetNeeds = new App.Models.BudgetNeeds();
  App.budgetCategories = new App.Models.BudgetCategories();
  App.budgetTracking = new App.Models.BudgetTracking();
  App.loans = new App.Models.Loans();
  App.investments = new App.Models.Investments();
  App.idea = new App.Models.Idea();


  $.ajaxSettings.headers = {
    'X-CSRF-Token': $('meta[name=csrf-token]').attr('content')
  };

  App.storage.checkAvailability();

  if (!App.initData()){
    App.family.restoreFromStorage();
  }

  Backbone.history.length = 0;
  Backbone.history.pastFragments = [];
  Backbone.history.on('route', function (opts, a) {
    ++this.length;
    Backbone.history.pastFragments.push(a);
  });

  Backbone.history.start({pushState: true});
  if (location.port != '3000'){
    Raven.config('https://a3fa0c40103f43d98f1dedfe962fa8e1@sentry.io/195972').install()
  }

  $.ajax({
    type: 'GET',
    url: '/additional_content',
    dataType: 'json',
    success: function(data){
      App.jokes = _.map(data.jokes, (x) => { return x.content; })
      App.encouragments = _.map(data.encouragments, (x) => { return x.content; })
      App.bubbles = {}
      _.each(data.bubbles, (x) => { App.bubbles[x.path] = x.content; })
      App.simplePage.delayShowJoke();
    }
  })

  let $menu = $('#menu-panel');
  let $startModulLink = $('.module-start', $menu)
  let $loginLink = $('.login-logout', $menu)
  let $helpLink = $('.help-link', $menu)
  let $privacyLink = $('.privacy-link', $menu)
  let $resetLink = $('.reset-link', $menu)
  let $ham = $('#hamburger').on('click', (event)=>{
    $ham.toggleClass('open');
    $menu.toggleClass('open');
    if ($menu.hasClass('open')){
      if (App.currentModule){
        let x = App.currentModule == 'future' ? 'RETIREMENT' : App.currentModule == 'budget' ? 'BUDGET' : 'SAVING'
        $startModulLink.removeClass('hidden').text(`Start over ${x}`).attr('href', `/${App.currentModule}_intro`);
      }else{
        $startModulLink.addClass('hidden');
      }
      $loginLink.text(App.authorized ? 'Logout' : 'Login');
    }
    $('body').one('click', (event)=>{
      if (!$(event.target).closest('#menu-panel').length &&
          !$(event.target).closest('#hamburger').length &&
          $menu.hasClass('open')
        ){
        console.log('wow')
        $ham.trigger('click')
      }
      return true;
    })
  })
  $loginLink.on('click', (event)=>{
    event.preventDefault();
    if (App.authorized){
      App.simplePage.clickLogoutLink();
    }else {
      App.simplePage.openLogin();
    }
    return false;
  })
  $helpLink.on('click', (event)=>{
    event.preventDefault();
    App.simplePage.gotoLink(event);
    $ham.trigger('click');
    return false;
  })
  $privacyLink.on('click', (event)=>{
    event.preventDefault();
    App.simplePage.openDesiModal({currentTarget: {dataset: {
      content: 'privacy',
      modalTitle: 'Privacy policy'
    }}});
    return false;
  })
  $resetLink.on('click', (event)=>{
    event.preventDefault();
    App.simplePage.openConfirmationDialog({
        content: "All data will be <b>destroyed</b>. Are you really want to do it?",
        btnTitle: 'YES', cancelTitle: 'NO'
    }, () => {
      $.ajax({
        url: '/reset', type: 'POST', dataType: 'json',
        success: (xhr, status) => {
          App.storage.logout();
        }
      })
    });

    return false;
  })

  let msg = localStorage.getItem('logoutText');
  if (msg){
    App.simplePage.openDesiModal(msg);
    localStorage.removeItem('logoutText');
  }

  var inactivityTime = function () {
    var t;
    window.onload = resetTimer;

    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onmousedown = resetTimer; // touchscreen presses
    document.ontouchstart = resetTimer;
    document.onclick = resetTimer;     // touchpad clicks
    document.onscroll = resetTimer;    // scrolling with arrow keys
    document.onkeypress = resetTimer;

    function logout() {
      App.simplePage.clickLogoutLink();
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(logout, 30*60*1000)
        // 1000 milisec = 1 sec
    }
  };
  if (App.authorized){
    inactivityTime();
  }
  window.onbeforeunload = function(){
    App.savePosition();
  }
  /*
  $.ajax({
    url: '/save_position', type: 'POST', dataType: 'json',
    data: {pos: location.pathname},
    success: (xhr, status) => {
      console.log('wow')
    }
  })
  */
})()

