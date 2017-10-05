App.Collections.Family = Backbone.Collection.extend({
  model: App.Models.Person,
  synced: false,

  childrenYears: [],

  restoreFromStorage: function(){
    let personIds = localStorage.getItem('persons')
    if (personIds) {
      let persons = [];
      JSON.parse(personIds).forEach((id) => {
        let storedObj = localStorage.getItem('person_'+id);
        if (storedObj){
          persons.push(JSON.parse(storedObj))
        }
      })
      if (persons.length){
        this.reset(persons);
      }
    }
    let children = localStorage.getItem('children');
    if (children){
      this.childrenYears = JSON.parse(children);
    }

    App.finances.restoreLocal();

    App.bigDecision.restoreLocal();
    App.finAssumptions.restoreLocal();
    App.retirementFunding.restoreLocal();
    App.budgetNeeds.restoreLocal();
    App.budgetCategories.restoreLocal();
    App.budgetTracking.restoreLocal();
    App.loans.restoreLocal();
    App.investments.restoreLocal();

    console.log('Data restored from localStorage');
  },

  resetChildren: function(years){
    this.childrenYears = years;
    this.saveChildren({local: true});
    this.trigger('resetChildren')
  },

  addChild: function(){
    this.childrenYears.push('')
    this.saveChildren({local: true});
  },

  updateChild: function(opts){
    if (this.childrenYears[opts.index] == opts.value) return false;
    this.childrenYears[opts.index] = opts.value;
    this.saveChildren();
  },

  removeChild: function(index){
    this.childrenYears.splice(index, 1);
    this.saveChildren();
  },

  saveChildren: function(opts){
    App.storage.setItem('children', JSON.stringify(this.childrenYears))
    if (!opts || !opts.local) this.syncChildren();
  },

  syncChildren: function(){
    if (!App.syncOn()) return false;
    $.ajax({
      url: '/people/children', type: 'PATCH', dataType: 'json',
      data: {
        years: this.childrenYears
      },
      success: (data) => {
        console.log(data)
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

  getNames: function(){
    const name1 = this.at(0).get('name');
    const name2 = this.length > 1 ? this.at(1).get('name') : null;
    return [name1, name2];
  }

})