class BigDecisionController < ApplicationController

  def solve
    target = params[:target]
    opts = prepare_opts
    opts = get_assumption_params(opts)
    Rails.logger.info "DECISION OPTS: #{opts.inspect}"
    solver = BigDecisionsSolver.new(opts)
    value, err = case target
    when 'monthly_savings'
      solver.solve_save
    when 'retire_age'
      solver.solve_retire_age
    when 'parent_contribute'
      solver.solve_contribute
    else
      [ nil, solver.solve_fail ]
    end
    #Rails.logger.info "#{value} - #{target} - #{target.class.name}"
    data = {
      value: value,
      income_stats: solver.income_stats,
      retirement_funding: solver.retirement_funding,
      assumptions: opts[:assumptions],
      recalculated: solver.calculated_assumptions
    }

    Rails.logger.info "CALCULATED: #{solver.calculated_assumptions}"
    #Rails.logger.info "Result: #{data.inspect}. Err: #{err}."

    render json: data.merge(result: (err.blank? ? 'ok' : 'error'), msg: err)
  end

  def solve_different
    opts = prepare_opts
    opts = get_assumption_params(opts)
    Rails.logger.info "DECISION OPTS: #{opts.inspect}"
    data = DifferentDecisionsCalc.simulate(opts)
    Rails.logger.info "Result: #{data.inspect}"
    render json: data
  end

  def defaults
    opts = prepare_opts
    opts[:assumptions] = FinanceAssumption::DEFAULTS.clone
    solver = BigDecisionsSolver.new(opts)
    solver.solve_fail
    Rails.logger.info "CALCULATED: #{solver.calculated_assumptions}"
    data = {
      retirement_funding: solver.retirement_funding,
      assumptions: opts[:assumptions],
      recalculated: solver.calculated_assumptions
    }
    if authorized?
      fa = current_user.finance_assumption || current_user.build_finance_assumption
      fa.update_attributes(data[:assumptions].merge(data[:recalculated]))
    end
    render json: data
  end

private

  def prepare_opts
    opts = {
      parent_contribute: params[:parent_contribute].to_i,
      retire_age:        params[:retire_age].to_i,
      monthly_savings:   params[:monthly_savings].to_i
    }
    if authorized?
      opts = BigDecision.set(current_user, opts).calc_opts
    else
      [:age1, :age2, :income1, :income2, :home_value, :mortgage, :liquid_net_worth].each do |key|
        opts[key] = params[key].to_i if params[key].present?
      end
      opts[:sex1] = params[:sex1]
      opts[:sex2] = params[:sex2]
      opts[:children_years] = params[:children_years].map{|x| x.to_i} if params[:children_years]
    end
    opts
  end

  def get_assumption_params(opts)
    if params[:assumptions]
      assumption_params = params.require(:assumptions).permit(
        :longevity_risk, :inflation, :college_age, :years_in_college,
        :college_inflation, :college_type, :net_college_cost, :income_growth, :income_growth2,
        :until_age, :yearly_pension_benefit1, :yearly_pension_benefit_begins_at_age1,
        :yearly_pension_benefit2, :yearly_pension_benefit_begins_at_age2, :retirement_expence_change,
        :rt_cash, :rt_fi, :rt_eq, :rt_cash_alloc, :rt_fi_alloc, :rt_eq_alloc, :rt_avg,
        :rt_re, :rt_loan, :ss_benefit_cut, :soc_sec_min_age, :soc_sec1, :soc_sec2,
        :mortgage_rate, :original_term, :mortgage_age, :income_replacement, :value_of_housework
      )
    end

    if authorized?
      if assumption_params
        fa = current_user.finance_assumption || current_user.build_finance_assumption
        fa.update_attributes(assumption_params)
      end
      opts[:assumptions] = current_user.finance_assumption_opts
    else
      if assumption_params
        opts[:assumptions] = {}
        assumption_params.each do |k,v|
          opts[:assumptions][k.to_sym] = v.include?('.') ? v.to_f : v.to_i
        end
      else
        opts[:assumptions] = FinanceAssumption::DEFAULTS.clone
      end
    end

    opts
  end

end
