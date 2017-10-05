App.Views.IdeasSelect = Backbone.View.extend({
  elementSelector: '#ideas-select-screen',
  template: JST['templates/ideas/ideas_select'],

  events: {
    'click .square': 'onSquareClick',
  },

  unmetKlass: 'square-disabled',
  activeKlass: 'square-active',
  prevSelected: null,

  render: function(){
    App.transitPage(this.template({}));
    this.setElement($(this.elementSelector));
    App.utils.setPageHeight(this.el);
  },

  onSquareClick: function(event){
    let square = event.currentTarget;
    const $square = $(square)

    $square.toggleClass(this.unmetKlass);
    $square.toggleClass(this.activeKlass);
    if (this.prevSelected && (this.prevSelected != square)){
      $(this.prevSelected).addClass(this.unmetKlass).removeClass(this.activeKlass);
    }
    this.prevSelected = square;

    if ($square.hasClass(this.activeKlass)){
      this.model.set('need', square.dataset.need);
    }
  },


})