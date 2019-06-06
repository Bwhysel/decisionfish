App.Views.P401 = Backbone.View.extend({
  elementSelector: '#p401-screen',
  tpl: JST['templates/savings/p401'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetInput);
  },

  events: {
    'click .form-group': 'selectFormGroup',
    'keyup input': 'onKeyUp',
  },

  selectFormGroup: function(event){
    const $target = $(event.target)
    if ($target.hasClass('ask-desi') || $target.hasClass('icon-cross')) { return true; }
    const $block = $(event.currentTarget).addClass('active')
    $block.siblings().removeClass('active');
    $block.children('input').first().trigger('focusin')
  },

  render: function(){
    const [name1, name2] = App.family.getNames();
    App.transitPage(this.tpl({
      name1: name1,
      name2: name2
    }))
    this.setElement($(this.elementSelector))

    App.utils.setPageHeight(this.el);
    this.resetInput()
  },

  resetInput: function(){
    this.$el.find('input[name]').forEach((input) => {

      input.value = this.model.get(input.name);
      VMasker(input).maskPercent();
      $(input).trigger('keyup', true); // to apply mask for input
    })
  },

  onKeyUp: function(event, manual){
    const input = event.target;
    if (manual) return;
    value = App.utils.parsePercent(input.value);
    this.model.updateParam(input.name, value)
  },



})