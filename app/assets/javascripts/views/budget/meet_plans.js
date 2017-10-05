App.Views.BudgetMeetPlans = Backbone.View.extend({
  elementSelector: '#meet-plans-screen',
  template: JST['templates/budget/meet_plans'],


  events: {
    'change input[type=checkbox]': 'changeMet',
    'click label': 'onLabelClick',
  },

  render: function(revised){
    let data = {};
    let total = 0;
    let maxValue = 0;
    _.each(this.model.captions, (attrs, field) => {
      data[field] = _.clone(attrs)
      let diff = this.model.getDiff(field);
      let v = this.model.getValue(field);
      if (revised) {
        data[field].diff = diff==0 ? '' : (diff>0? '↑' : '↓') + App.utils.toMoney(Math.abs(diff));
      }
      else {
        v -= diff;
      }
      data[field].value = App.utils.toMoney(v);
      data[field].valueInt = v;
      data[field].checked = this.model.isMet(field) ? 'checked' : '';
      total += v;
      if (v > maxValue) { maxValue = v }
    })
    _.each(data, (attrs, field) => {
      data[field].percent = attrs.valueInt > 0 ? Math.round(attrs.valueInt / maxValue * 100)+8.6 : 0;
    })
    App.transitPage(this.template({
      data: data, total: App.utils.toMoney(total), revised: revised
    }));
    this.setElement($(this.elementSelector));
    tippy('.icon-question', {arrow: true, interactive: true, theme: 'light'});
  },
  changeMet: function(event){
    let input = event.target;
    this.model.updateNeed(input.name, input.checked)
  },
  onLabelClick: function(event){
    const $target = $(event.target);
    if ($target.hasClass('icon-question')){
      event.preventDefault();
      $target.blur();
      return false;
    }
  }

})