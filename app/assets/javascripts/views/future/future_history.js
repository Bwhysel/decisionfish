App.Views.FutureHistory = Backbone.View.extend({
  elementSelector: '#future-history-screen',
  mainTemplate: JST['templates/future/future_history'],

  events: {
  },

  render: function(step){
    let steps = _.clone(this.steps);
    const childrenCount = App.family.childrenYears.length;
    if (childrenCount == 0){
      steps.splice(0,3) // remove college & parent_contribute steps
    }
    const isOneChild = childrenCount == 1;

    let stepIndex = steps.indexOf(step)

    if (stepIndex < 0) { step = steps[stepIndex = 0] };
    this.onLastPage = stepIndex == (steps.length - 1);

    const prevStep = stepIndex == 0 ? 'big_decision' : 'future_history/' + steps[stepIndex-1]
    const nextStep = this.onLastPage ? 'projected_net_worth' : 'future_history/' + steps[stepIndex+1]

    const adultsCount = App.family.length;

    const personsCount = childrenCount + adultsCount;
    const name1 = App.family.at(0).get('name')
    const name2 = adultsCount > 1 ? App.family.at(1).get('name') : null

    let names = name1;
    if (name2){ names = names + ' and ' + name2 }
    const funding = App.retirementFunding.attributes;
    let rows = [];
    let s = '';
    const childrenS = isOneChild ? 'child' : 'children';
    switch(step){
    case 'children':
      rows.push(`You will have ${childrenCount} ${childrenS}.`)
      break;
    case 'college':
      rows.push(`You will send ${isOneChild ? 'your child' : 'them'} to ${App.finAssumptions.getCollegeType()} college or university.`)
      rows.push(`Your ${childrenS} will complete their studies in ${parseFloat(App.finAssumptions.get('years_in_college'))} years`)
      break;
    case 'contribute':
      const c_savings = App.finances.get('college_savings');
      const req_college = App.utils.toMoney(funding.req_college);
      rows.push(`You will contribute ${App.bigDecision.get('parent_contribute')}% of the net cost of ${isOneChild ? "your child's" : "their"} higher education.`)
      s = `You have saved ${App.utils.toMoney(c_savings)} of the ${req_college} you intend to contribute for college. `;
      if (c_savings > 0) { s = s + 'Well done!' }
      rows.push(s)
      break;
    case 'retire':
      const retire_age = App.bigDecision.get('retire_age')
      rows.push(`You will retire at age ${retire_age}.`)
      if (retire_age>62){
        rows.push("Caution: Will you be healthy and employable until then? A younger retirement age might be more realistic.")
      }
      break;
    case 'retirement_expenses':
      const change = App.finAssumptions.get('retirement_expence_change');
      const Y = change > 0 ? 'increase' : change < 0 ? 'reduce' : 'maintain';
      const Z = change == 0 ? 'at' : 'by ' + App.utils.toMoney(Math.abs(change)) + ' to';
      const retExp = App.utils.toMoney(funding.retirement_expenses);
      rows.push(`When you retire, you will ${Y} expenses ${Z} ${retExp} every month.`);
      break;
    case 'retirement_savings':
      const req_retire = funding.req_retire;
      const studentLoans = App.finances.get('student_loans');
      const X = App.finances.get('cash') + App.finances.get('retirement_savings')
      let percent = Math.round(X / req_retire*100);
      percent = percent ? ` (${percent}%)` : '';
      s = `You have saved ${App.utils.toMoney(X)}${percent} of the ${App.utils.toMoney(req_retire)} required for retirement.`
      if (studentLoans>0){s = s + " A good start! "}
      rows.push(s);

      if (App.finances.get('home_value') > 0 && !funding.success_liquid){
        rows.push(`(You may need to sell or mortgage your home if/when you run out of cash around when ${name1}'s age ${funding.until_age_liquid}.)`)
      }
      break;
    case 'insurance':
      if (personsCount == 1){
        rows.push("You may not need life insurance if you have no one depending on your income.");
      }else {
        s = `Consider a life insurance policy of ${App.utils.toMoney(funding.insurance1)}`
        if (adultsCount>1){s = s + ` for ${name1} and ${App.utils.toMoney(funding.insurance2)} for ${name2}`; }
        s = s + '.';
        rows.push(s);
      }
      break;
    case 'investments':
      const cash = App.finances.get('cash')
      const exp = funding.base_expenses;
      const months = cash == 0 ? 0 : exp == 0 ? 12 : Math.round( cash / exp * 10) / 10
      rows.push(`Your cash/investments are equal<br/> to ${months} months of expenses.`);
      rows.push(`Is this enough to meet emergencies?`);
      break;
    case 'conclusion':
      rows.push(`Are you happy with this story? If so, press next to see potential future. If not, you can go back and try again.`)
      break;
    }
    /** // SOCIAL SECURITY STEP
    Soc_Sec_Starts = App.retirementFunding.soc_sec_starts
        Soc_Sec_Adj = App.retirementFunding.soc_sec_adj * 100
        Soc_Sec_Total = App.retirementFunding.soc_sec_total
        if (Soc_Sec_Starts < 62){
          s = "Note: Social Security does not pay before age 62."
        }else if(Soc_Sec_Starts < 67){
          s = `Social Security will pay only ${Soc_Sec_Adj}% of the standard benefit. Consider waiting until age 67 to get 100%.`
        }else {
          s = `Social Security pays ${Soc_Sec_Adj}% of the standard benefit.`
        }
        `${s} The estimated standard monthly benefit is ${SocSecTotal}.`
    **/
    App.transitPage(this.mainTemplate({
      prevStep: prevStep,
      nextStep: nextStep,
      step: step,
      names: names,
      data: this.stepsData[step],
      text: rows
    }))

    this.setElement($(this.elementSelector))
    this.$el.find('[data-source=steps-progress]').html(App.simplePage.circleProgressTpl({
      stepIndex: stepIndex,
      stepsCount: steps.length
    }))
    App.utils.setPageHeight(this.el);
  },

  steps: [
    'children', 'college', 'contribute', 'retire', 'retirement_expenses',
    'retirement_savings', 'insurance', 'investments', 'conclusion'
  ],
  stepsData: {
    'children': {
      image: 'img-children',
    },
    'college': {
      image: 'img-college',
      hint: "future_history_college"
    },
    'contribute': {
      image: 'img-college-contribute',
    },
    'retire': {
      image: 'img-retire',
    },
    'retirement_expenses': {
      image: 'img-retirement-expenses',
    },
    'retirement_savings': {
      image: 'img-retirement-savings',
    },
    'insurance': {
      image: 'img-insurance',
    },
    'investments': {
      image: 'img-emergencies',
      hint: "future_history_investments",
    },
    'conclusion': {
      image: 'img-conclusion',
    }

  },

})