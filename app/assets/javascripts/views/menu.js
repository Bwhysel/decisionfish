App.Views.Menu = Backbone.View.extend({
  elementSelector: '#menu-screen',
  template: JST['templates/menu/index'],

  initialize: function(options){
    this.listenTo(App.bigDecision, 'imported', this.checkSquares);
  },

  events: {
    'click .square': 'onSquareClick',
  },

  render: function(){
    App.transitPage(this.template({}));
    this.setElement($(this.elementSelector));
    this.menuOpts = this.el.querySelectorAll('[data-menu]');
    this.checkSquares();
  },

  checkSquares: function(){
    this.$el.find('[data-menu=budget]').toggleClass('square-locked', !App.isBudgetOpened())
    this.$el.find('[data-menu=savings]').toggleClass('square-locked', !App.isSavingsOpened())
  },

  onSquareClick: function(event){
    let square = event.currentTarget;
    this.setSquareSelection(square);
    const klass = square.className
    const locked = klass.indexOf('locked')>=0 || klass.indexOf('disabled')>=0;
    const menu = square.dataset.menu;

    if (!locked){
      App.router.navigate(`${menu}_intro`, {trigger: true});
    }else{
      let modalData = {}
      if (menu){
        modalData.text = `I love your enthusiasm. Please complete ${menu == 'budget' ? 'RETIREMENT' : 'BUDGET'} module first.`;
      }else {
        modalData.modalTitle = "I'm sorry,";
        modalData.text = `This hasn't hatched yet!`;
      }
      App.simplePage.openDesiModal({currentTarget: {
        dataset: modalData
      }}, ()=>{ // fnClose
        this.clearSquareSelection(square)
      })
    }
  },

  setSquareSelection: function(selectedSquare) {
    this.menuOpts.forEach((square) => { this.clearSquareSelection(square) });
    selectedSquare.dataset.prevClassName = selectedSquare.className;
    selectedSquare.className = selectedSquare.className + ' square-active';
  },

  clearSquareSelection: function(square) {
    let prevClass = square.dataset.prevClassName;
    if (prevClass){
      square.className = prevClass;
      delete square.dataset.prevClassName;
    }
  }

})