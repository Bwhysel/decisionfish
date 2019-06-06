window.App = {
 Models: {},
 Collections: {},
 Views: {},
 Router: {},
 screens: {}
};

App.utils = {
  createModal: function(modalId, opts, tpl, tpl_opts){
    modalId = '#' + modalId
    if ($(modalId).length) return;

    $('body').append(tpl(tpl_opts))
    modal_dom = $(modalId);

    if (!opts) opts = {};
    let fnAfterClose = opts.afterClose;
    opts.afterClose = function(){
      modal_dom.remove()
      if (fnAfterClose) fnAfterClose()
    }
    opts.closeTimeout = 0;

    const modal = new RModal(modal_dom[0], opts);
    modal.open();

    // click on close btn
    $("[role=close-modal]", modal_dom).on('click', function(){
      modal.close();
    })
    // click on overlay
    modal_dom[0].addEventListener('click', function(event) {
      if ((event.toElement || event.target).id == modalId){
        modal.close();
      }
    });
    return modal;
  },

  toMoney: function(value, unit){
    if (!unit) unit = '$';
    unit = (value < 0 ? '-' : '') + unit;
    if (!value && value != 0){ value = 0 }
    return VMasker.toMoney(value, {precision: 0, delimiter: ',', unit: unit});
  },
  toMoneyWithCents: function(value, unit){
    const valueS = value.toFixed(2);
    if (/0$/.test(valueS)){
      value *= 100;
      value = Math.round(value);
    }
    return VMasker.toMoney(value, {precision: 2, separator: '.', delimiter: ',', unit: '$'});
  },
  parseMoney: function(value){
    value = value.replace(/\$|\,/g, '');
    return value.length ? parseInt(value) || 0 : 0;
  },
  parsePercent: function(value){
    value = value.replace(/\s|\%/g, '');
    return value.length ? parseFloat(value) || 0 : 0;
  },

  getPageHeight: function(){
    const body = document.body, html = document.documentElement;
    return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )
  },

  //helloScreen.querySelector('.wrapper').style.minHeight = ''+(pageHeight() - 160)+'px';
  setPageHeight: function(element){
    const cont = $('.wrapper-container', element)[0]
    if (cont){
      let maxPossibleSpace = this.getPageHeight() - cont.offsetTop;
      let currentHeight = cont.offsetHeight;
      let diff = maxPossibleSpace - currentHeight;
      if (diff > (currentHeight/4))
        cont.style.minHeight = ''+(currentHeight * 4.5/4) + 'px';
    }
  },

  smoothScroll: (el, to, duration) => {
    if (duration < 0) {
        return;
    }
    var difference = to - $(window).scrollTop();
    var perTick = difference / duration * 10;
    this.scrollToTimerCache = setTimeout(()=> {
        if (!isNaN(parseInt(perTick, 10))) {
            window.scrollTo(0, $(window).scrollTop() + perTick);
            App.utils.smoothScroll(el, to, duration - 10);
        }
    }, 10);
  },

  startTimer: function(duration, element, onClose) {
    var timer = duration, minutes, seconds;
    let repeater = setInterval(function () {
      minutes = parseInt(timer / 60);
      seconds = timer % 60;
      element.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      if (--timer < 0) {
        clearInterval(repeater);
        if (onClose) onClose();
      }
    }, 1000);
  },

  timeouts: {},

  timeout: function(callee, fn, delay, timerId){
    let t = this.timeouts[timerId]
    if (t) {
      clearTimeout(t.timer);
      if (t.xhr){ t.xhr.abort(); }
      this.timeouts[timerId] = null;
    }
    this.timeouts[timerId] = {}
    this.timeouts[timerId].timer = setTimeout(()=>{
      this.timeouts[timerId].xhr = fn.bind(callee)();
    }, delay);
  },

}

