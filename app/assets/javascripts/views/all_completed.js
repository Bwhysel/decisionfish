App.Views.AllCompleted = Backbone.View.extend({
  elSelector: '#page-content > .container',
  template: JST['templates/simple_pages/all_completed'],
  wbTemplate: JST['templates/simple_pages/welcome_back'],

  initialize: function(options){
    this.calendarView = new App.Views.Reminder()
  },

  events: {
    'click  #goto_dashboard':    'dashboardClick'
  },

  render: function(page){
    let curPeriod = App.reminder ? App.reminder.period : 1
    App.transitPage(page == 'welcome_back' ? this.wbTemplate() : this.template({ period: curPeriod }));
    this.setElement($(this.elSelector));
    App.utils.setPageHeight(this.el);

    this.calendarView.render()
  },

  dashboardClick: function(event){
    event.preventDefault()
    /*
    if (!this.accountsCheck){
      this.$('.loading-indicator').removeClass('hidden')
      this.accountsCheck = $.ajax({type: 'GET', url: '/import/connections', dataType: 'json',
        success: (data)=>{
          if (_.isEmpty(data))
            alert('GOTO: slide #8');
          else
            App.router.navigate('/dashboard', {trigger: true, replace: false})
        },
        complete: ()=>{
          this.accountsCheck = null;
          this.$('.loading-indicator').addClass('hidden')
        }
      })
    }
    */
    App.router.navigate('/dashboard', {trigger: true, replace: false})
    $(event.currentTarget).blur()
    return false
  },

})