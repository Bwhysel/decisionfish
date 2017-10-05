class DifferentDecisionsCalc

  def self.simulate(opts)
    data = {}
    serials = {}

    keys = [:monthly_savings, :retire_age, :parent_contribute, :rt_avg]
    keys.delete(:parent_contribute) unless opts[:children_years]
    opts[:rt_avg] = opts[:assumptions][:rt_avg] || FinanceAssumption::DEFAULTS[:rt_avg]

    solver = BigDecisionsSolver.new(opts)

    keys.each do |param|

      serial = if param == :parent_contribute
        [0, 17, 33, 50, 67, 83, 100]
      elsif param == :rt_avg
        x = opts[param]
        variations_for(x-0.03, x-0.02, x-0.01, x).map{|x| x.round(3)}.reverse
      else
        x = opts[param]
        x0 = param == :monthly_savings ? x * 0.75 : x - 3
        x1 = (x - x0)/3 + x0
        variations_for(x0, x1, 2*x1 - x0, x).collect(&:round)
      end
      #Rails.logger.info "SERIAL #{param}: #{serial.inspect}"
      data[param] = {}

      serial.each do |number|
        solver.reset_main_vars(opts.merge(param => number))
        solver.success_f
        data[param][number] = solver.get_money_runs_out_age
      end
    end
    data[:expected_life_age] = solver.get_expected_life_age
    data[:investment_returns] = opts[:rt_avg]
    data
  end

  def self.variations_for(*x)
    x << 2 * x[3] - x[2]
    x << 2 * x[4] - x[3]
    x << 2 * x[5] - x[4]
  end
end