App.Router = Backbone.Router.extend({

  initialize: (options) => {
  },

  routes: {
    '': 'index',
    'ask' : 'ask',
    'menu' : 'menu',
    'family' : 'family',
    'verify' : 'verify',
    'all_completed' : 'all_completed',
    'welcome_back' : 'welcome_back',
    'dashboard' : 'dashboard',
    'big_decision' : 'big_decision',
    'projected_net_worth' : 'projected_net_worth',
    'finance_details/:step': 'finance_details',
    'future_congratulations': 'future_congratulations',
    'future_history': 'future_history',
    'future_history/:step': 'future_history',
    'future_assumptions/:step': 'future_assumptions',
    'different_decisions/:step': 'different_decisions',
    'savings_loans/:step': 'savings_loans',

    'budget' : 'budget',
    'budget_expenses' : 'budget_expenses',
    'budget_meet_plans' : 'budget_meet_plans',
    'budget_walkthrough/:step': 'budget_walkthrough',
    'budget_spend' : 'budget_spend',
    'budget_finalize' : 'budget_finalize',
    'budget_congratulations': 'budget_congratulations',
    'budget_tracking': 'budget_tracking',

    'ideas': 'ideas_select',
    'ideas_get': 'ideas_get',
    'ideas_give': 'ideas_give',

    'savings_401k': 'savings_401k',
    'efund': 'emergency_fund',
    'efund_ready': 'emergency_fund2',
    'savings_opportunities': 'opportunities',
    'savings_plan': 'savings_plan',
    'savings_month_plan': 'savings_month_plan',
    'savings_congratulations': 'savings_congratulations',
    ':kind': 'meta_final',
    ':page': 'simple_page',
  },

  gaTrack: function(){
    ga('set', 'page', location.pathname)
    ga('set', 'dimension1', App.companyName);
    ga('send', 'pageview');
  },

  simple_page: function(page){
    let valid = true;
    let redirectTo = null;
    App.currentModule = null;
    switch(page){
      case 'budget_intro':
        App.currentModule = 'budget';
        valid = App.isBudgetOpened();
        if (!valid) { redirectTo = '/future_final' }
        break;
      case 'savings_intro':
        App.currentModule = 'savings';
        valid = App.isSavingsOpened();
        if (!valid) { redirectTo = '/budget_final' }
        break;
      case 'all_completed':
        App.currentModule = 'savings';
        valid = App.isHousingOpened();
        if (!valid) { redirectTo = '/savings_final' }
    }
    if (valid){
      this.gaTrack();
      App.simplePage.render(page)
    }else{
      App.router.navigate(redirectTo, {trigger: true, replace: true})
    }
    App.positionRestored = true
  },

  meta_final: function(kind){
    if (!/\_final$/.test(kind)){
      this.simple_page(kind);
      return false;
    }
    kind = kind.replace(/\_final$/, '')

    let valid, redirectTo;
    switch(kind){
      case 'future':
        valid = App.retirementFunding.isSafe()
        if (valid) { App.storage.set('budget_opened') }
        redirectTo = '/big_decision';
        break;
      case 'budget':
        valid = App.budgetCategories.areBalanced()
        if (valid) { App.storage.set('investment_opened') }
        redirectTo = '/budget_spend';
        break;
      case 'savings':
        valid = App.investments.isFilled()
        if (valid) {
          App.storage.set('housing_opened')
          // It's awful to change view right there, but it was the fastest way for me
          $('#menu-panel .dashboard-link').removeClass('hidden')
        }
        redirectTo = '/savings_plan'
        break;
    }

    let kindS = kind == 'future' ? 'retirement' : kind;

    this.meta({ module: kind, view: 'FinalPage', renderParams: kindS,
                restriction: !valid, restrictionURL: redirectTo})
  },

  verify: ()=> {
    new App.Views.PinRequest({}).render();
  },

  meta: function(opts){
    App.currentModule = opts.module;
    if (!opts.restriction || !this.redirectIF(opts.restriction, opts.restrictionURL)){
      if (!App.screens[opts.view]) App.screens[opts.view] = new App.Views[opts.view]({
        model: opts.model,
        collection: opts.collection
      });
      this.gaTrack();
      App.positionRestored = true;
      App.screens[opts.view].render(opts.renderParams)
    }
  },

  index: function(){
    App.restorePosition(()=>{
      this.meta({ module: null, view: 'Home', restriction: false});
    })
  },

  ask: function(){
    this.meta({ module: null, view: 'Ask', restriction: false});
  },

  all_completed: function(page){
    this.meta({ module: 'savings', view: 'AllCompleted', renderParams: page,
      restriction: !App.isHousingOpened(), restrictionURL: '/savings_final'});
  },

  welcome_back: function(){
    this.all_completed('welcome_back')
  },

  dashboard: function(page){
    this.meta({ module: 'savings', view: 'Dashboard',
      restriction: !App.isHousingOpened(), restrictionURL: '/savings_final'});
  },

  menu: function(){
    this.meta({ module: null, view: 'Menu', restriction: false});
  },

  family: function(){
    // as it landing page for verify_pin action
    App.restorePosition(()=>{
      this.meta({ module: 'future', view: 'Family', collection: App.family, restriction: false});
    }, '/family')
  },

  finance_details: function(step) {
    this.meta({ module: 'future', view: 'FinanceDetails', model: App.finances, renderParams: step,
                restriction: !App.family.isValid(), restrictionURL: '/future_intro'})
  },

  big_decision: function() {
    this.meta({ module: 'future', view: 'BigDecision', model: App.bigDecision,
                restriction: !App.family.isValid(), restrictionURL: '/finance_details/total'})
  },

  future_history: function(step){
    this.meta({ module: 'future', view: 'FutureHistory', renderParams: step,
                restriction: !App.retirementFunding.isSafe(), restrictionURL: '/big_decision'})
  },

  projected_net_worth: function() {
    this.meta({ module: 'future', view: 'ProjectedNetWorth',
                restriction: !App.retirementFunding.isSafe(), restrictionURL: '/big_decision'})
  },

  different_decisions: function(step) {
    this.meta({ module: 'future', view: 'DifferentDecisions', renderParams: step,
                restriction: !App.retirementFunding.isSafe(), restrictionURL: '/big_decision'})
  },

  future_assumptions: function(step) {
    this.meta({ module: 'future', view: 'FutureAssumptions', model: App.finAssumptions, renderParams: step,
                restriction: !App.retirementFunding.isSafe(), restrictionURL: '/big_decision'})
  },

  future_congratulations: function() {
    this.meta({ module: 'future', view: 'Congratulations', renderParams: 'retirement',
                restriction: !App.retirementFunding.isSafe(), restrictionURL: '/big_decision'})
  },

  budget: function() {
    this.meta({ module: 'budget', view: 'BudgetSelectNeeds', model: App.budgetNeeds,
                restriction: !App.isBudgetOpened(), restrictionURL: '/future_final'})
  },

  budget_expenses: function() {
    this.meta({ module: 'budget', view: 'BudgetExpenses', model: App.budgetCategories,
                restriction: !App.isBudgetOpened(), restrictionURL: '/future_final'})
  },

  budget_meet_plans: function() {
    this.meta({ module: 'budget', view: 'BudgetMeetPlans', model: App.budgetNeeds,
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_expenses'})
  },

  budget_walkthrough: function(step) {
    this.meta({ module: 'budget', view: 'BudgetWalkthrough', model: App.budgetCategories, renderParams: step,
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_expenses'})
  },

  budget_spend: function() {
    this.meta({ module: 'budget', view: 'BudgetSpend', model: App.budgetCategories, renderParams: true,
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_expenses'})
  },

  budget_finalize: function() {
    this.meta({ module: 'budget', view: 'BudgetMeetPlans', model: App.budgetNeeds, renderParams: true,
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_spend'})
  },

  budget_congratulations: function() {
    this.meta({ module: 'budget', view: 'Congratulations', renderParams: 'budget',
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_spend'})
  },

  budget_tracking: function() {
    this.meta({ module: 'budget', view: 'BudgetTracking', model: App.budgetTracking, renderParams: true,
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_spend'})
  },

  ideas_select: function() {
    this.meta({ module: 'budget', view: 'IdeasSelect', model: App.idea,
                restriction: !App.budgetCategories.areBalanced(), restrictionURL: '/budget_expenses'})
  },

  ideas_get: function() {
    this.meta({ module: 'budget', view: 'IdeasGet', model: App.idea,
                restriction: !App.idea.needChoosed(), restrictionURL: '/ideas'})
  },

  ideas_give: function() {
    this.meta({ module: 'budget', view: 'IdeasGive', model: App.idea,
                restriction: !App.idea.needChoosed(), restrictionURL: '/ideas'})
  },

  savings_loans: function(step) {
    this.meta({ module: 'savings', view: 'Loans', model: App.loans, renderParams: step,
                restriction: !App.isSavingsOpened(), restrictionURL: '/budget_final'})
  },

  savings_401k: function() {
    this.meta({ module: 'savings', view: 'P401', model: App.investments,
                restriction: !App.isSavingsOpened(), restrictionURL: '/budget_final'})
  },
  emergency_fund: function() {
    this.meta({ module: 'savings', view: 'SharkAttack', model: App.investments,
                restriction: !App.isSavingsOpened(), restrictionURL: '/budget_final'})
  },
  emergency_fund2: function() {
    this.meta({ module: 'savings', view: 'EfundReady', model: App.investments,
                restriction: !App.isSavingsOpened(), restrictionURL: '/budget_final'})
  },
  opportunities: function() {
    this.meta({ module: 'savings', view: 'Opportunities', model: App.investments,
                restriction: !App.isSavingsOpened(), restrictionURL: '/budget_final'})
  },
  savings_plan: function() {
    this.meta({ module: 'savings', view: 'SavingsPlan', model: App.investments,
                restriction: !App.isSavingsOpened(), restrictionURL: '/budget_final'})
  },
  savings_month_plan: function() {
    this.meta({ module: 'savings', view: 'SavingsMonthPlan', model: App.investments,
                restriction: !App.investments.isFilled(), restrictionURL: '/savings_plan'})
  },

  savings_congratulations: function() {
    this.meta({ module: 'savings', view: 'Congratulations', renderParams: 'savings',
                restriction: !App.investments.isFilled(), restrictionURL: '/savings_plan'})
  },

  redirectIF: (restricted, route) => {
    if (restricted){
      App.router.navigate(route, {trigger: true, replace: true})
    }
    return restricted;
  }

})