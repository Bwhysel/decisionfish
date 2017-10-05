App.Views.PinRequest = Backbone.View.extend({
  el: 'body > .container',

  initialize: function(options){
  },

  events: {
    'click [role=change-phone-number]': 'changeNumber',
    'keyup [name=pin]': 'unblockSubmit',
  },

  render: function(){
    // rendered by Rails
    this.btn = $('button[type=submit]')[0]
    this.$el.find('[data-countdown]').forEach((clock) => {
      let $clock = $(clock);
      let $target = this.$el.find(`[role=${clock.dataset.target}]`);
      $target.addClass('hidden')
      App.utils.startTimer(parseInt(clock.dataset.countdown), clock, () => {
        $clock.parent().remove();
        $target.removeClass('hidden')
      })
    })
  },

  changeNumber: function(){
    App.storage.set('wrong_phone')
    App.router.navigate('/family', {trigger: true})
  },

  unblockSubmit: function(event){
    this.btn.disabled = event.target.value.length != 4;
  },

})