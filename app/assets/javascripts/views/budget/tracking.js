App.Views.BudgetTracking = Backbone.View.extend({
  elementSelector: '#budget-tracking-screen',
  template: JST['templates/budget/tracking'],

  events: {
    'change input.checkbox': 'changeInput',
    'click #next-btn': 'onNextClick'
  },

  connectAccounts: function(event){
    App.importPage.render('tracking_accounts', null, (data)=>{
      //console.log(data);
      if (data.accounts > 0){
        this.haveAccounts = true;
      }else{
        App.simplePage.openDesiModal({currentTarget: {dataset: {
          text: "I haven't found any accounts for tracking.<br/><br/>Uncheck When box if you don't want me to help you track your spending."
        }}})
      }
      //this.model.updateBalances(data);
      //this.resetInputs();
    }, ()=>{
      this.render(this.step);
    })
  },

  onNextClick: function(event){
    let dataChecked = this.model.get('notify_period')
    if (dataChecked && !this.haveAccounts){
      event.preventDefault();
      this.connectAccounts();
      return false;
    }
    const whoChecked = this.$el.find('input[name=who_1]')[0].checked || this.$el.find('input[name=who_0]')[0].checked
    if (this.forceNext || dataChecked || !whoChecked){
      this.forceNext = false;
      this.haveAccounts = false; // to show Import page again
      return true;
    }
    event.preventDefault()

    let modal = App.simplePage.openConfirmationDialog({
        content: "Please check one box under When",
        btnTitle: 'OK', cancelTitle: 'NO, THANKS',
        reversedFooterBtns: true
      }, () => {});
    $('[role=close-modal]', modal.dialog).on('click', ()=>{
      setTimeout(()=>{
        App.simplePage.openDesiYesNoModal(
          "Don't you want me to help you track your spending?",
          () => { this.forceNext = true; $(event.target).trigger('click'); } // NO
        )
      },150)
    })
    return false;
  },

  render: function(revised){
    let data = {};
    App.transitPage(this.template({data: data}));
    this.setElement($(this.elementSelector));
    this.resetInputs();
  },

  resetInputs: function(){
    this.$el.find('input[name=who_1]')[0].checked = this.model.get('other_email') != null;
    let selectedPeriod = this.model.get('notify_period');
    this.$el.find('input.when-check').forEach((input) => {
      let [attr, index] = input.name.split('_');
      index = parseInt(index);
      input.checked = selectedPeriod == index;
    })
  },

  setOtherEmail: function(){
    let content = "Please enter secondary email"
    content += "<br/><br/><input type='email' name='email_modal' class='form-control'/><span class='error-msg'></span>";
    let emailRegexp = Backbone.Validation.patterns.email;
    let email = '';
    let success = false;
    let modal = App.simplePage.openConfirmationDialog({
        content: content,
        btnTitle: 'OK', cancelTitle: 'CANCEL',
        reversedFooterBtns: true
      },
      () => { success = true; }, // ok after validate
      () => { // onClose
        setTimeout(()=>{
          if (success){
            this.model.updateParam('other_email', email);
            this.$el.find('input[name=who_1]')[0].checked = true;
          }
        }, 20);
      },
      ()=> { // validate fn
        const flag = emailRegexp.test(email)
        $('.error-msg', modal.dialog).text(flag ? '' : 'Not valid email address')
        return flag;
    });
    let $input = $('input', modal.dialog);
    $input.on('keyup', () => { email = $input[0].value; })
  },

  changeInput: function(event){
    const input = event.target;
    let [attr, val] = input.name.split('_');
    val = parseInt(val);
    switch(attr){
      case 'who':
        if (val == 1){
          if (input.checked){
            input.checked = false;
            this.setOtherEmail();
          }else{
            this.model.updateParam('other_email', null)
          }
        }
        break;
      case 'when':
        let prevP = this.model.get('notify_period');
        if (prevP != null && prevP != 0 && prevP != val){
          this.$el.find(`input[name=when_${prevP}]`)[0].checked = false;
        }
        this.model.updateParam('notify_period', input.checked ? val : 0);
        break;
    };
  }

})