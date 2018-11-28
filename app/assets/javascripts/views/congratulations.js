App.Views.Congratulations = Backbone.View.extend({
  container: '#page-content > .container',
  mainTpl: JST['templates/simple_pages/congratulations'],
  diplomaFrameTpl: JST['templates/simple_pages/diploma_frame'],
  retirementTpl: JST['templates/future/diploma'],
  budgetTpl: JST['templates/budget/diploma'],
  savingsTpl: JST['templates/savings/diploma'],

  events: {
    'click [role=download-link]': 'onDownload',
  },

  onDownload: function(event){
    event.preventDefault();
    this.downloadFile();
    return false;
  },

  downloadFile: function(){
    saveAs(this.blobData, this.downloadTitle);
  },

  render: function(kind){
    let params = this.getCongratParams(kind);
    App.transitPage(this.mainTpl(params))
    this.setElement($('#'+params.container_id))

    this.renderDiploma(this.$el, params)
  },

  getCongratParams: function(kind){
    this.kind = kind;
    const paramsFn = kind == 'retirement' ? 'getRetirementParams' :
                   kind == 'budget' ? 'getBudgetParams' : 'getSavingsParams';
    let params = this[paramsFn]();
    const [name1, name2] = App.family.getNames();
    params.data.name_pair = name2 ? `${name1} & ${name2}` : name1;
    return params;
  },

  renderDiploma: function($diploma, params, downloadOnRender){
    this.downloadTitle = params.downloadTitle;

    // load diploma markup
    $diploma.find('#diploma-placeholder').html(this.diplomaFrameTpl())
    // load diploma content
    $diploma.find('#diploma-inner-placeholder').replaceWith(params.diplomaTpl(params.data))
    // some feature-specific actions on loaded DOM
    this[params.fn]($diploma);

    // generating the image
    html2canvas($diploma.find('#diploma')[0], {
      onrendered: (canvas) => {
        //console.log('html2canvas: image generated')
        // canvas.toBlob - is not supported by all browsers, so we need to take DIY way
        const data = canvas.toDataURL("image/png")
        this.blobData = this.base64toBlob(data.substr(22, data.length), 'image/png');

        if (this.hiddenElements){ this.hiddenElements.removeClass('hidden'); }

        if (downloadOnRender){
          this.downloadFile();
        }
      }
    });
  },

  getRetirementParams: function(){
    return {
      links: {
        back: '/projected_net_worth',
        backSpecial: true,
        next: '/future_final',
        intro: '/future_intro'
      },
      title: 'Congratulations…<br/>Your plan is done!',
      container_id: 'future-final-screen',
      diplomaTpl: this.retirementTpl,
      fn: 'resetRetirementValues',
      downloadTitle: 'Financial Plan.png',
      data: {}
    }
  },

  getBudgetParams: function(){
    let data = {titles: {}, pairs: []};
    const categories = App.budgetCategories.categoryNames;
    for(let i = 0; i<8; i++){ // Assume we have 16 categories plus 1 savings category
      data.pairs.push([categories[i], categories[i+8]]);
    }
    data.pairs.push([categories[16]]);
    _.each(App.budgetCategories.captions, (attrs, key) => {
      data.titles[key] = attrs.title;
    })

    return {
      links: {
        back: '/budget_finalize',
        next: '/budget_tracking',
        intro: '/budget_intro'
      },
      title: 'Congratulations…<br/>Your Happy Budget<sup>®</sup><br/>is done!',
      container_id: 'budget-final-screen',
      diplomaTpl: this.budgetTpl,
      fn: 'resetBudgetValues',
      downloadTitle: 'Happy Budget.png',
      data: data
    }
  },

  getSavingsParams: function(){
    App.investments.calcOpportunities();
    let data = App.investments.getThisMonth();

    let sum401 = 0;
    for(var i=0; i<data.investments.length; i++){
      let x = data.investments[i];
      if (x.title.indexOf('401k')<0) { continue }
      sum401 = sum401 + x.thisMonth;
    }
    if (sum401>0){
      let p401 = sum401 / App.family.at(0).get('income') * 12 * 100;
      p401 = VMasker.toPercent(p401)
      sum401 = App.utils.toMoneyWithCents(sum401)
      data.msg401 = `This includes a total 401(k) contribution of ${sum401}, which is ${p401} of your salary. Make sure the correct amount is being deferred from your paycheck to your 401(k).`
    }else{
      data.msg401 = false
    }

    const curDate = new Date();
    data.period = curDate.toLocaleDateString('en-us', {month: 'long'});
    data.period += ', ' + curDate.getFullYear();

    return {
      links: {
        back: '/savings_month_plan',
        next: '/savings_final',
        intro: '/savings_intro'
      },
      title: 'Congratulations, Your<br/>Investment Plan is Done!',
      container_id: 'savings-final-screen',
      diplomaTpl: this.savingsTpl,
      fn: 'resetSavingsValues',
      downloadTitle: 'Investment Plan.png',
      data: data
    }
  },

  resetRetirementValues: function($el){
    const decisions = App.bigDecision.attributes;
    $el.find('[data-name=savings]').text(App.utils.toMoney(decisions.monthly_savings));
    $el.find('[data-name=retire_age]').text(decisions.retire_age);
    $el.find('[data-name=parent_contribute]').text(''+parseInt(decisions.parent_contribute)+'%');
    const funding = App.retirementFunding.attributes;
    const [age1, age2] = [ funding.until_age1, funding.until_age2 ]
    const ages = age2 ? `${age1}/${age2}` : age1;
    $el.find('[data-name=until_age]').text(ages);
    const isSafe = funding.success;
    $el.find('[data-name=success]').text(isSafe ? 'SAFE' : 'UNSAFE');
  },

  resetBudgetValues: function($el){
    App.budgetCategories.categoryNames.forEach((category) => {
      $el.find(`[data-name=${category}]`).text(App.utils.toMoney(App.budgetCategories.get(category)))
    })
    $el.find('[data-name=at_income_r]').text(App.utils.toMoney(App.retirementFunding.get('at_income_r')))
  },

  resetSavingsValues: function($el){
    this.hiddenElements = $el.find('.ask-desi').addClass('hidden');
  },

  base64toBlob: function(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  },


})