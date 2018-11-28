App.Views.Import = Backbone.View.extend({
  template: JST['templates/import/index'],
  connectTpl: JST['templates/import/connection'],
  elc: '#import-screen',
  widgetPlace: 'add-account',

  initialize: function(options){
  },

  events: {
    'click [role=goto-back]': 'returnClick',
    'click #save-btn': 'saveClick',
    'click [role=remove-connect]': 'onRemoveConnect',
  },

  returnClick: function(event){
    if (event){ event.preventDefault(); event.stopPropagation(); }
    App.backAction = true;
    this.returnFn();
    this.importXhr = null;
    return false;
  },

  saveClick: function(event){
    //console.log('save click')
    switch(this.task){
      case 'balances': url = '/import/balances'; break;
      case 'loans': url = '/import/loans'; break;
      case 'tracking_accounts': url = '/import/accounts_length'; break;
      case 'credit_charges': url = '/import/credit_charges'; break;
      case 'dashboard': url = '/import/dashboard_data'; break;
    }
    if (url){
      event.target.disabled = true;
      $.ajax({type: 'GET', dataType: 'json', url: url,
        success: (data) => {
          if (data.error){
            this.returnClick();
            App.simplePage.openDesiModal(data.error);
          }else{
            if (this.saveFn) this.saveFn(data);
            this.saveFn = null;
            this.returnClick();
          }
        },
        complete: ()=>{
          event.target.disabled = false;
        }
      })
    }else{
      if (this.saveFn) this.saveFn();
      this.saveFn = null;
      this.returnClick();
    }

  },

  render: function(task, target, saveFn, returnFn){
    if (!App.authorized){
      location.reload()
    }else {
      App.transitPage(this.template({backLink: location.href}))
      this.setElement($(this.elc));
      this.task = task;
      this.returnFn = returnFn;

      if (this.importXhr) { return false; }

      this.saveFn = saveFn;
      this.saveBtn = document.getElementById('save-btn');
      this.saveBtn.disabled = true;

      this.connectionsList = this.$el.find('[role=connections]').addClass('hidden');

      this.resetConnections();

      if (target) target.disabled = true;

      this.importXhr = $.ajax({type: 'POST', url: '/import/widget', dataType: 'json',
        success: (data) => {
          if (data.err){
            if (target) target.disabled = false;
            App.simplePage.openDesiModal(data.err);
            this.importXhr = null;
          }else{
            this.loadMXWidget(data.widget_url);
          }

        },
        error: () => {
          if (target) target.disabled = false
          this.importXhr = null;
        }
      })
    }
  },

  resetConnections: function(){
    $.ajax({type: 'GET', url: '/import/connections', dataType: 'json',
      success: (data)=>{
        if (_.isEmpty(data)) return false;
        this.connectionsList.removeClass('hidden');
        _.each(data, (hash, guid)=>{
          hash.guid = guid
          this.connectionsList.append(this.connectTpl(hash))
        })
      }
    })
  },

  onRemoveConnect: function(event){
    let formGroup = $(event.target).closest('.form-group')
    const guid = formGroup[0].dataset.id;
    $.ajax({
      type: 'DELETE', url: `/import/connections/${guid}`, dataType: 'json',
      success: (data) => {
        formGroup.remove();
        if (!this.connectionsList.find('[data-id]').length){
          this.connectionsList.addClass('hidden');
        }
      }
    });
  },

  onAddConnect: function(guid){
    $.ajax({
      type: 'POST', url: `/import/connections`, dataType: 'json', data: { id: guid },
      success: (data)=>{
        data.guid = guid;
        this.connectionsList.removeClass('hidden');
        this.connectionsList.append(this.connectTpl(data));
      }
    })
  },

  loadMXWidget: function(url){
    let fn = ()=>{ this.runMXWidget(url); }
    if (window.MXConnect){
      fn()
    }else{
      let script = document.createElement('script');
      script.onload = fn;
      script.src = "https://atrium.mx.com/connect.js";
      document.head.appendChild(script);
    }
  },

  runMXWidget: function(url){
    var mxConnect = new MXConnect({id: this.widgetPlace, url: url,
      onLoad: () => {
        //console.log('On Load: Add accounts widget successfully loaded');
        this.saveBtn.disabled = false;
        this.importXhr = null;
      },
      onSuccess: (obj) => {
        this.onAddConnect(obj.member_guid);
      }
    });
    if (this.importXhr){
      mxConnect.load();
    }
  },

})