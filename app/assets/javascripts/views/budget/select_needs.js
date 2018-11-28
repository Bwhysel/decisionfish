App.Views.BudgetSelectNeeds = Backbone.View.extend({
  elementSelector: '#select-needs-screen',

  template: JST['templates/budget/select_needs'],

  initialize: function(options){
    this.listenTo(this.model, 'reset', this.resetSelection)
  },

  events: {
    'click .square': 'onSquareClick',
    'click #next-btn': 'onNextClick'
  },

  metKlass: 'square-success',
  unmetKlass: 'square-warning',

  render: function(){
    App.transitPage(this.template({isSingle: App.family.length == 1}));
    this.setElement($(this.elementSelector));
    this.menuOpts = this.el.querySelectorAll('[data-need]');
    this.nextBtn = this.$el.find('#next-btn');
    this.nextBtn.addClass('disabled');
    this.clickedNeeds = [];
    this.resetSelection();
  },

  onSquareClick: function(event){
    let square = event.currentTarget
    const $square = $(square)
    const need = square.dataset.need
    if (square.dataset.wasClicked){
      $square.toggleClass(this.unmetKlass)
      $square.toggleClass(this.metKlass)
      this.updateNeed(square)
    }else {
      let clickedYes = false
      this.firstModal = App.simplePage.openSectionModal({
        title: $square.find('.menu-text').text().trim(),
        content: this.model.captions[need].hint,
        btnTitle: 'YES',
        cancelTitle: 'NO'
      }, () => {
        clickedYes = true
        $square.removeClass(this.unmetKlass)
        $square.addClass(this.metKlass)
        this.updateNeed(square);
      }, () => {
        if (!clickedYes){
          $square.removeClass(this.metKlass)
          $square.addClass(this.unmetKlass)
          this.updateNeed(square);
        }
      });
      if (this.clickedNeeds.indexOf(need) < 0) {
        this.clickedNeeds.push(need)
        if (this.allNeedsSelected){
          this.nextBtn.removeClass('disabled')
        }
      }
    }
  },

  allNeedsSelected: function(){
    return this.clickedNeeds.length == 7;
  },

  updateNeed: function(square){
    this.model.updateParam(square.dataset.need, 'met', !$(square).hasClass(this.unmetKlass));
  },

  resetSelection: function(){
    if (!this.model.id) { return }
    this.menuOpts.forEach((square) => {
      let $square = $(square);
      const isMet = this.model.isMet(square.dataset.need)
      if (isMet == null) return;
      this.clickedNeeds.push(square.dataset.need)
      $square.toggleClass(this.unmetKlass, !isMet)
      $square.toggleClass(this.metKlass, isMet)
    })

    this.nextBtn.toggleClass('disabled', !this.allNeedsSelected())
  },

  onNextClick: function(event){
    if (this.allNeedsSelected()) return true;

    event.preventDefault();
    App.simplePage.openDesiModal('Please tell me whether each need is met for your by clicking on each and answering Yes or No.')

    return false;
  },

})