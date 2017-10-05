class FinanceAssumption < ApplicationRecord
  belongs_to :user

  DEFAULTS = {
    longevity_risk: 0.9, # How Long Will You Live? > Logevity Risk // Future!E269
    inflation: 0.02,
    college_age: 18,
    years_in_college: 4,
    college_inflation: 0.045, # Future!B283 # All the little assumptions
    college_type: 1, # Ожидаемый тип колледжа. Future!B281
    # Возможные зн-ия: Public 4Yr In-State, Public 2Yr, Public 4Yr Out-of-State, Private Nonprofit 4Yr
    net_college_cost: nil, # use calculations

    income_growth: 0.022, # процент роста дохода
    income_growth2: 0.016, # процент роста дохода позже
    until_age: 55, #, до какого года ожидается активный рост дохода

    yearly_pension_benefit1: 0, # годовое пенсионное пособие
    yearly_pension_benefit_begins_at_age1: 65, # дата начала пенсионных выплат
    yearly_pension_benefit2: 0, # годовое пенсионное пособие
    yearly_pension_benefit_begins_at_age2: 65, # дата начала пенсионных выплат

    retirement_expence_change: 0, #, How long will you live? Change In expences: Future E268
    rt_cash: 0.015,
    rt_fi: 0.023,
    rt_eq: 0.059,
    rt_cash_alloc: 0.10,
    rt_fi_alloc: 0.10,
    rt_eq_alloc: 0.80,
    rt_avg:  0.051, # Avg. Return # Future!C:302 = SUMPRODUCT(C299,:C301,D299:D301)
    rt_re:   0.025, # Investments: Real Estate # Future!C:303
    rt_loan: 0.06,  # Investments: Loans # Future!C:305

    ss_benefit_cut: 0, #, Assumed SS Benefit Cut # Future!B276
    soc_sec_min_age: 67, #, Earliest SS Age # # Future!B277
    soc_sec1: nil, # use calculations
    soc_sec2: nil, # use calculations

    mortgage_rate: 0.04,
    original_term: 30,
    mortgage_age: 5,

    income_replacement: 0.7, #
    value_of_housework: 59862, #
  }

  before_validation(on: :create) do
    if longevity_risk.blank?
      DEFAULTS.each do |key, value|
        self[key] = value
      end
    end
  end

end
