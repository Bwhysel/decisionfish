App.Views.FinalPage = Backbone.View.extend({
  templates: {
    retirement: JST['templates/future/final'],
    budget: JST['templates/budget/final'],
    savings: JST['templates/savings/final'],
  },

  events: {
    'click [role=share-plan]': 'onShareClick',
    'click button[target=blank]': 'onExternalClick',
  },

  onShareClick: function(event){

    if (!App.screens.Congratulations){
      App.screens.Congratulations = new App.Views.Congratulations();
    }
    const fakePage = App.screens.Congratulations;
    let params = fakePage.getCongratParams(this.kind);

    App.simplePage.openDesiModal(`I have downloaded "${params.downloadTitle}" to your device. Open it and share from the viewer you are using.`);
    if (fakePage.blobData && fakePage.kind == this.kind){
      fakePage.downloadFile();
    }else{
      fakePage.renderDiploma(
        this.$el, // where to look for #diploma-placeholder
        params, // scope-related params
        true // generate image on render
      );
    }
  },

  onExternalClick: function(event){
    let btn = event.currentTarget
    window.open(btn.getAttribute("href"), "_blank")
    $(btn).blur()
    return false;
  },
  render: function(kind){
    this.kind = kind;
    let id = `${kind}-final-screen`
    App.transitPage(this.templates[kind]({containerId: id}));
    this.setElement('#'+id);
    App.utils.setPageHeight(this.el);
  }
})