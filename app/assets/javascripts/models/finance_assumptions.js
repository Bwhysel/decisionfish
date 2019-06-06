App.Models.FinanceAssumptions = Backbone.Model.extend({
  key: 'finance_assumptions',

  recalculatables: ['net_college_cost', 'soc_sec1', 'soc_sec2'],
  recalculatablesChangedByUsers: {},
  recalculatablesOrigin: {},

  updateParam: function(attr, value, synced){
    if (this.get(attr) == value) return false;
    let data = {synced: synced || false}
    data[attr] = value

    if (App.differentDecisions && !synced){ App.differentDecisions.changed = true; }
    if (this.recalculatables.indexOf(attr) >= 0){
      this.recalculatablesChangedByUsers[attr] = this.recalculatablesOrigin[attr] != value;
    }

    this.set(data);
    this.saveLocal();
    return this;
  },

  wasChanged: function(){
    return this.get('synced') != true;
  },

  setRecalculatables: function(recalculated_vars, force){
    let needSave = false;
    this.recalculatables.forEach((key) => {
      const value = recalculated_vars[key];
      if (this.get(key) === null || force){
        this.recalculatablesOrigin[key] = value;
      }

      if (force){ this.recalculatablesChangedByUsers[key] = false }

      if (this.recalculatablesChangedByUsers[key] !== true){
        this.set(key, value);
        needSave = true;
      }
    })
    if (needSave) {
      this.saveLocal()
    }
  },

  setSynced: function(){
    if (App.authorized){this.set('synced', true).saveLocal(); }
    return this;
  },

  collegeTypeVariants: {
    0: 'Private Nonprofit 4Yr',
    1: 'Public 4Yr',
    2: 'Public 2Yr'
  },
  collegePricing: [
    [ 19340, 11820, 10710 ],
    [ 20390, 12970, 11420 ],
    [ 23160, 16560, 13550 ],
    [ 26860, 20700, 15680 ],
    [ 34140, 22030, 16450 ]
  ],

  getCollegeType: function(){
    return this.collegeTypeVariants[this.get('college_type')];
  },

  changeCollegePrice: function(college_type_id){
    if (college_type_id == this.get('college_type')){ return null }
    this.updateParam('college_type', college_type_id);
    const oldPrice = this.get('net_college_cost');
    const defaultLevel = App.retirementFunding.get('college_cost_level') || 0;

    let newPrice = this.collegePricing[defaultLevel][college_type_id];
    if (newPrice == oldPrice){ newPrice = null; }

    if (newPrice){
      this.set('net_college_cost', newPrice).saveLocal();
    }
    const years = college_type_id == 3 ? 2 : 4;
    this.set('years_in_college', years).saveLocal();
    return newPrice;
  },

  isEmpty: function(){
    return App.storage.getItem(this.key) == undefined;
  },

  saveLocal: function(){
    let temp = _.clone(this.attributes);
    temp.recalculatablesOrigin = this.recalculatablesOrigin;
    temp.recalculatablesChangedByUsers = this.recalculatablesChangedByUsers;
    App.storage.setItem(this.key, JSON.stringify(temp));
  },

  restoreLocal: function(){
    let temp = App.storage.getItem(this.key);
    if (!temp) return;
    temp = JSON.parse(temp);
    this.recalculatablesChangedByUsers = temp.recalculatablesChangedByUsers || {};
    this.recalculatablesOrigin = temp.recalculatablesOrigin || {};
    delete temp.recalculatablesChangedByUsers;
    delete temp.recalculatablesOrigin;
    this.set(temp);
  },

  toActualJSON: function(){
    let attrs = _.clone(App.finAssumptions.attributes);
    delete attrs.synced;
    this.recalculatables.forEach((key) => {
      if (this.recalculatablesChangedByUsers[key] !== true){
        delete attrs[key];
      }
    })
    return attrs;
  },

  calcAvgReturn: function(name, value){
    let h = _.pick(this.attributes, 'rt_cash', 'rt_cash_alloc', 'rt_fi', 'rt_fi_alloc', 'rt_eq', 'rt_eq_alloc');
    if (name) { h[name] = value; }
    //console.log(h);
    let rt = h.rt_cash * h.rt_cash_alloc + h.rt_fi * h.rt_fi_alloc + h.rt_eq * h.rt_eq_alloc;
    rt = Math.round(rt*10000)/10000;
    this.updateParam('rt_avg', rt)
    return rt;
  },

  getLifeExp: function(sex, age, rate){
    const data = sex == 'Male' ? [100000, 99343, 99299, 99270, 99248, 99230, 99215, 99200, 99187, 99175, 99164, 99155, 99146, 99132, 99112, 99080, 99037, 98983, 98917, 98837, 98744, 98637, 98517, 98387, 98254, 98120, 97987, 97855, 97722, 97588, 97452, 97312, 97170, 97024, 96876, 96724, 96568, 96405, 96236, 96057, 95869, 95668, 95453, 95221, 94967, 94687, 94380, 94043, 93674, 93270, 92830, 92352, 91832, 91270, 90663, 90008, 89302, 88544, 87736, 86886, 85995, 85060, 84075, 83032, 81925, 80748, 79492, 78151, 76717, 75185, 73548, 71795, 69917, 67915, 65796, 63559, 61195, 58692, 56048, 53265, 50344, 47283, 44091, 40794, 37424, 34014, 30589, 27180, 23822, 20555, 17429, 14493, 11797, 9379, 7270, 5481, 4018, 2864, 1986, 1341, 884] :
      [100000, 99449, 99411, 99389, 99373, 99358, 99346, 99334, 99324, 99314, 99305, 99296, 99288, 99277, 99265, 99248, 99228, 99204, 99175, 99144, 99109, 99071, 99030, 98986, 98939, 98891, 98841, 98789, 98735, 98677, 98615, 98549, 98478, 98403, 98323, 98240, 98153, 98060, 97960, 97853, 97737, 97610, 97472, 97321, 97155, 96972, 96772, 96552, 96312, 96050, 95766, 95457, 95123, 94763, 94380, 93974, 93543, 93083, 92592, 92071, 91516, 90923, 90287, 89600, 88857, 88050, 87171, 86211, 85168, 84039, 82818, 81494, 80054, 78494, 76809, 74992, 73026, 70896, 68604, 66153, 63542, 60757, 57786, 54633, 51305, 47815, 44179, 40417, 36561, 32655, 28751, 24912, 21208, 17707, 14472, 11557, 9010, 6854, 5088, 3687, 2610]
    let v = data[age] * (1 - (rate || this.get('longevity_risk')))
    let i = 0;
    while (data[i] >= v) {
      i+= 1
    }
    return i;
  },

  calcLifeExpectations: function(rate){
    const [p1, p2] = App.family.models;

    return [this.getLifeExp(p1.get('sex'), p1.get('age'), rate),
            p2 ? this.getLifeExp(p2.get('sex'), p2.get('age'), rate) : 0]
  },

  fieldsData: function(){
    // TODO: set Name1, Name2
    const [name1, name2] = App.family.getNames()
    let data = {
      income_growth: {
        label: "Income Growth",
        hint: `Based on <a target="_blank" href="http://www.tradingeconomics.com/united-states/average-hourly-earnings/forecast">forecast average hourly earnings</a>`,
        type: 'percent'
      },
      until_age: {
        label: "Until Age",
        type: 'age',
        hint: `Income typically peaks and then begins to decline in middle age: <a href="https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr710.pdf">NewYorker article (pdf)</a>`,
      },
      income_growth2: {
        label: "Income Growth Later",
        hint: "This the rate at which income declines in middle age.",
        type: 'percent'
      },
      college_type: {
        label: "College Type",
        hint: `The general category of college or university you expect your children to attend will directly affect the cost. We use estimates of the net cost, after financial aid.`,
        type: 'select'
      },
      net_college_cost: {
        label: "Net College Cost",
        hint: `According to the College Board, "Net price is the published price minus the grant aid — and sometimes the tax credits and deductions — that students receive. Net prices are frequently much lower than published prices and represent the amount students actually pay." This estimate is from https://trends.collegeboard.org/college-pricing/figures-tables/net-price-public-two-year-institutions-dependency-status-income-2011-12. Feel free to enter your own estimate.`,
        type: 'money',
      },
      college_inflation: {
        label: "College Inflation",
        type: 'percent',
        hint: `How fast do college expenses grow, relative to inflation.`,
      },
      college_age: {
        label: "College Age",
        hint: "At what age do you expect children to begin college?",
        type: 'age'
      },
      years_in_college: {
        label: "Years in College",
        hint: "How many years do you expect children to stay in college?",
        type: 'age'
      },
      mortgage_rate: {
        label: 'Mortgage Rate',
        hint: 'What is the interest rate on your mortgage?',
        type: 'percent'
      },
      original_term: {
        label: 'Original Term',
        hint: 'How long was your mortgage, in years, when you originally borrowed the money? 30 is typical.',
        type: 'age'
      },
      mortgage_age: {
        label: 'Mortage Age',
        hint: "For how many years have you had your mortgage?",
        type: 'age'
      },
      life_expectancy1: {
        label: `Life Expectancy${name2 ? ' '+name1 : ''}`,
        hint: `Your money needs to last at least until this age in order for me to call your retirement 'safe'.`,
        type: 'age',
        readonly: true,
      },
      longevity_risk: {
        label: 'Longevity Risk',
        hint: `Set this higher to reduce the risk of running out of money. It determines the minimum age to which your money must last in order for me to consider your retirement plan "safe".  10% means that 10% of the population your age and sex will live to longer than the life expectancy age calculated below. See <a href="https://www.myabaris.com/tools/life-expectancy-calculator-how-long-will-i-live/" target="_blank">Life expectancy calculator</a>`,
        type: 'percent'
      },
      retirement_expence_change: {
        label: 'Change in Expenses',
        hint: "How much do you expect your monthly expenses to increase or decrease AFTER you retire. Consider your plans for travel, hobbies, healthcare expenses, medicare. It&rsquo;s fine to leave this at zero.",
        type: 'percent',
        negative: true
      },
      soc_sec1: {
        label: `Est. Soc. Sec.${name2 ? ' ' + name1 : ''}`,
        hint: `This is my rough estimate of your expect pre-tax social security benefit. To calculate it more accurately, go to <a href="https://www.ssa.gov/OACT/quickcalc/index.html" target="_blank">Social Security Quick Calculator</a>.`,
        type: 'money'
      },
      ss_benefit_cut: {
        label: `Assumed SS Benefit Cut`,
        hint: `If you are concerned about future changes to social security benefits, you can reduce the benefits by entering a negative percentage here. For example, enter -50% for a 50% cut; -100% for complete elimination.`,
        type: 'percent',
        negative: true
      },
      soc_sec_min_age: {
        label: 'Earliest SS Age',
        hint: 'Enter the earliest age at which you will take Social Security benefits. This relevant if you intend to retire BEFORE receiving benefits.',
        type: 'age'
      },
      pensions: {
        label: 'Pensions',
        hint: 'Enter your yearly pension benefit.',
        related: ['yearly_pension_benefit1', 'yearly_pension_benefit2']
      },
      yearly_pension_benefit1: {
        type: 'money'
      },
      yearly_pension_benefit2: {
        type: 'money'
      },
      pension_begins_at: {
        label: 'Begins at Age',
        hint: 'Enter the age when you begin to receive the pension benefit.',
        related: ['yearly_pension_benefit_begins_at_age1', 'yearly_pension_benefit_begins_at_age2']
      },
      yearly_pension_benefit_begins_at_age1: { type: 'age' },
      yearly_pension_benefit_begins_at_age2: { type: 'age'},
      rt_cash: {
        label: 'Cash',
        hint: `Cash refers to money that is easily available and not risky. For example: bank checking, savings and CDs. This interest rate is a guess at the future average interest rate.`,
        related: ['rt_cash', 'rt_cash_alloc'],
        type: 'percent'
      },
      rt_fi: {
        label: 'Fixed income',
        hint: `Also known as bonds, fixed income are loans that you make to companies, cities and others. They are investments that pay you interest until you get your money back. This interest rate is a guess at the future average return on bonds.`,
        related: ['rt_fi', 'rt_fi_alloc'],
        type: 'percent'
      },
      rt_eq: {
        label: 'Equities',
        hint: `Also known as stocks, equities are partial ownership in corporations. They tend be riskier than bonds and cash but can offer higher returns. A reasonable estimate of future returns is the dividend yield (1.9%) + expected nominal growth (4.0%).`,
        related: ['rt_eq', 'rt_eq_alloc'],
        type: 'percent'
      },
      rt_cash_alloc: { type: 'percent' },
      rt_fi_alloc: { type: 'percent' },
      rt_eq_alloc: { type: 'percent' },
      rt_avg: {
        label: 'Avg Return',
        readonly: true,
        type: 'percent'
      },
      rt_re: {
        label: 'Real Estate',
        hint: 'From 1890 - 2005, Real estate prices have increased less about 0.6% per year, after inflation. See <a target="_blank" href="http://www.cbsnews.com/news/history-says-home-real-estate-is-a-bad-investment/">History says home real estate is a bad investment</a>.',
        type: 'percent'
      },
      inflation: {
        label: 'Inflation',
        hint: "Inflation measures how much fewer goods a dollar buys from one year to the next as prices rise.",
        type: 'percent'
      },
      rt_loan: {
        label: 'Loans',
        hint: "I assume that, should your net worth go below zero, you will need to pay this rate of interest on that amount.",
        type: 'percent'
      },
      income_replacement: {
        label: 'Income Replacement',
        hint: "I like to calculate the amount of insurance need based on the amount of cash you'd need to replace all of your future earnings, multiplied by this percentage. In theory a smaller household means lower expenses.",
        type: 'percent'
      },
      value_of_housework: {
        label: 'Value of Housework',
        hint: 'Housework performed by a stay-at-home partner must be replaced in the event that partner passes away. We will calculate insurance requirements so that it at least covers the cost of replacing the value of house work or outside income, whichever is greater.',
        type: 'money'
      }
    }
    if (name2){
      data.soc_sec2 = {
        label: `Est. Soc. Sec. ${name2}`,
        hint: `This is my rough estimate of your expect pre-tax social security benefit. To calculate it more accurately, go to <a href="https://www.ssa.gov/OACT/quickcalc/index.html" target="_blank">Social Security Quick Calculator</a>.`,
        type: 'money'
      }
      data.life_expectancy2 = {
        label: `Life Expectancy ${name2}`,
        hint: `Your money needs to last at least until this age in order for me to call your retirement 'safe'.`,
        type: 'age',
        readonly: true,
      }
    }
    return data;
  }

})
