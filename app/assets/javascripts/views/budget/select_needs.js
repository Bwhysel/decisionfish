App.Views.BudgetSelectNeeds = Backbone.View.extend({
  elementSelector: '#select-needs-screen',

  template: JST['templates/budget/select_needs'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetSelection)
  },

  events: {
    'click .square': 'onSquareClick',
  },

  unmetKlass: 'square-disabled',

  render: function(){
    App.transitPage(this.template({isSingle: App.family.length == 1}));
    this.setElement($(this.elementSelector));
    this.menuOpts = this.el.querySelectorAll('[data-need]');
    this.resetSelection();
  },

  onSquareClick: function(event){
    let square = event.currentTarget;
    const $square = $(square)
    if (square.dataset.wasClicked || !$(square).hasClass(this.unmetKlass)){
      $square.toggleClass(this.unmetKlass);
      this.updateNeed(square);
    }else {
      this.firstModal = App.simplePage.openSectionModal({
        title: $square.find('.menu-text').text().trim(),
        content: this.model.captions[square.dataset.need].hint,
        btnTitle: 'YES',
        cancelTitle: 'NO'
      }, () => {
        $square.removeClass(this.unmetKlass)
        this.updateNeed(square);
      });
      square.dataset.wasClicked = true;
    }
  },

  updateNeed: function(square){
    this.model.updateNeed(square.dataset.need, !$(square).hasClass(this.unmetKlass));
  },

  resetSelection: function(){

    this.menuOpts.forEach((square) => {
      let $square = $(square);
      if (this.model.isMet(square.dataset.need)){
        $square.removeClass(this.unmetKlass)
      } else {
        $square.addClass(this.unmetKlass)
      }
    })
  },

})