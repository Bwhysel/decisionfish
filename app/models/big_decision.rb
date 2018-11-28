class BigDecision < ApplicationRecord
  belongs_to :user

  DEFAULTS = {
    monthly_savings: 0,
    retire_age: 62,
    parent_contribute: 0
  }

  def as_json
    {
      monthly_savings: monthly_savings,
      retire_age: retire_age,
      parent_contribute: parent_contribute.to_i
    }
  end

  def self.set(user, opts)
    bd = user.big_decision || user.build_big_decision

    bd.monthly_savings = opts[:monthly_savings]
    bd.retire_age = opts[:retire_age]
    bd.parent_contribute = opts[:parent_contribute]
    @opts = opts
    bd.save if bd.changed?
    bd
  end

  def calc_opts
    family = user.ordered_persons.to_a
    opts = @opts || self.as_json
    opts[:age1], opts[:age2] = family.collect(&:age).collect(&:to_i)
    opts[:sex1], opts[:sex2] = family.collect(&:sex)
    opts[:income1], opts[:income2] = family.collect(&:income).collect(&:to_i)
    opts[:children_years] = user.get_children
    details = user.finance_details
    opts[:liquid_net_worth] = details&.get_liquid_net_worth || 0
    opts[:mortgage] = details&.mortgage || 0
    opts[:home_value] = details&.home_value || 0
    opts
  end

  def calc!
    opts = calc_opts
    opts[:assumptions] = user.finance_assumption_opts
    solver = BigDecisionsSolver.new(opts)
    solver.solve_fail
    [ solver.retirement_funding, solver.income_stats ]
  end


end
