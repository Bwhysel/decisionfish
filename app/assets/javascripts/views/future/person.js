App.Views.PersonForm = Backbone.View.extend({
  template: JST['templates/future/family/form'],
  sexModalTpl: JST['templates/future/family/sex_modal'],

  initialize: function(options){
    this.parentView = options.parentView;
    Backbone.Validation.bind(this, {
      model: this.model
    });
    this.model.bind('validated', (isValid, model, errors) =>{
      if (!errors.income){
        //console.log('validate income')
        this.validateInput(this.$incomeInput);
      }
    })
  },

  events: {
    'click .form-group': 'selectFormGroup',
    'click .form-group>label': 'selectFormLabel',
    'focusin input': 'selectInput',
    'focusout input': 'deselectInput',
    'keyup input': 'keyupInput',
    'keydown input[name=sex]': 'blockInput',
    'click .icon-cross': 'close',
  },

  close: function(event){
    if (this.model.isEmpty()){
      this.destroy();
      this.model.removeLocal();
    } else {
      const sex = this.model.get('sex')
      let he_s = sex == 'Female' ? 'she' : sex == 'Male' ? 'he' : 'they';
      App.simplePage.openConfirmationDialog({
        content: `Are you sure you want to delete ${this.model.get('name')}? How will ${he_s} feel about it? ;-)`,
        btnTitle: 'DELETE'
      }, () => {
        this.destroy();
        this.model.removeLocal();
      })
    }
  },

  blockInput: function(event){
    if (event.keyCode != 9) return false;
  },

  destroy: function(){
    this.stopListening().undelegateEvents();
    this.$el.remove();
  },

  showEmailPhoneFields: function(){
    //this.$el.find('input[name=email], input[name=phone]').parent().removeClass('hidden')
    this.$el.find('input[name=phone]').parent().removeClass('hidden')
  },

  render: function(options){
    let block = $('#family-screen [role=adults]').append(this.template(this.model.attributes))
    this.setElement(block.children().last())

    this.$closeEl = $('.icon-cross', this.$el);

    this.$el.find('.form-group').forEach((block) => {
      const $block = $(block)
      if ($block.find('input').val().length){
        $block.removeClass('unfilled')
      } else {
        $block.addClass('unfilled')
      }
    })

    this.$incomeInput = this.$el.find('input[name=income]');
    VMasker(this.$incomeInput).maskMoney({
      precision: 0,
      delimiter: ',',
      unit: '$ '
    });
    VMasker(this.$el.find('input[name=age]')).maskNumber()

    //VMasker(this.$el.find('input[name=phone]')).maskPattern('+9(999)999-99-99999')
    VMasker(this.$el.find('input[name=phone]')).maskPattern('(999) 999-9999')

    if (options.validate){ this.validate(); }
  },

  selectFormGroup: function(event){
    const $target = $(event.target)
    if ($target.hasClass('ask-desi') || $target.hasClass('icon-cross')) { return true; }
    const $block = $(event.currentTarget).addClass('active')
    $block.children('input').trigger('focusin')
  },

  selectFormLabel: function(event){
    const klass = event.target.className;
    if (klass && klass.indexOf('ask-desi')>= 0) return true;
    $(event.currentTarget).siblings('input').focus();
    event.preventDefault();
    return false;
  },

  selectInput: function(event){
    const $input = $(event.target)
    $block = $input.closest('.form-group')

    this.deselectFormGroup($block.siblings('.active'));
    $block.addClass('active')
    if ($input.hasClass('amount') && !$input.val().length){
      $input.val('$ ')
    }else if ($input[0].name == 'sex'){

      let modal = App.utils.createModal(
        'sex-modal', {
          beforeClose: function(next){
            $('h1').focus();
            next();
          }
        }, this.sexModalTpl, {}
      )
      if (modal){
        $('[role=submit-modal]', modal.dialog).on('click', (evenet) => {
          modal.close();
          let text = $('p.active', modal.dialog).text();
          if (text) {
            $input.val(text).trigger('keyup');
            this.model.updateParam('sex', text);
          }
        })
        const choices = $('p.sex-option', modal.dialog)
        choices.on('click', this.selectSex.bind(this))
        choices.on('keydown', function(event){
          const code = event.keyCode;
          const curP = $(event.currentTarget);
          let p;
          if (code == 38){ // UP
            p = curP.prev()
            if (!p.length) p = $(choices[choices.length])
          }else if (code == 40){ // DOWN
            p = curP.next()
            if (!p.length) p = $(choices[0])
          }
          if (p) p.focus().trigger('click')
        });
      }
    }
  },

  deselectInput: function(event){
    const $input = $(event.currentTarget);
    const $block = $input.closest('.form-group')
    setTimeout(()=> {
      if ($block.hasClass('active')){ // check to avoid bad jumps
        this.deselectFormGroup($block);
      }
    }, 5)
    let result = this.validateInput($input);

    let inputName = $input[0].name;

    let val = $input[0].value;
    if (inputName == 'income'){ val = App.utils.parseMoney(val) }

    this.model.updateParam(inputName, val);

    if ((inputName == 'income') && result){
      //console.log('on deselect')
      App.family.each((p)=>{
        if (p.get('id') != this.model.get('id')){
          p.validate();
        }
      })
    }

    if (result && (inputName == 'phone') && App.storage.is('wrong_phone')){
      this.updatePhoneOnVerify();
    }
  },

  updatePhoneOnVerify: function(){
    $.ajax({
      url: '/user/update_phone', type: 'PATCH', dataType: 'json',
      data: { phone: this.model.get('phone') },
      success: (data) => {
        if (data.result == 'ok'){
          App.simplePage.openDesiModal(data.msg)
          App.storage.clear('wrong_phone')
        }
      }
    })
  },

  validateInput: function($input, silent){
    let name = $input[0].name;
    let value = $input.val();
    if (name=='income') value = App.utils.parseMoney(value);
    let errorMessage = this.model.preValidate(name, value)
    let result = errorMessage.length == 0;
    if (silent){
      this.parentView.checkNextNavigation(result ? null : {disabled: true});
    } else {
      $input.next().remove()
      let checkOpts = {}
      if (result){
        $input.removeClass('error');
      } else {
        $input.addClass('error');
        $(`<p class='error-msg'>${errorMessage}</p>`).insertAfter($input);
      }
      this.parentView.checkNextNavigation();
    }
    return result;
  },

  deselectFormGroup: function($block){
    if (!$block.length) return;
    const $input = $block.children('input')
    $block.removeClass('active')
    if ($input.hasClass('amount') && $input.val() == '$ '){
      $input.val('');
      $block.addClass('unfilled');
    }
  },

  keyupInput: function(event){
    const input = event.currentTarget
    const $input = $(input)

    let newValue = input.value

    const $block = $input.closest('.form-group')
    if (newValue.length){
      $block.removeClass('unfilled')
    }else{
      App.utils.timeout(this, ()=>{
        if (!$input.val().length){
          $block.addClass('unfilled')
        }
      }, 1200, 'input_unfill_long_check')
    }
    if ($input.hasClass('error')){
      this.validateInput($input);
    } else if (event.keyCode != 9 && (newValue.length > 1)){ // Tab pressed
      App.utils.timeout(this, ()=>{
        this.validateInput($input, true);
      }, 100, 'person_input_check')
      App.utils.timeout(this, ()=>{
        this.validateInput($input);
      }, 2000, 'person_input_check_with_alert')
    }
  },

  selectSex: function(event){
    const p = $(event.currentTarget);
    p.addClass('active').siblings('.active').removeClass('active');
  },

  validate: function(){
    result = true;
    this.$el.find('input').forEach((input) => {
      let $input = $(input);
      if ($input.parent().hasClass('hidden')) return
      if (!this.validateInput($(input))){
        result = false;
      }
    })
    return result;
  }

})