App.fakeStorage = {}
App.storage = {
  available: false,

  checkAvailability: function(){
    const mod = 'checkLocalStorage';
    let x;
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      x = true;
    } catch (e) {
      x = false;
    }
    //this.available = x;
    this.localStorageEnabled = x;
    return x;
  },

  setItem: function(key, value){
    if (this.available){
      localStorage.setItem(key, value)
    }else {
      App.fakeStorage[key] = value
      return false;
    }
  },

  getItem: function(key){
    return this.available ? localStorage.getItem(key) : App.fakeStorage[key];
  },

  getPersistentItem: function(key){
    return this.localStorageEnabled ? localStorage.getItem(key) : App.fakeStorage[key];
  },

  setPersistentItem: function(key, value){
    if (this.localStorageEnabled){
      localStorage.setItem(key, value)
    }else {
      App.fakeStorage[key] = value
      return false;
    }
  },

  removeItem: function(key) {
    this.available ? localStorage.removeItem(key) : delete App.fakeStorage[key]
  },

  is: function(item){
    return this.getItem(item) == 'true';
  },

  set: function(item){
    this.setItem(item, 'true')
    return true;
  },

  clear: function(item){
    this.available ? this.setItem(item, false) : delete App.fakeStorage[item]
    return true;
  },

  clearAll: function(){
    this.available ? localStorage.clear() : App.fakeStorage = {}
  },

  logout: function(opts){
    if (!opts) opts = {};
    this.clearAll()
    //console.log('logout');
    App.authorized = false;
    this.setItem('logoutText', 'You were logged out.')
    let reloadFn = ()=>{
      location.href = opts.redirectTo || '/hello'
    }
    if (opts.delayReload){
      return reloadFn;
    }else{
      reloadFn();
    }
  },

  reset: function(webStorage){
    this.clearAll()

    this.set('sync_mode');

    App.family.forEach((person) => { App.family.remove(person) });

    webStorage.people.forEach((person) => {
      person.synced = true;
      person = new App.Models.Person(person)
      App.family.add(person, {validate: true});
      person.saveLocal();
    })

    App.family.resetChildren(webStorage.children);

    if (webStorage.finances){
      webStorage.finances.synced = true;
      App.finances.set(webStorage.finances).trigger('reset').saveLocal();
    }

    if (webStorage.big_decision){
      App.bigDecision.set(webStorage.big_decision).saveLocal();
    }

    if (webStorage.finance_assumptions){
      App.finAssumptions.set(webStorage.finance_assumptions).saveLocal();
    }

    if (webStorage.retirement_funding){
      App.retirementFunding.set(webStorage.retirement_funding).saveLocal();
    }

    if (webStorage.budget_needs){
      webStorage.budget_needs.synced = true;
      App.budgetNeeds.set(webStorage.budget_needs).saveLocal();
    }

    if (webStorage.budget_categories){
      webStorage.budget_categories.synced = true;
      App.budgetCategories.set(webStorage.budget_categories).saveLocal();
    }

    if (webStorage.budget_tracking){
      webStorage.budget_tracking.synced = true;
      App.budgetCategories.set(webStorage.budget_tracking).saveLocal();
    }

    if (webStorage.loans){
      webStorage.loans.synced = true;
      App.loans.set(webStorage.loans).saveLocal();
    }

    if (webStorage.investments){
      webStorage.investments.synced = true;
      App.investments.set(webStorage.investments).saveLocal();
    }

    if (webStorage.income_stats){
      App.incomeStats = webStorage.income_stats;
    }

    if (App.retirementFunding.isSafe()){ App.storage.set('budget_opened') }
    if (App.budgetCategories.areBalanced()){ App.storage.set('investment_opened') }
    if (App.investments.isFilled()){ App.storage.set('housing_opened') }
    App.bigDecision.trigger('imported');

    //console.log('Data imported')
  },

  export: function(){
    this.set('sync_mode')

    //App.family.restoreFromStorage();

    App.family.forEach((person) => {
      if (!person.isEmpty()){
        person.syncParams();
      }
    });
    App.family.syncChildren();

    if (!App.finances.isEmpty()){
      App.finances.syncParams();
      App.finances.trigger('reset');
    }

    //console.log('LocalStorage exported')
  }
}

