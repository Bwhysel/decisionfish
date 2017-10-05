App.Views.Home = Backbone.View.extend({
  el: '#start-screen',

  initialize: function(options){
    document.addEventListener('click', this.firstPageOpenFn)
    document.body.dataset.oldClass= document.body.className;
    document.body.className = this.oldClass + ' start';
    document.delayedTransit = setTimeout(()=>{
      $('body').trigger('click')
    }, 4500)
  },

  firstPageOpenFn: function(event){
    document.body.className = document.body.dataset.oldClass;
    delete document.body.dataset.oldClass
    App.router.navigate('hello', {trigger: true, replace: true});
    document.removeEventListener('click', arguments.callee);

    clearTimeout(this.delayedTransit);
    delete this.delayedTransit;
  }
})