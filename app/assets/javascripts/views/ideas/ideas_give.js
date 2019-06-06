App.Views.IdeasGive = Backbone.View.extend({
  elementSelector: '#ideas-give-screen',
  template: JST['templates/ideas/ideas_give'],
  resultTpl: JST['templates/ideas/ideas_give_result'],

  events: {
    'click [type=checkbox]': 'clickOption',
    'click #submit-btn': 'onSubmit',
  },

  render: function(){
    App.transitPage(this.template({}));
    this.setElement($(this.elementSelector));
    App.utils.setPageHeight(this.el);
    this.model.set('saves_money', 0);
    this.$el.find('[contenteditable]').html('');
  },

  renderResult: function(data){
    this.resultIdeaID = data.id;
    App.transitPage(this.resultTpl(data));
    this.setElement($(this.elementSelector));
    App.utils.setPageHeight(this.el);
  },

  clickOption: function(event){
    if (event.currentTarget.checked == false){
      event.currentTarget.checked = true;
    }else{
      this.$el.find('input[name=saves_money_'+this.model.get('saves_money')+']')[0].checked = false;
      this.model.set('saves_money', parseInt(event.currentTarget.dataset.value));
    }
  },

  onSubmit: function(event){
    event.currentTarget.disabled = true;

    const textarea = this.$el.find('[contenteditable]');
    let txt = textarea.html().replace("</div>", "").split("<div>").join("\n")
    if (!txt.trim().length){
      App.simplePage.openDesiModal('What is your idea about?', () => {
        textarea.focus();
      });
      event.currentTarget.disabled = false;
    }else {
      //console.log('there')
      let data = _.pick(this.model.attributes, ['need', 'saves_money']);
      data.user_email = App.family.at(0).get('email');
      data.user_name = App.family.at(0).get('name');
      data.content = txt;
      $.ajax({
        url: '/ideas/give',
        type: 'POST',
        data: { idea: data },
        dataType: 'json',
        success: (data)=>{
          this.renderResult({})
        },
        complete: ()=>{
          event.currentTarget.disabled = false;
        }
      })
    }
  },

})