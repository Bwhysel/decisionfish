class BigDecisionsSolver

  def initialize(opts)
    @utils = StatsUtils.new
    @tbl_NW = []

    @assumptions = opts[:assumptions] || FinanceAssumption::DEFAULTS.clone

    @age1 = opts[:age1] || 40
    @age2 = opts[:age2]
    @sex1 = opts[:sex1] || 'Male'
    @sex2 = opts[:sex2]
    @children_years = opts[:children_years] || []

    @soc_sec_original1 = @assumptions[:soc_sec1]
    @soc_sec_original2 = @assumptions[:soc_sec2]

    @income1 = opts[:income1] || 0
    @income2 = opts[:income2] || 0
    @home_value = opts[:home_value] || 0
    @mortgage = opts[:mortgage] || 0
    @liquid_net_worth = opts[:liquid_net_worth] || 0

    @liquidity_events = opts[:liquidity_events] || {}

    @max_age = [@age1, @age2 || 0].max
    reset_main_vars(opts)

    @origin_table = static_table
  end

  def reset_main_vars(opts)
    # BIG DECISIONS VARS
    @retire_age = opts[:retire_age] || 70
    @monthly_savings = opts[:monthly_savings] || 0
    @parent_contribute = opts[:parent_contribute] || 0
    @parent_contribute = @parent_contribute.to_f / 100
    @assumptions[:rt_avg] = opts[:rt_avg] || @assumptions[:rt_avg]

    @retire_year = @retire_age - @max_age
  end

  def static_table
    @num_adults = @age2 ? 2 : 1

    @life_exp1 = @utils.life_expectancy(@sex1, @age1, @assumptions[:longevity_risk])
    @life_exp2 = @age2 ? @utils.life_expectancy(@sex2, @age2, @assumptions[:longevity_risk]) : 0
    @min_life_exp = [@life_exp1, 70].min

    @last_retirement_year = [ @life_exp1 - @age1, @age2 ? @life_exp2 - @age2 : 0 ].max

    @inflation_koef = 1 + @assumptions[:inflation]
    mortgage_principal_paid = @assumptions[:mortgage_age] == 0 ? 0 : @utils.cumprinc(
        @assumptions[:mortgage_rate]/12, @assumptions[:original_term]*12,
        1, 1, @assumptions[:mortgage_age]*12, 0)
    mortgage_original_bal = @mortgage / (1 + mortgage_principal_paid)
    @mortgage_payment = -12 * @utils.pmt(@assumptions[:mortgage_rate]/12,
                                    @assumptions[:original_term]*12,
                                    mortgage_original_bal) # Future!C392

    @tax_rate_data = @num_adults == 1 ? StatsUtils::TAX_RATES_SINGLE : StatsUtils::TAX_RATES

    years = 1..105
    today_year = Date.today.year

    arr = []
    prev_row = nil

    # first part of table
    years.each do |year|
      row = {
        year: year,
        yearAD: today_year + year,
        inflation: @inflation_koef ** year,
        age1: @age1 + year,
        age2: @age2 ? @age2+year : 0,
      }

      row[:kids_in_college] = 0
      @children_years.each do |child_year|
        temp = child_year + @assumptions[:college_age]
        if (temp < row[:yearAD]) && ( temp >= (row[:yearAD] - @assumptions[:years_in_college]) )
          row[:kids_in_college] += 1
        end
      end

      row[:pension1] = row[:age1] >= @assumptions[:yearly_pension_benefit_begins_at_age1] ? @assumptions[:yearly_pension_benefit1] : 0
      row[:pension2] = row[:age2] >= @assumptions[:yearly_pension_benefit_begins_at_age2] ? @assumptions[:yearly_pension_benefit2] : 0

      row[:income1] = if year == 1
        @income1
      else
        koef = row[:age1] <= @assumptions[:until_age] ? @assumptions[:income_growth] : @assumptions[:income_growth2]
        prev_row[:income1] * (1 + koef)
      end

      row[:income2] = if !@age2
        0
      elsif year == 1
        @income2
      else
        koef = row[:age2] <= @assumptions[:until_age] ? @assumptions[:income_growth] : @assumptions[:income_growth2]
        prev_row[:income2] * (1 + koef)
      end

      row[:mortgage_principal] = @utils.cumprinc(
          @assumptions[:mortgage_rate]/12, @assumptions[:original_term]*12,
          mortgage_original_bal, (@assumptions[:mortgage_age] + year - 1)*12+1,
          (@assumptions[:mortgage_age] + year)*12+0, 0 )
      row[:mortgage_interest] = row[:mortgage_principal] < 0 ? -@mortgage_payment-row[:mortgage_principal] : 0

      row[:home_value] = @home_value * (1 + @assumptions[:rt_re]) ** year
      row[:mortgage_bal] = row[:mortgage_principal] + (prev_row ? prev_row[:mortgage_bal] : @mortgage)
      row[:home_equity] = row[:home_value] - row[:mortgage_bal]

      row[:events] = 0
      # Events = SUMIFS(Future!D313:D317,Future!B313:B317,"="&[Year])
      @liquidity_events.each do |data|
        row[:events] += data[:amount] if data[:year] == row[:yearAD]
      end

      # will be recalculated on simulation
      row[:taxable_income] = row[:pension1] + row[:pension2] + row[:events]

      arr.push(row)

      prev_row = row
    end

    arr
  end

  def soc_sec_benefit_100(age_column, income_column)
    p1 = 118500 * @inflation_koef ** (@soc_sec_year/2)
    count = 0
    sum = 0
    @tbl_NW.each do |row|
      if row[income_column] > 0 && row[age_column] > 27
        sum += row[income_column]
        count += 1
      end
    end
    count == 0 ? 0 : 0.42 * [p1, sum * 1.0 / count].min
  end

  def ss_income_formula(age, soc_sec_starts, soc_sec_benefit)
    if soc_sec_benefit && (age > soc_sec_starts) && (age > @retire_age)
      soc_sec_benefit * @inflation_koef**(age - soc_sec_starts)
    else
      0
    end
  end

  def simulate
    @tbl_NW = @origin_table.map{|row| row.dup }

    @tbl_NW.each do |row|
      row[:income1] = 0 if row[:age1] > @retire_age
      row[:income2] = 0 if @age2 && row[:age2] > @retire_age
    end

    # TODO: optimize to not recalculate on static conditions
    @soc_sec_starts = @retire_age < @assumptions[:soc_sec_min_age] ? @assumptions[:soc_sec_min_age] : [70, @retire_age].min
    @soc_sec_year = @soc_sec_starts - @max_age
    @soc_sec_adj, soc_sec_spouse_adj = @utils.rng_SocSec(@soc_sec_starts).map do |x|
      x + x * @assumptions[:ss_benefit_cut]
    end

    soc_sec_benefit_100_1 = soc_sec_benefit_100(:age1, :income1)
    @soc_sec1 = @soc_sec_original1
    @soc_sec2 = @soc_sec_original2
    if !@soc_sec1
      @soc_sec1, @soc_sec2 = if @age2
        soc_sec_benefit_100_2 = soc_sec_benefit_100(:age2, :income2)
        [
          [soc_sec_benefit_100_1 * @soc_sec_adj, soc_sec_benefit_100_2 * soc_sec_spouse_adj].max,
          [soc_sec_benefit_100_2 * @soc_sec_adj, soc_sec_benefit_100_1 * soc_sec_spouse_adj].max
        ]
      else
        [ soc_sec_benefit_100_1 * @soc_sec_adj, 0]
      end
    end

    # Social parameters

    total_net_runs_out = false
    liquid_net_runs_out = false
    prev_row = nil
    year = nil
    @year_liquid_money_runs_out = nil
    @year_money_runs_out = nil
    @year_college_starts = nil
    # TODO: second part of table

    @tbl_NW.each do |row|
      year = row[:year]


      row[:ss_income1] = ss_income_formula(row[:age1], @soc_sec_starts, @soc_sec1)
      row[:ss_income2] = ss_income_formula(row[:age2], @soc_sec_starts, @soc_sec2)

      prev_liquid_net_worth = prev_row ?  prev_row[:liquid_net_worth] : @liquid_net_worth
      row[:interest_expense] = prev_liquid_net_worth > 0 ? 0 : @assumptions[:rt_loan] * prev_liquid_net_worth
      row[:investment_income] = prev_liquid_net_worth > 0 ? @assumptions[:rt_avg] * prev_liquid_net_worth : 0

      row[:taxable_income] += row[:income1] + row[:income2] +
                              row[:ss_income1] + row[:ss_income2] +
                              row[:investment_income]
      row[:tax_rate] = @utils.tax_rate(row[:taxable_income] / row[:inflation], @tax_rate_data)
      row[:taxes] = - row[:tax_rate] * row[:taxable_income]
      row[:mabs] = row[:taxable_income] - row[:investment_income] + row[:taxes]

      unless prev_row
        @at_income = row[:mabs]
        @savings_rate = @monthly_savings / row[:mabs] * 12
        @college_cost = @assumptions[:net_college_cost] || @utils.college_cost(row[:taxable_income], @assumptions[:college_type])
      end

      row[:savings_commit] = year <= @retire_year ? row[:mabs] * @savings_rate : 0

      expenses = row[:interest_expense] + row[:mortgage_principal] + row[:mortgage_interest]
      row[:base_expenses] = if year <= @retire_year
        row[:mabs] + expenses - row[:savings_commit]
      else
        0
      end

      row[:retirement_exp] = if year == @retire_year + 1
        (prev_row ? prev_row[:base_expenses] : 0) * (1 + @assumptions[:retirement_expence_change]) * @inflation_koef
      elsif year <= @retire_year
        0
      else
        (prev_row ? prev_row[:retirement_exp] : 0) * @inflation_koef
      end

      kids_in_college = row[:kids_in_college]
      row[:college_cost] = if kids_in_college > 0
        @year_college_starts ||= year
        @college_cost * (1+ @assumptions[:college_inflation])**year * kids_in_college * @parent_contribute
      else
          0
      end

      row[:total_expense] = row[:base_expenses] + row[:retirement_exp] + row[:college_cost] - row[:taxes] - expenses
      row[:saving_reinvest] = row[:taxable_income] - row[:total_expense]

      row[:liquid_net_worth] = prev_liquid_net_worth + row[:saving_reinvest]
      row[:total_net_worth] = row[:liquid_net_worth] + row[:home_equity]

      if year > @retire_year
        liquid_net_runs_out = row[:liquid_net_worth] < 0
        total_net_runs_out = row[:total_net_worth] < 0
        @year_liquid_money_runs_out ||= year if liquid_net_runs_out
        @year_money_runs_out ||= year if total_net_runs_out
      end

      prev_row = row
    end

    @year_liquid_money_runs_out ||= year
    @year_money_runs_out ||= year

    @tbl_NW
  end

  # Future! B406 -- Success_F
  def success_f
    simulate
    #puts "Money runs out on: #{year_money_runs_out}. Last retirement year: #{@last_retirement_year}"
    @year_money_runs_out > @last_retirement_year
  end

  def solve_save
    result_before = success_f

    @at_income_r = @at_income.abs / 12  # Budget!O90
    inc = (@at_income_r / 200).round # Future!AC106 // Increment

    #puts "AT INCOME: #{@at_income_r.round}"
    save_interval = 0 .. (@at_income_r * 0.8).round # Future!T106

    @monthly_savings = [@monthly_savings, save_interval.max].min
    #puts @tbl_NW[0].inspect

    puts [ @monthly_savings, result_before, save_interval.inspect, inc, @at_income.round ].join("\t\t")
    if inc > 0
      keep_going = true
      while keep_going do
        adj = result_before ? -inc : inc
        @monthly_savings += adj
        @monthly_savings = @monthly_savings * 1.0
        keep_going = @monthly_savings.in?(save_interval)
        result_now = success_f
        keep_going &&= result_now == result_before
        #puts [ @monthly_savings, result_now, keep_going ].join("\t\t")
        result_now = result_before

        #keep_going = false if @monthly_savings.round == 1055
      end
      @monthly_savings -= adj if adj < 0
    end
    # Range("Save_Scrollval").Value = @monthly_savings / inc
    #solve_fail unless result_now

    [ @monthly_savings.round, solve_fail ]
  end

  def solve_retire_age
    @retire_age = @max_age + 1
    @retire_year = @retire_age - @max_age

    while !success_f && @retire_age < @min_life_exp do
      @retire_age += 1
      @retire_year = @retire_age - @max_age
    end

    [ @retire_age, solve_fail ]
  end

  def solve_contribute
    @parent_contribute = 1
    while !success_f && @parent_contribute > 0 do
      @parent_contribute -= 0.01
    end

    [ (@parent_contribute*100).round, solve_fail ]
  end

  def solve_fail
    unless success_f
      'Sorry, I did my best. Try adjusting a different decision.'
    end
  end

  def income_stats
    at_income = @at_income_r ||= @at_income / 12
    inc = [(@at_income_r / 200).round, 10].max

    {
      increment: inc,
      savings_rate: at_income == 0 ? 0 : (@monthly_savings / at_income * 100 ).round,
      too_much: (@monthly_savings > 0) && (@monthly_savings > (0.2 * @at_income_r))
    }
  end

  def retirement_funding
    until_age1 = @age1 + @year_money_runs_out
    until_age2 = @age2 + @year_money_runs_out if @age2
    until_age_liquid = @age1 + @year_liquid_money_runs_out

    first_row = @tbl_NW.first
    last_row = @tbl_NW.last

    # Success beyond sim Future!B411
    if last_row[:total_net_worth]>last_row[:retirement_exp]
      until_age1 = until_age1.to_s + '+'
      until_age2 = until_age2.to_s + '+' if @age2
    end

    total_row = get_total_row

    overfunded_treshold = 10
    retirement_expenses = @tbl_NW[@retire_year][:retirement_exp]
    end_NW = @tbl_NW[@last_retirement_year-1][:total_net_worth]
    overfunded = (end_NW > 0) && ((end_NW / retirement_expenses) > overfunded_treshold)
    #Rails.logger.info ["OVERFUNDED", end_NW.to_f, retirement_expenses].join("\t\t")

    req_retire = (total_row[:retirement_exp] - total_row[:ss_income1] - total_row[:ss_income2]).round

    @at_income_r ||= @at_income / 12
    persons_count = (@age2 ? 2 : 1) + @children_years.length



    ins_replace = @assumptions[:income_replacement]
    tax_rate = first_row[:tax_rate]
    second_koef = persons_count == 1 ? 0 : (1-tax_rate)*ins_replace

    pv1 = @utils.pv(@assumptions[:rt_avg], @retire_age - @age1, -@assumptions[:value_of_housework])
    min_insurance1 = pv1 * ins_replace

    insurance1 = [min_insurance1, total_row[:income1]*second_koef].max
    if @age2
      pv2 = @utils.pv(@assumptions[:rt_avg], @retire_age - @age2, -@assumptions[:value_of_housework])
      min_insurance2 = pv2 * ins_replace
      insurance2 = [min_insurance2, total_row[:income2]*second_koef].max
    end

    {
      overfunded:           overfunded,
      success:              @year_money_runs_out > @last_retirement_year,
      success_liquid:       @year_liquid_money_runs_out > @last_retirement_year,
      until_age1:           until_age1, # person1's age when money runs out
      until_age2:           until_age2, # person2's age when money runs out
      life_exp1:            @life_exp1,
      life_exp2:            @life_exp2,
      until_age_liquid:     until_age_liquid,
      last_retirement_age:  @age1 + @last_retirement_year,
      money_runs_out_age:   get_money_runs_out_age,
      req_college:          total_row[:college_cost].round,
      req_retire:           req_retire,
      soc_sec_starts:       @soc_sec_starts,
      soc_sec_adj:          @soc_sec_adj.round(2),
      soc_sec_total:        ((@soc_sec1+@soc_sec2) / 12).round,
      insurance1:           insurance1.ceil(-3),
      insurance2:           insurance2 ? insurance2.ceil(-3) : nil,
      base_expenses:        first_row[:base_expenses].round,
      retirement_expenses:  (retirement_expenses / 12).round,
      college_starts:       @year_college_starts ? @age1 + @year_college_starts : nil,
      net_worth_chart:      get_projected_net_worth_data,
      at_income_r:          @at_income_r.round,
      college_cost_level:   @utils.college_cost_level(first_row[:taxable_income]),
      tax_rate:             first_row[:tax_rate],
      retirement_tax_rate:  @tbl_NW[@retire_year-1][:tax_rate],
      mortgage_payment:     @mortgage_payment / 12,
      end_nw:               end_NW
    }
  end

  def calculated_assumptions
    {
      soc_sec1: @soc_sec1.round,
      soc_sec2: @soc_sec2.round,
      net_college_cost: @college_cost,
    }
  end

  def get_money_runs_out_age
    @age1 + @year_money_runs_out
  end

  def get_expected_life_age
    [ @life_exp1, @life_exp2 ]
  end

  def get_projected_net_worth_data
    xs, ys = [[], []]
    data = {}
    until_age = @age1 + @year_money_runs_out
    @tbl_NW.each do |row|
      age = row[:age1]
      data[age] = if age < until_age
        row[:total_net_worth].round
      elsif age == until_age
        0
      else
        nil
      end
    end
     #data.merge!({
     #  p1: @soc_sec_starts,
     #  p2: @year_college_starts,
     #  p3: @retire_age,
     #  p4: @year_money_runs_out
     #})
    data
  end

  def get_total_row
    #NPV(RT_Avg, [College Cost] - firstRow.college_cost)
    fields = [
      :income1, :income2, :ss_income1, :ss_income2,
      :taxable_income, :taxes, :taxable_income, :base_expenses,
      :retirement_exp, :college_cost, :total_expense, :saving_reinvest
    ]
    first_row = @tbl_NW.first
    total_row = {}
    fields.each{|f| total_row[f] = -first_row[f] }

    r = k = 1+@assumptions[:rt_avg]
    @tbl_NW.each do |row|
      fields.each do |field|
        add_it = case field
        when :ss_income1
          row[:age1] <= @life_exp1
        when :ss_income2
          row[:age2] <= @life_exp2
        when :retirement_exp
          row[:year] <= @last_retirement_year
        else
          true
        end
        if add_it
          total_row[field] += row[field]/r
        end
      end
      r *= k
    end; 0
    total_row
  end

  def get_table
    @tbl_NW
  end

  def print_table(arr = [], from_year = 1, to_year = -1)
    from_year -= 1
    to_year = @tbl_NW.length if to_year == -1
    to_year -= 1
    fields = %w(year).map{|x| x.to_sym}
    fields += arr

    puts fields.map{|f| f.upcase }.join("\t\t")
    puts "#{from_year} -- #{to_year}"
    @tbl_NW.each_with_index do |row, year|
      if year >= from_year && year <= to_year
        puts fields.map{|f| row[f]&.round(2)}.join("\t\t")
      end
    end
    nil
  end

end