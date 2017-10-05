App.Models.BudgetTracking = Backbone.Model.extend({
  key: 'budget_tracking',

  defaults: {
    //who: [0],
    //when: [], // 0 - daily, 1 - weekly, 2 - monthly, 3 - when you maybe over-spending,
    other_email: null,
    notify_period: 0
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes));
  },

  restoreLocal: function(){
    let temp = localStorage.getItem(this.key);
    if (!temp) return;
    this.set(JSON.parse(temp));
  },

  updateParam: function(attr, value){
    if (_.isEqual(this.get(attr), value)){ return; }
    let data = { synced: false };
    data[attr] = value;
    this.set(data);
    this.saveLocal();
    this.syncParams([attr]);
  },

  syncParams: function(fields){
    if (!App.syncOn() || this.get('synced')) return false;

    App.utils.timeout(this, ()=>{
      let data = _.clone(this.attributes);
      if (fields){ data = _.pick(data, fields) } else { delete data.synced };

      let xhr = $.ajax({
        url: '/budget_tracking', type: 'PATCH', dataType: 'json',
        data: data,
        success: (data) => {
          this.set('synced', true);
        },
        error: (xhr, errorStatus, error) => {
          console.log(error)
        }
      })

      return xhr;
    }, 20)

  },
})