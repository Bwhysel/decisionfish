App.Views.Family = Backbone.View.extend({
  elementSelector: '#family-screen',
  template: JST['templates/future/family/index'],
  childTemplate: JST['templates/future/family/child'],
  relatedViews: [],

  initialize: function(options){
    //this.collection = options.collection;
    this.listenTo(this.collection, 'add', this.addOne)
    this.listenTo(this.collection, 'remove', this.removePerson)
    this.listenTo(this.collection, 'resetChildren', this.resetChildrenDom)
    this.listenTo(this.collection, 'reset', this.resetAdults)
    this.fakeChild = new App.Models.Child({})
    Backbone.Validation.bind(this, {model: this.fakeChild });
  },

  events: {
    'click [role=add-adult]': 'clickAddAdult',
    'click [role=add-child]': 'clickAddChild',
    'click [role=remove-child]': 'clickRemoveChild',
    'focusout [role=children] input': 'deselectChildInput',
    'keyup [role=children] input': 'keyUpChildInput',
    'click #next-btn': 'clickNext'
  },

  // To wait for validation on focusout
  clickNext: function(event){
    if (this.forceNext) {
      if (App.authorized){
        this.forceNext = false;
        return true
      }else{
        this.submitEmailPhone();
        return false;
      }
    }
    setTimeout(()=>{
      const t = $(event.target);
      if (!t[0].disabled){
        this.forceNext = true
        t.trigger('click')
      }
    },100)
    return false;
  },

  clickAddAdult: function(event){
    this.collection.add({});
    this.checkNextNavigation({disabled: true});
  },

  removePerson: function(model){
    let hideCloseIcon = this.collection.length == 1
    let viewToDelete;
    this.relatedViews.forEach((view) => {
      if (view.model == model){
        viewToDelete = view
        view.destroy();
      }else{
        if (hideCloseIcon){
          view.$closeEl.addClass('hidden')
        }else{
          view.$closeEl.removeClass('hidden')
        }
      }
    })
    this.relatedViews.splice(this.relatedViews.indexOf(viewToDelete), 1)
    if (this.relatedViews.length){ this.relatedViews[0].showEmailPhoneFields(); }
    this.checkNextNavigation();
  },

  resetAdults: function(models, options){
    //console.log('resetAdults')
    options.previousModels.forEach((prevModel) => {
      this.removePerson(prevModel)
    });
    models.forEach((model) => {
      this.addOne(model, this.collection, { validate: true } )
    });
  },

  addOne: function(person, collection, opts){
    const initialEmail = App.storage.getItem('initial_email')
    if (initialEmail){
      person.set('email', initialEmail)
      App.storage.removeItem('initial_email')
    }
    const personForm = new App.Views.PersonForm({model: person, parentView: this})
    personForm.render({validate: opts.validate})

    this.relatedViews.push(personForm)

    if (this.collection.length == 1){
      personForm.$closeEl.addClass('hidden')
    } else {
      this.relatedViews.forEach(function(view){
        view.$closeEl.removeClass('hidden')
      })
    }
    if (this.relatedViews.length == 1){
      personForm.showEmailPhoneFields()
    }

    return true
  },

  render: function(){
    this.relatedViews = [];
    App.transitPage(this.template({}))
    this.setElement($(this.elementSelector))

    this.nextBtn = this.$el.find('#next-btn')[0];
    this.childrenPanel = this.$el.find('[role=children] .panel');

    if (this.collection.length) {
      this.collection.forEach((person) => {
        this.addOne(person, this.collection, {validate: true});
      })
    } else{
      this.$el.find('[role=add-adult]').trigger('click')
    }
    let childrenYears = this.collection.childrenYears;
    if (childrenYears.length){
      this.resetChildrenDom();
    }else{
      this.childrenPanel.addClass('hidden')
    }
  },

  addChild: function(index, childYear = '', validate = false){
    this.childrenPanel.removeClass('hidden')
    this.childrenPanel.append(this.childTemplate({index: index, year: childYear}))
    let $input = this.childrenPanel.children().last().find('input[name=year]')
    VMasker($input).maskPattern("9999")
    if (validate){
      this.validateYear($input)
    }
  },

  clickAddChild: function(event){
    this.collection.addChild()
    this.addChild(this.childrenPanel.children().length+1)
    this.checkNextNavigation({disabled: true})
  },

  resetChildrenDom: function(){
    let i = 0;
    this.collection.childrenYears.forEach((year) => {this.addChild(++i, year, true) })
  },

  clickRemoveChild: function(event){
    let $target = $(event.currentTarget);
    let $input = $target.siblings('input');
    let year = $input.val();
    let $block = $target.parent()
    let index = parseInt($input[0].dataset.index) - 1;
    $block.remove();

    this.collection.removeChild(index);

    $otherBlocks = this.childrenPanel.children();

    if (!$otherBlocks.length){
      this.childrenPanel.addClass('hidden')
    }else{
      let i = 0;
      $otherBlocks.forEach(function(block){
        $(block).find('[role=child-index]').text(++i);
        $(block).find('input')[0].dataset.index = i;
      })
    }

    this.checkNextNavigation();
  },

  validateYear: function($input, silent){
    let msg = this.fakeChild.preValidate('year', $input.val());
    $input.next().remove();
    let result  = msg.length == 0;
    if (silent){
      this.checkNextNavigation(result ? null : {disabled: true});
    } else {
      if (result){
        $input.removeClass('error');
      } else {
        $input.addClass('error');
        let newMsg = $(`<p class='error-msg'>${msg}</p>`)
        newMsg.insertAfter($input);
      }
      this.checkNextNavigation();
    }
    return result;
  },

  deselectChildInput: function(event){
    let $target = $(event.currentTarget)
    let v = this.validateYear($target)
    this.collection.updateChild({
      value: $target.val(),
      index: parseInt($target[0].dataset.index) - 1
    })
  },

  keyUpChildInput: function(event){
    let $target = $(event.currentTarget)
    if ($target.hasClass('error')){
      this.validateYear($target)
    }if (event.keyCode != 9 && ($target.val().length > 1)){ // Tab pressed
      App.utils.timeout(this, ()=>{
        this.validateYear($target, true);
      }, 100, 'children_input_check');
      App.utils.timeout(this, ()=>{
        this.validateYear($target);
      }, 2000, 'children_input_check_with_alert')
    }
  },

  checkNextNavigation: function(opts){
    App.utils.timeout(this, () => {
      let disabled = opts && opts.disabled;
      if (!opts){
        let unfilledCount = this.$el.find('.form-group.unfilled:not(.hidden)').length
        _.each(App.family.models, (m, i)=>{
          if ((i>0) && (!m.get('email'))){
            unfilledCount -= 1;
          }
        })
        disabled = unfilledCount || this.$el.find('.error-msg').length;
      }
      this.nextBtn.disabled = disabled;
    }, 30, 'familyNextBtn')
  },

  submitEmailPhone: function(){
    if (this.submitBlocked) return;
    let user = App.family.at(0);
    let person2 = App.family.at(1);

    let btn = $('#next-btn')[0];
    this.submitBlocked = true;
    btn.disabled = true
    $.ajax({
      url: '/signup', type: 'POST', dataType: 'json',
      data: {
        email: user.get('email'),
        phone: user.get('phone'),
        secondary_email: person2 ? person2.get('email') : '',
        years: this.collection.childrenYears,
        person1: user.getSyncData(),
        person2: person2 ? person2.getSyncData() : null
      },
      error: (xhr, errorType, error) => {
        App.simplePage.openDesiModal('Something whent wrong.')
      },
      success: (data, status, xhr) => {
        if (data.already_registered){
          //[Send me another link] | [Change my email address]
          let modal = App.simplePage.openConfirmationDialog({
            content: data.msg,
              btnTitle: 'SEND LINK', cancelTitle: 'CANCEL',
              reversedFooterBtns: true
            }, () => {
              App.simplePage.sendConfirmationLink(user.get('email'));
            });
          $('[role=close-modal]', modal.dialog).on('click', ()=>{
            let inp = this.$el.find('input[name=email]')[0]
            inp.focus();
            inp.select();
          })


        } else {
          if (data.result == 'ok'){ App.storage.set('email_sent'); }
          App.simplePage.openDesiModal(data.msg, ()=>{ location.href = "http://decisionfish.com" })
        }
      },
      complete: () => {
        this.submitBlocked = false;
        btn.disabled = false;
      }
    })
  },


})