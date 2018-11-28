App.Models.Person = Backbone.Model.extend({

  defaults: {
    id: null,
    name: '',
    email: '',
    phone: '',
    age: null,
    sex: '',
    income: null,
    synced: false
  },

  initialize: function(options){
    if (!options.id){
      this.attributes.id = this.guid();
      this.id = this.attributes.id;
    }
  },

  isEmpty: function(options){
    let attrs = _.pick(this.attributes, 'name', 'age', 'sex', 'income', 'email', 'phone');
    return _.filter(attrs, (value) => { return value != null && value != ''}).length == 0;
  },

  validation: {
    name: [
      { required: true, msg: 'Please tell me your name' },
      { rangeLength: [2, 50], msg: 'Too few characters' }
    ],
    age: [
      { required: true, msg: 'Please tell me your age' },
      { min: 18, msg: 'You must be at least 18 (I only work with adults!)' },
      { max: 100, msg: 'But you look so young! Please enter an age less than 100.' }
    ],
    email: [
      //{ required: true, msg: 'Please tell me your email address' },
      //{ pattern: 'email', msg: 'Not valid email address' },
      {
        fn: function(value, attr, computedState){
          if ((App.family.at(0).get('id') == computedState.id) && !value){
            return 'Please tell me your email address'
          }
          if (value && !Backbone.Validation.patterns.email.test(value)){
            return 'Not valid email address';
          }
        }
      }
    ],
    phone: [
      { required: true, msg: 'Please enter a valid cellphone number' },
      {
        fn: function(value, attr, computedState) {
          const garbage = value ? value.replace(/[\d\(\)\+\-\s]/g, '') : ''
          if (garbage.length){
            return 'Please enter a valid cellphone number'
          }
        }
      }
    ],
    income: [
      { required: true, msg: 'Please tell me your yearly income' },
      {
        fn: function(value, attr, computedState) {
          let minVal = App.Models.Finances.prototype.minValue;
          let c = 0;
          let modelId = computedState.id;
          App.family.each((person)=>{
            c += 1;
            if (person.get('id') == modelId) return;
            minVal -= parseInt(person.get('income'));
          })

          if(value < minVal) {
            return `I need total family income over ${App.utils.toMoney(minVal)}, please.  If you're temporarily unemployed, tell me the income you expect to earn eventually. Otherwise, <a href='/ask'>contact me</a>.`;
          }
        }
      },
      { max: App.Models.Finances.prototype.maxValue, msg: 'Too much' }
    ],
    sex: [
      { required: true, msg: 'Please tell me your sex' },
    ],
  },

  updateParam: function(name, value){
    if (this.get(name) == value) return false;

    let data = {synced: false};
    data[name] = value;
    this.set(data);
    this.saveLocal();
    this.syncParams([name]);
  },

  getSyncData: function(){
    return _.pick(this.attributes, 'name', 'age', 'sex', 'income')
  },

  syncParams: function(names){
    if (this.get('synced') || !App.syncOn()) return false;

    const isFakeId = typeof this.id == 'string';
    let data = this.getSyncData();
    let url = '/people';
    let type = 'POST'
    if (names && !isFakeId) {
      data = _.pick(data, names);
      url += '/'+this.id
      type = 'PATCH'
    };

    $.ajax({
      url: url, type: type, dataType: 'json',
      data: data,
      success: (data) => {
        this.set('synced', true);
        if (isFakeId){ this.changeId(data.id) }
        //console.log( names ? `person update: ${names}` : 'person created')
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

  getFinParams: function() {
    return {
      sex: this.get('sex'),
      age: parseInt(this.get('age')),
      income: parseFloat(this.get('income').replace(/\$\s|\,/, ''))
    };
  },

  saveLocal: function(){
    let personIds = App.storage.getItem('persons');
    personIds = personIds ? JSON.parse(personIds) : []
    if (personIds.indexOf(this.id) < 0) {
      personIds.push(this.id)
      App.storage.setItem('persons', JSON.stringify(personIds))
    }
    App.storage.setItem('person_'+this.id, JSON.stringify(this.attributes))
  },

  changeId: function(newId){
    //console.log('changeId')
    let personIds = JSON.parse(App.storage.getItem('persons')) || [];
    if (personIds.length){
      personIds[personIds.indexOf(this.id)] = newId;
    }else{
      personIds.push(newId);
    }
    App.storage.removeItem('person_'+this.id);
    App.storage.setItem('persons', JSON.stringify(personIds));
    this.id = this.attributes.id = newId;
    App.storage.setItem('person_'+this.id, JSON.stringify(this.attributes));
  },

  removeLocal: function(){
    let personIds = JSON.parse(App.storage.getItem('persons') || '[]');
    if (personIds && personIds.indexOf(this.id) >= 0) {
      personIds.splice(personIds.indexOf(this.id), 1);
      App.storage.setItem('persons', JSON.stringify(personIds));
    }
    App.storage.removeItem('person_'+this.id);

    this.collection.remove(this);

    if (App.syncOn() && (this.get('synced') || (typeof this.id == 'number'))){
      $.ajax({
        url: '/people/'+this.id,
        type: 'DELETE',
        dataType: 'JSON'
      })
    }
  },

  guid: () => {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }


});