App.syncOn = function(){
  return this.authorized && this.storage.is('sync_mode');
}

App.checkAuth = function(){
  let uid = document.getElementById('uid')
  this.authorized = uid != null;
  this.companyName = uid ? uid.dataset.company : 'Visitor';
}
App.checkReminder = function(){
  if (this.authorized){
    let reminderEl = document.getElementById('reminder')
    let nextTime = reminderEl.getAttribute('data-next')
    App.reminder = {
      isNew: reminderEl.getAttribute('data-new') == 'true',
      next: nextTime.length ? parseInt(nextTime) : null,
      period: parseInt(reminderEl.getAttribute('data-period'))
    }
  }
}

App.initData = function(callback){
  // do not request data if account is not verified
  if (!this.authorized) return false;

  // do not request data if storage already has sync mode
  if (this.storage.is('sync_mode')) {return false; }
  $.ajax({
    url: '/user/profile', type: 'GET', dataType: 'json',
    success: (data) => {
      switch(data.result){
        case 'ok':
          App.storage.reset(data.storage);
          break;
        case 'empty_account':
          App.storage.export();
          break;
        default:
          //console.log(data)
      }
    }, complete: () => {
      callback()
    }
  })
  return true;
}

App.isBudgetOpened = function(){
  return App.retirementFunding.isSafe() && this.storage.is('budget_opened')
}
App.isSavingsOpened = function(){
  return App.retirementFunding.isSafe() && this.storage.is('investment_opened')
}

App.isHousingOpened = function(){
  return App.retirementFunding.isSafe() && this.storage.is('housing_opened')
}

App.transitPage = function(html){
  const origin = $('#page-content > .container-original');
  if (!origin.html().trim().length) {
    origin.html(html)
    App.simplePage.setElement(origin);
    App.utils.smoothScroll($(window), 0, 200);
  }else {
    const newContainer = $('<div class="container"></div>').insertBefore(origin);
    newContainer.html(html);
    App.simplePage.setElement(newContainer);
    let newWasMoved = false;
    if (this.backAction){
      this.backAction = false;
      newWasMoved = true;
      newContainer.addClass('container-fake').css('animation-name', 'slideInFromLeft');
    }else {
      newContainer.addClass('container-original');
      origin.removeClass('container-original').addClass('container-fake').css('animation-name', 'slideInFromRight');
    }
    setTimeout(()=>{
      origin.remove();
      //if (newWasMoved){
      newContainer.removeClass('container-fake').addClass('container-original');
      //}
      App.utils.smoothScroll($(window), 0, 200);
    }, newWasMoved ? 700 : 500);

  }
  App.utils.timeout(this, ()=>{
    if (App.simplePage.$el.find('input').length){
      App.simplePage.startEncouragmentProcess();
    }
  }, 1500, 'encouragments-process-start')


  if (location.pathname == '/hello' || location.pathname == '/'){
    $('#hamburger').addClass('hidden')
  }else{
    $('#hamburger').removeClass('hidden')
  }

}

App.savePosition = function(callback){
  if (App.authorized){
    $.ajax({
      url: '/position', type: 'POST', dataType: 'json',
      data: { pos: location.pathname },
      complete: () => { if (callback) callback(); }
    })
  }
}

App.inAppNavigateEvent = function(event){
  event.preventDefault();
  let target = event.currentTarget;
  App.backAction = target.className && (target.className.indexOf('icon-back') >= 0);
  App.router.navigate(target.getAttribute('href'), {trigger: true})
  return false;
}

App.restorePosition = function(fallback, currentPath){
  //console.log('restore position')
  if (!App.authorized || App.positionRestored){
    if (fallback) fallback();
    return false;
  }
  $.ajax({
    url: '/position', type: 'GET', dataType: 'json',
    success: (data) => {
      App.positionRestored = true;
      if ((currentPath != data.pos) && data.pos){
        App.router.navigate(data.pos, {trigger: true});
      }else{
        if (fallback) fallback();
      }
    },
    error: ()=>{
      if (fallback) fallback();
    }
  })
}