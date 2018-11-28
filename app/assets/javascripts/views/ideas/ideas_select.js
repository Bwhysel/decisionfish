App.Views.IdeasSelect = Backbone.View.extend({
  elementSelector: '#ideas-select-screen',
  template: JST['templates/ideas/ideas_select'],

  events: {
    'click .square': 'onSquareClick',
    'click .blue-button': 'onNextClick'
  },

  unmetKlass: 'square-disabled',
  activeKlass: 'square-active',
  prevSelected: null,

  render: function(){
    App.transitPage(this.template({}));
    this.setElement($(this.elementSelector));
    App.utils.setPageHeight(this.el);
    this.nextBtns = this.$el.find('.blue-button').addClass('disabled')
  },

  onNextClick: function(event){
    if (this.prevSelected) { return true; }
    event.preventDefault();
    App.simplePage.openDesiModal('Please select one need first. Thanks.');
    return false;
  },

  onSquareClick: function(event){
    let square = event.currentTarget;
    const $square = $(square)

    $square.toggleClass(this.unmetKlass);
    $square.toggleClass(this.activeKlass);
    if (this.prevSelected && (this.prevSelected != square)){
      $(this.prevSelected).addClass(this.unmetKlass).removeClass(this.activeKlass);
    }


    if ($square.hasClass(this.activeKlass)){
      this.prevSelected = square;
      this.nextBtns.removeClass('disabled');
      this.model.set('need', square.dataset.need);
    }else{
      this.prevSelected = null;
      this.nextBtns.addClass('disabled');
      this.model.set('need', null);
    }
  },


})