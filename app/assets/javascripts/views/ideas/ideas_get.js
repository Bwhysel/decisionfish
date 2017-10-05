App.Views.IdeasGet = Backbone.View.extend({
  elementSelector: '#ideas-get-screen',
  template: JST['templates/ideas/ideas_get'],
  resultTpl: JST['templates/ideas/ideas_get_result'],

  events: {
    'click [type=checkbox]': 'clickOption',
    'click #submit-btn': 'onSubmit',
    'click .report-idea': 'onReport',
    'click .like-idea': 'onLike',
  },

  render: function(){
    App.transitPage(this.template({}));
    this.setElement($(this.elementSelector));
    App.utils.setPageHeight(this.el);
    this.model.set('saves_money', 0);
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

  onSubmit: function(){
    let data = _.pick(this.model.attributes, ['need', 'saves_money']);
    data.email = App.family.at(0).get('email');
    $.ajax({
      url: '/ideas/get',
      type: 'GET',
      data: data,
      dataType: 'json',
      success: (data)=>{
        if (data.idea){
          this.renderResult(data.idea);
        }else {
          App.simplePage.openDesiModal(data.error);
        }

      }
    })
  },

  onReport: function(){
    data = {
      id: this.resultIdeaID,
      author: App.family.at(0).get('email')
    }
    $.ajax({
      url: '/ideas/report',
      type: 'POST',
      data: data,
      dataType: 'json',
      success: (data)=>{
        App.simplePage.openDesiModal('Thanks for you report! We will check it soon.');
      }
    })
  },

  onLike: function(event){
    if (!App.authorized || this.likeXhr) return false;
    this.likeXhr = $.ajax({
      url: '/ideas/like',
      type: 'POST',
      data: {id: this.resultIdeaID },
      dataType: 'json',
      success: (data)=>{
        App.simplePage.openDesiModal('Your mention is recorded.');
      },
      complete: ()=>{
        this.likeXhr = null;
      }
    })
  },

})