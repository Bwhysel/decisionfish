App.Views.Reminder = Backbone.View.extend({
  template: JST['templates/dashboard/reminder'],

  initialize: function(options){},

  events: {
    'click .reminder-calendar': 'onCalendarClick',
    'click .reminder-reset': 'onCalendarReset',
  },

  render: function(){
    const rootLocation = $('#reminder-placeholder')
    if (rootLocation.length){
      this.initCalendar(rootLocation);
    }
  },

  initCalendar: function(rootEl){
    const dateFormat = "MM/DD/YYYY h:mm a"
    let minDate = moment().add(1, 'days')
    let maxDate = moment().endOf('year')

    let initialDate;
    if (App.reminder){
      if (App.reminder.isNew){
        initialDate = new Date()
        initialDate.setDate(initialDate.getDate()+7)
        initialDate.setMinutes(0)
        initialDate.setSeconds(0)
        this.sendRemind(moment(initialDate))
      }else{
        initialDate = App.reminder.next ? new Date(App.reminder.next*1000) : null
      }
    }

    let initialS = initialDate ? moment(initialDate).format(dateFormat) : null

    rootEl.replaceWith(this.template({hasDate: initialDate != null, initial: initialS}))
    this.setElement($('.reminder-container'))

    var remInput = $('#reminder-input')[0]

    this.dateDialog = new mdDateTimePicker.default({
      type: 'date', init: (initialDate ? moment(initialDate) : moment().add(7, 'days')),
      orientation: 'PORTRAIT', past: minDate, future: maxDate, trigger: remInput
    })

    this.timeDialog = new mdDateTimePicker.default({
      type: 'time', orientation: 'PORTRAIT', past: minDate, future: maxDate, trigger: remInput
    })

    let dateDialogOpened;
    $('.reminder-calendar').on('click', () => {
      this.dateDialog.toggle()
      dateDialogOpened = true
    })

    remInput.addEventListener('click', () => {
      this.dateDialog.toggle()
      dateDialogOpened = true
    })
    remInput.addEventListener('onOk', ()=>{
      let v
      if (dateDialogOpened){ // date dialog submit
        dateDialogOpened = false
        v = this.dateDialog.time
        this.timeDialog.time = v
        this.timeDialog.toggle()
      }else{ // time dialog submit
        v = this.timeDialog.time
      }
      remInput.value = v.format(dateFormat);
      this.sendRemind(v)
    })

  },


  onCalendarReset: function(event){
    this.dateDialog.time = moment().add(7, 'days')
    $('#reminder-input').val('')
    this.sendRemind(null)
  },

  sendRemind: function(mdate){
    if (!App.authorized) return false;
    let newTime = mdate ? mdate.unix() : 0;
    if (this.xhr) { this.xhr.abort() }
    this.xhr = $.ajax({
      url: '/remind_me',
      type: 'POST',
      data: { next_time: newTime },
      dataType: 'json',
      success: (data)=>{
        /*if (!App.reminder.isNew){
          let text = newTime == 0 ? "We won't remind you to come back." : `We will remind you to come back.`
          App.simplePage.openDesiModal(text);
        }*/
        App.reminder.isNew = false;
        App.reminder.next = data.next;
        App.reminder.period = data.period;
      },
      complete: ()=>{
        this.xhr = null;
      }
    })
  },

})