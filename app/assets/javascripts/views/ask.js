App.Views.Ask = Backbone.View.extend({
  elSelector: '#page-content > .container',
  template: JST['templates/ask/index'],

  initialize: function(options){
  },

  events: {
    'keyup input[type=email]': 'unblockSend',
    'change input[type=email]': 'unblockSend',
    'keyup [role=user-ask-msg]': 'unblockSend',
    'change [role=user-ask-msg]': 'unblockSend'
  },

  render: function(){
    let email = App.family.at(0);
    email = email ? email.get('email') : null;

    App.transitPage(this.template({email: email}));
    this.setElement($(this.elSelector));

    this.btn = $('#ask-screen .send-to-desi')
    this.data = { input: email != null, textarea: false }
    App.utils.setPageHeight(this.el);
  },

  unblockSend: function(event){
    const inp = event.target.nodeName.toLowerCase()
    this.data[inp] = event.target.value.length > 0;
    this.btn[0].disabled = !this.data['input'] || !this.data['textarea'];
  },

})