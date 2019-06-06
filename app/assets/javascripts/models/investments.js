App.Models.Investments = Backbone.Model.extend({
  key: 'investments',

  defaults: {
    p401_percent_income_1: 3.0,
    p401_percent_income_2: 3.0,
    p401_percent_match_1: 50.0,
    p401_percent_match_2: 50.0,
    efund_months: 6,
    efund_current: null, // money, not months
    your_amounts: {},
    new_charges: {},
  },

  updateParam: function(attr, value, key){
    let prevVal = this.get(attr)
    if (attr == 'your_amounts' || attr == 'new_charges'){
      if (prevVal[key] == value) return false;
      prevVal[key] = value;
      value = prevVal;
    }else{
      if (prevVal == value) return false;
    }
    data = {synced: false}
    data[attr] = value;

    this.set(data);
    this.saveLocal();
    this.syncParams([attr]);
  },

  saveLocal: function(){
    App.storage.setItem(this.key, JSON.stringify(this.attributes))
  },

  restoreLocal: function(){
    let details = App.storage.getItem(this.key);
    if (details){
      details = JSON.parse(details);
      this.set(details)
    }
  },

  syncParams: function(fields){
    if (!App.syncOn() || this.get('synced')) return false;

    let data = this.attributes;
    fields ? data = _.pick(data, fields) : delete data.synced;

    $.ajax({
      url: '/investments', type: 'PATCH', dataType: 'json',
      data: data,
      success: (data) => {
        this.set('synced', true);
      },
      error: (xhr, errorStatus, error) => {
        console.log(error)
      }
    })
  },

  isFilled: function(){
    let total = 0;
    _.each(this.get('your_amounts'), (value, name) => {
      total += value;
    })
    return App.family.isValid() && (App.bigDecision.get('monthly_savings') == total) && App.budgetCategories.areBalanced();
  },

  getEfundCurrent: function(){
    let value = this.get('efund_current');
    return value == null ? parseInt(App.finances.get('cash')) : value;
  },

  getShortEfundTarget: function(value){
    if (!value){ value = this.getEfundCurrent(); }

    let targetMoney = Math.ceil(this.get('efund_months') * App.retirementFunding.getMonthExp() / 1000) * 1000;
    return Math.max(0, targetMoney - value);
  },

  getEfundProgress: function(value){
    let targetMoney = this.getShortEfundTarget(value);
    //let progress = value * this.get('efund_months') / (value + targetMoney);
    let progress = value / App.retirementFunding.getMonthExp()
    if ((value + targetMoney) == 0){
      progress = 0;
    }

    //console.log(value, progress, targetMoney);
    progress = parseFloat((Math.floor(progress * 10)/10).toFixed(1));
    return [ targetMoney, progress ]
  },

  calcOpportunities: function(force){
    if (this.opportunities && !force) return this.opportunities;
    rt_avg = App.finAssumptions.get('rt_avg');
    rt_cash = App.finAssumptions.get('rt_cash');

    let dupTitles = {}
    let opps = [];
    const itemized_deductions = false; // SOME CONSTANT
    const minPmnt = 25;
    const minPmntPercent = 0.01;
    ['credit_cards', 'student_loans', 'other_debts'].forEach((kind)=>{
      let names = App.loans.get(`${kind}_names`);
      let rates = App.loans.get(`${kind}_rates`);
      let taxExempt = (kind == 'student_loans') && itemized_deductions;
      App.loans.get(kind).forEach((balance, i) => {
        let curName = names[i];
        let dupCount = dupTitles[curName] = (dupTitles[curName] || 0) + 1 // 0 - zero dups, 1 - two dup, etc.
        if (dupCount>1) { curName = `${curName} (${dupCount-1})`; }
        let opp = {
          title: curName, balance: balance, grossReturn: rates[i]/100,
          isDebt: true, isTaxExempt: taxExempt, field: `${kind}#${i}`
        }
        opp.debtIn = opp.grossReturn * opp.balance /12
        // Column Min Debt Payment (we do not need to store both minDebtPmnt & minPayments)
        opp.allocMinPmnt = Math.max(
          kind == 'credit_cards' ? opp.debtIn + opp.balance * minPmntPercent : 2 * opp.debtIn,
          Math.min(opp.balance, minPmnt)
        )
        opps.push(opp)
      })
    })
    let mortgage = App.finances.get('mortgage');
    if (mortgage > 0){
      let opp = {title: 'Mortgage', balance: mortgage, grossReturn: App.finAssumptions.get('mortgage_rate'),
          isDebt: true, field: 'mortgage', isTaxExempt: itemized_deductions}
      opp.debtIn = opp.grossReturn * opp.balance /12
      opp.allocMinPmnt = Math.round(App.retirementFunding.get('mortgage_payment'))
      opps.push(opp)
    }

    const k147 = parseInt(App.family.at(0).get('income')) * this.get('p401_percent_income_1') / 100;
    const isSingle = App.family.length==1
    const l147 = isSingle ? 0 : parseInt(App.family.at(1).get('income')) * this.get('p401_percent_income_2') / 100;
    const sumMatch401 = k147+l147
    const matchAvg401k = sumMatch401==0 ? 0 : (k147 * this.get('p401_percent_match_1') + l147 * this.get('p401_percent_match_2')) / sumMatch401;

    const max401k = function(age){return age < 50 ? 18000 : 24000; }
    const age1 = parseInt(App.family.at(0).get('age'));
    const age2 = isSingle ? 0 : parseInt(App.family.at(1).get('age'));
    const k163 = max401k(age1)
    const l163 = isSingle ? 0 : max401k(age2)

    const k167 = 0.005 //401k Excess Fees
    const k168 = 0.001
    const k169 = 0.001
    const k170 = 0.001
    const k171 = 0.000

    let efundTarget = this.getShortEfundTarget();

    opps.push({field: 'match401k',             title: '401k (Match)',
               balance: sumMatch401,           grossReturn: rt_avg - k167,
               isTaxExempt: true, isTaxDeffered: true, debtIn: 0});

    opps.push({field: 'unmatched401k',         title: '401k (Unmatched)',
               balance: k163+l163-sumMatch401, grossReturn: rt_avg - k167,
               isTaxExempt: true, isTaxDeffered: true, debtIn: 0});

    opps.push({field: 'ira_roth',              title: 'IRA (Roth)',
               balance: 5500,                  grossReturn: rt_avg - k168,
               isTaxExempt: true, debtIn: 0});

    opps.push({field: 'ira_traditional',       title: 'IRA (Traditional)',
               balance: 5500,                  grossReturn: rt_avg - k169,
               isTaxExempt: true, isTaxDeffered: true, debtIn: 0});

    opps.push({field: 'plan_529',              title: '529 Plan',
               balance: 14000,                 grossReturn: rt_avg - k170,
               isTaxExempt: true, debtIn: 0});

    opps.push({field: 'taxable_investments',   title: 'Taxable investments',
               balance: 9999999,               grossReturn: rt_avg - k171, debtIn: 0});

    opps.push({field: 'bank_savings',          title: 'Bank Savings', balance: (efundTarget>0 ? efundTarget : 9999999),
               grossReturn: rt_cash - 0.01, priority: (efundTarget > 0), debtIn: 0});

    function FV(rate, nper, pmt, pv, type) {
      let pow = Math.pow(1 + rate, nper),
         fv;
      if (rate) {
       fv = (pmt*(1+rate*type)*(1-pow)/rate)-pv*pow;
      } else {
       fv = -1 * (pv + pmt * nper);
      }
      return fv;
    }

    let taxRate = App.retirementFunding.get('tax_rate');
    let taxRateRetirement = App.retirementFunding.get('retirement_tax_rate');
    let firstRetirementYear = App.bigDecision.get('retire_age') - Math.max(age1, age2);
    let zeroCount = 0;
    let totalDebtBal = 0;
    let k404 = 0.25 // Net Return Guess
    opps.forEach((opp) => {
      opp.debtIn = opp.isDebt ? opp.grossReturn * opp.balance /12 : 0;
      opp.pv = 1
      if (opp.isTaxDeffered){
        opp.pv =  1/(1-taxRate) + (opp.title == '401k (Match)' ? matchAvg401k/100 : 0);
      }
      opp.annualReturn = opp.grossReturn * (!!opp.isTaxExempt == !!opp.isDebt  ? 1 - taxRate : 1);
      //opp.annualReturn = Math.round(opp.annualReturn*10000)/10000

      opp.fv = FV(opp.annualReturn, firstRetirementYear, 0, -opp.pv, 0); // FV of $1
      if (opp.isTaxDeffered){ opp.fv -= (opp.fv-1)*taxRateRetirement }

      if (opp.balance > 0){
        opp.netReturn = Math.pow(opp.fv, 1/firstRetirementYear)- 1;
        opp.netReturn = Math.round(opp.netReturn * 100000) / 100000;
      }else{
        opp.netReturn = 0;
      }
      //adjNetReturn = IFERROR([@[Net Return]]+0.1/[@[Balance/Max]]*([@[Balance/Max]]>0)+CODE([@Opportunity])/100000,COUNTIF(C$382:C382,0)/10000)

      if (opp.title){
        opp.adjNetReturn = opp.netReturn+(opp.balance > 0 ? 0.1/opp.balance : 0) + opp.title.charCodeAt(0)/100000
        if (opp.priority){ opp.adjNetReturn++; }
      }else{
        opp.adjNetReturn = (++zeroCount) / 10000;
      }

      totalDebtBal += opp.debtBal = opp.isDebt ? opp.balance : 0;
    })
    opps = _.sortBy(opps, (x)=> { return -x.adjNetReturn; })

    let monthlySavings = App.bigDecision.get('monthly_savings')
    let prevWaterfall = monthlySavings
    let prevCounter = 0
    let prevDebtCount = 0
    let prevInvestCount = 0

    let yourAmounts = this.get('your_amounts');
    let newCharges = this.get('new_charges');
    let fields = [];

    const minPmnts = App.budgetCategories.get('credit_card');

    opps.forEach((opp, i) => {
      opp.earningsPer100 = parseFloat(opp.netReturn) * 100
      opp.reorderedMax = Math.min(monthlySavings, opp.balance)
      opp.waterfall = Math.max(0, prevWaterfall-opp.reorderedMax)
      opp.investment = prevWaterfall - opp.waterfall
      prevWaterfall = opp.waterfall

      opp.earn = opp.investment * opp.earningsPer100 / 100
      opp.earningsPer100 = parseFloat(opp.earningsPer100.toFixed(2));


      opp.counter = prevCounter + (opp.investment > 0 ? 1 : 0)
      prevCounter = opp.counter

      prevDebtCount = opp.debtCount = prevDebtCount + (opp.isDebt ? 1 : 0)
      prevInvestCount = opp.investCount = prevInvestCount + (!opp.isDebt ? 1 : 0)

      fields.push(opp.field);
      if (!yourAmounts.hasOwnProperty(opp.field)){ yourAmounts[opp.field] = 0 }
      if (opp.isDebt && !newCharges.hasOwnProperty(opp.field)){ newCharges[opp.field] = 0 }
    })

    _.each(yourAmounts, (value, name)=>{
      if (fields.indexOf(name)< 0){
        delete yourAmounts[name];
        delete newCharges[name];
      }
    })

    this.opportunities = opps;
    return opps
  },

  getThisMonth: function(){
    let debts = [];
    let investments = [];
    let debtTotal = 0;
    let investTotal = 0;
    const yourAmounts = this.get('your_amounts');
    const newCharges = this.get('new_charges');
    this.opportunities.forEach((opp) => {
      let attrs = _.pick(opp, ['title', 'allocMinPmnt']);
      attrs.thisMonth = yourAmounts[opp.field];
      if (opp.isDebt){
        // duplication in plan_month.js
        let debtToBeRepaid = attrs.thisMonth;
        if (opp.field == 'mortgage'){
          debtToBeRepaid += App.retirementFunding.get('mortgage_payment') - opp.allocMinPmnt;
        }
        attrs.thisMonth = parseFloat((debtToBeRepaid+newCharges[opp.field]+opp.allocMinPmnt).toFixed(2))
        if (attrs.thisMonth > 0){
          debts.push(attrs);
          debtTotal += attrs.thisMonth;
        }
      }else{
        if (attrs.thisMonth > 0){
          investments.push(attrs)
          investTotal += attrs.thisMonth;
        }
      }
    })
    return {
      debts: debts,
      investments: investments,
      totalDebt: parseFloat(debtTotal.toFixed(2)),
      totalInvest: parseFloat(investTotal.toFixed(2))
    };
  }

})