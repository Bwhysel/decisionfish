App.Views.SimplePage = Backbone.View.extend({
  el: '#page-content > .container-original',
  templates: {},
  desiModalTpl: JST['templates/simple_pages/desi_modal'],
  confirmModalTpl: JST['templates/simple_pages/confirm_modal'],
  loginTpl: JST['templates/simple_pages/login_modal'],
  sectionModalTpl: JST['templates/simple_pages/section_modal'],
  circleProgressTpl: JST['templates/simple_pages/circle_progress'],
  selectModalTpl: JST['templates/simple_pages/select_modal'],
  randomTextTpl: JST['templates/simple_pages/random_text'],

  initialize: function(options){
  },

  events: {
    'click [role=goto-link]': 'gotoLink',
    'click [role=goto-back]': 'gotoBack',
    'click [role=login-link]': 'clickLoginLink',
    'click [role=logout-link]': 'clickLogoutLink',
    'click .ask-desi': 'openDesiModal',
  },

  render: function(page_slug){
    if (!this.templates[page_slug])
      this.templates[page_slug] = JST['templates/simple_pages/' + page_slug];

    if (this.templates[page_slug]){
      App.transitPage(this.templates[page_slug]({}));
      App.utils.setPageHeight(this.el);
      tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});
    }else {
      App.router.navigate('/hello', {trigger: true})
      //console.log(`NOT IMPLEMENTED PAGE: ${page_slug}`)
    }

  },

  gotoLink: function(event){
    return App.inAppNavigateEvent(event);
  },

  gotoBack: function(event){
    App.backAction = true;
    //if (Backbone.history.length > 1){
      let oldPages = Backbone.history.pastFragments;
      const countPages = oldPages.length;
      let lastIndex = countPages -1;
      let prevFragment = oldPages[lastIndex-2];
      let curFragment = oldPages[lastIndex];
      let safePath = event ? event.currentTarget.dataset.safePath : null;

      if (countPages < 2 || (prevFragment == curFragment)){
        // [] || [..., 'route1', 'route2', 'route1']
        Backbone.history.length -= 0;
        App.router.navigate(safePath || 'menu', {trigger: true})
      //}else if (countPages==2 && safePath){
      }else if (countPages < 2){
        App.router.navigate(safePath, {trigger: true})
      }else{
        Backbone.history.length -= 2;
        window.history.back();
      }
    //} else {
    //  App.router.navigate('menu', {trigger: true})
    //}
  },

  parseContent: function(txt){
    txt = txt.replace('[YOU_BOTH]', App.family.length > 1 ? 'you both' : 'you');
    return txt.replace('[NAME]', App.family.length ? App.family.at(0).get('name') : 'user');
  },

  openDesiModal: function(event, fnClose){
    let data;
    if (typeof event == 'string'){
      data = {
        content: event
      }
    }else{
      data = _.clone(event.currentTarget.dataset);
      data.content = data.text || App.bubbles[data.content];
    }
    data.desi = data.desi || 'says'
    let modalTitle = data.modalTitle ? data.modalTitle : `Desi ${data.desi},`
    App.utils.createModal(
      'modal', {afterClose: fnClose}, this.desiModalTpl, {
        title: modalTitle, body: this.parseContent(data.content),
        cancelTitle: 'OK', btnTitle: false
      }
    )
  },

  openDesiYesNoModal: function(content, okFunc, cancelFunc, opts){
    if (!opts) { opts = {} }
    let data = {
      title: "Desi says,", body: content,
      btnTitle: (opts.btnTitle || 'NO'), cancelTitle: (opts.cancelTitle || 'YES')
    }
    const modal = App.utils.createModal(
      'modal', { afterClose: cancelFunc }, this.desiModalTpl, data
    )
    $('[role=submit-modal]', modal.dialog).on('click', (evenet) => {
      if (okFunc) { okFunc(); }
      modal.close();
    })
    return modal;
  },

  openConfirmationDialog: function(data, okFunc, cancelFunc, validateFunc){
    if (!data.cancelTitle) { data.cancelTitle = 'CANCEL' }
    const modal = App.utils.createModal(
      'confirm-modal', {afterClose: cancelFunc}, this.confirmModalTpl, data
    )
    $('[role=submit-modal]', modal.dialog).on('click', (event) => {
      if (!validateFunc || validateFunc()){
        modal.close();
        okFunc();
      }
    })
    if (data.reversedFooterBtns){
      $(modal.dialog).find('.modal-footer').css('flex-direction', 'row-reverse');
    }
    return modal;
  },

  openSectionModal: function(data, okFunc, cancelFunc){
    if (!data.btnTitle) { data.btnTitle = 'OK'}
    if (!data.helpBtn) { data.helpBtn = false }
    if (!data.cancelTitle) { data.cancelTitle = null }
    if (!data.title) { data.title = false }
    const modal = App.utils.createModal(
      'section-modal', { afterClose: cancelFunc }, this.sectionModalTpl, data
    )
    $('[role=help-link]', modal.dialog).on('click', (event)=>{
      App.router.navigate('/ask', {trigger: true})
      modal.close();
    })
    $('[role=submit-modal]', modal.dialog).on('click', (event) => {
      if (okFunc) { okFunc(); }
      modal.close();
    })
    return modal;
  },


  clickLoginLink: function(event){
    this.openLogin()
  },

  clickLogoutLink: function(event){
    $.ajax({
      type: 'POST', url: '/logout', dataType: 'JSON',
      data: {pos: location.pathname},
      complete: () => {
        reloadFn();
      }
    })
    let reloadFn = App.storage.logout({delayReload: true});
  },

  sendConfirmationLink: function(email, from_signup, oldPath){
    $.ajax({
      type: 'POST', url: '/login', data: {
        email: email,
        from_signup: from_signup,
        return_to: oldPath
      },
      complete: (xhr, status) => {
        let msg, data;
        let closeFn = null;
        if (xhr.status == 200){
          data = JSON.parse(xhr.response);
          msg = data.msg;
          if(data.result == 'ok'){
            App.storage.set('email_sent');
            closeFn = ()=>{ location.href = "http://decisionfish.com/almost-there" }
          }else if (data.result == 'whitelist'){
            App.storage.setItem('initial_email', email)
            App.router.navigate('/future_intro', {trigger: true})
            return;
          }
        }else{
          msg = 'Something whent wrong.'
        }

        App.simplePage.openDesiModal(msg, closeFn)
      }
    })
  },

  openLogin: function(email, oldPath){
    let with_email = email && email.length
    let opts = {};
    let emailRegexp = Backbone.Validation.patterns.email;
    if (with_email) {
      opts.content = 'Welcome back!<br/>Want to login to pick up where you left off?';
      opts.btnTitle = 'YES';
      opts.cancelTitle = 'NO';
    } else {
      opts.content = this.loginTpl({});
      opts.btnTitle = 'SUBMIT';
      opts.cancelTitle = 'CANCEL';
      opts.reversedFooterBtns = true;
    }

    let modal = App.simplePage.openConfirmationDialog(opts,
      () => { // submit fn
        this.sendConfirmationLink(email, with_email, oldPath);
      },
      null, // cancel fn
      ()=> { // validate fn
        const flag = emailRegexp.test(email)
        $('.error-msg', modal.dialog).text(flag ? '' : 'Not valid email address')
        return flag;
      }
    )
    if (!with_email){
      $(modal.dialog).find('.modal-footer').css('flex-direction', 'row-reverse');
      let $input = $('input', modal.dialog);
      $input.on('keyup', () => {
        email = $input[0].value;
      })
    }
  },

  selectModal: function(modalId, variants, selected, submitFn){
    let modal = App.utils.createModal(modalId, {
        beforeClose: function(next){
          $('h1').focus();
          next();
        }
      }, this.selectModalTpl, {
        id: modalId,
        variants: variants,
        selected: selected
      }
    )
    if (modal){
      $('[role=submit-modal]', modal.dialog).on('click', (event) => {
        modal.close();
        const row = $('.select-option.active', modal.dialog);
        submitFn(row[0].dataset.id);
      })
      const choices = $('.select-option', modal.dialog)
      choices.on('click', (event) => {
        const p = $(event.currentTarget);
        p.addClass('active').siblings('.active').removeClass('active');
      })
      choices.on('keydown', function(event){
        const code = event.keyCode;
        const curP = $(event.currentTarget);
        let p;
        if (code == 38){ // UP
          p = curP.prev()
          if (!p.length) p = $(choices[choices.length])
        }else if (code == 40){ // DOWN
          p = curP.next()
          if (!p.length) p = $(choices[0])
        }
        if (p) p.focus().trigger('click')
      });
    }
  },

  lastTextIndexes: {
    jokes: [],
    encouragments: []
  },

  getRandomText: function(kind){
    let flag = false;
    const n = App[kind].length;
    let newIndex;
    while (!flag){
      newIndex = Math.floor(Math.random()*n);
      flag = this.lastTextIndexes[kind].indexOf(newIndex) < 0;
    }
    //console.log(newIndex, '<-',this.lastTextIndexes[kind]);
    this.lastTextIndexes[kind].push(newIndex);
    // Do not repeat recent texts
    if (this.lastTextIndexes[kind].length > 5){ this.lastTextIndexes[kind].splice(0,1); }
    return App[kind][newIndex];
  },

  showRandomText: function(kind, delayFn, opts){
    if (!opts) { opts = {} }
    const encRow = $('#encouragments-row')
    if (!encRow.hasClass('hidden')){
      if (delayFn) {
        this.debug(`interupt '${kind}'; other hint is shown`)
        delayFn(0.5);
      }
      return false;
    }
    const txt = this.parseContent(this.getRandomText(kind));
    encRow.append($(this.randomTextTpl({text: txt})));
    encRow.removeClass('hidden')
    this.debug(`show '${kind}'`);
    //bal = $('.random-text-holder');
    //setTimeout(()=>{ bal.css('opacity', '1'); }, 1000)
    // HIDING PROCEDURE
    encRow.on('click', (event)=>{
      encRow.slideUp()
      setTimeout(()=>{
        encRow.html('').addClass('hidden').attr('style', '')
      }, 1000)
      if (this.autoHide){
        if (delayFn && opts.cyclic) {
          this.debug(`delay '${kind}'`)
          delayFn();
        }
        clearTimeout(this.autoHide);
        this.autoHide = null;
      }
      if (opts.afterRun){ opts.afterRun() };
    })
    if (!opts.permanent){
      this.autoHide = setTimeout(()=>{
        this.debug(`auto-hide '${kind}'`)
        encRow.trigger('click');
        this.autoHide = null;
      }, Math.max(txt.split(' ').length * 800, 10000));
    }
  },

  delayShowJoke: function(delayMinutes, onetime){
    if (!delayMinutes) { delayMinutes = 5 }
    this.debug('start joke')
    setTimeout(()=>{
      this.showRandomText('jokes', (delayFactor)=>{ this.delayShowJoke(delayFactor); }, {cyclic: !onetime});
    }, delayMinutes * 60000)
  },

  delayShowEncouragment: function(factor){
    if (!factor) { factor = 1; }
    if (this.delayedEncouragments){
      clearTimeout(this.delayedEncouragments)
      this.delayedEncouragments = null;
      this.debug('stop old encouragments process');
    }
    this.delayedEncouragments = setTimeout(()=>{
      this.showRandomText('encouragments', (delayFactor)=>{
        this.delayedEncouragments = this.delayShowEncouragment(delayFactor);
      }, {
        afterRun: ()=> {
          this.debug('destroy timer');
          this.delayedEncouragments = null;
        }
      });
    }, factor * 3 * 60000); // every 1.5 minutes
  },

  delayedEncouragments: null,

  startEncouragmentProcess: function(){
    this.debug('encouragments initialized');
    if (!this.interruptEventInstalled){
      this.interruptEventInstalled = true;
      const fn = (event)=>{
        // do not restart encouragment when:
        // - the baloon was clicked
        // - some baloon is shown at the moment;
        if (event.target.className && (event.target.className.indexOf('random-text')>=0) || this.delayedShow) {return false;}
        if (this.delayedEncouragments){
          this.debug('interrupt Encouragment by activity');
          clearTimeout(this.delayedEncouragments);
          this.delayedEncouragments = null;
          $('.random-text-holder').remove();
          this.delayShowEncouragment();
        }
      }
      $('body').on('click, keyup', fn);
      $('body').on('change input[type=checkbox]', fn);
    }

    this.delayShowEncouragment();
  },

  debugT0: new Date().getTime(),
  debug: function(text){
    const diff = Math.round((new Date().getTime() - this.debugT0) / 1000);
    //console.log('('+diff+'s)', text)
  }

})