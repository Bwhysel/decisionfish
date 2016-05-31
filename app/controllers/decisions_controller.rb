class DecisionsController < ApplicationController
  before_action :set_decision, except: :index

  def index
    @decisions = Decision.all

    if params[:back_to_default]
      if session[:'warden.user.user.key']
        devise = session[:'warden.user.user.key']
        session.clear
        session[:'warden.user.user.key'] = devise
      else
        session.clear
      end
    end
  end

  def show
    session[:user_way] = 'free'
    @variable = @decision.variables.order(order: :asc).first
  end

  def charts
    session[:decision_id] = @decision.id
    @variables = @decision.variables

    # Affordability Analysis chart ---------------------------------------------------------------
    @banks_may_tell_you = calculate_formula("Banks May Tell You")
    @cut_expenses = []
    @decision_fishs = []
    for i in 1..10
      # cut expenses way
      if i == 1
        @cut_expenses << 0
      elsif i == 2
        @cut_expenses << calculate_formula("Cut Expenses By (Affordability Analysis)")
      else
        value = 2 * @cut_expenses[-1] - @cut_expenses[-2]
        @cut_expenses << value
      end

      # decision fish way
      @decision_fishs << calculate_formula('Decision Fish (Affordability Analysis)',
                                           cut_expenses: @cut_expenses[-1],
                                           banks_tell: @banks_may_tell_you)
    end

    @data_for_chart_bank = []
    for i in 0..9
      @data_for_chart_bank << [@cut_expenses[i].to_i, @banks_may_tell_you.to_i]
    end

    @data_for_chart_fish = []
    for i in 0..9
      @data_for_chart_fish << [@cut_expenses[i].to_i, @decision_fishs[i].to_i]
    end
    gon.data_for_chart_bank = @data_for_chart_bank
    gon.data_for_chart_fish = @data_for_chart_fish

    # end of Affordability Analysis chart ---------------------------------------------------------

    # chart Savings Target Analysis ---------------------------------------------------------------
      @savings_rates = []
      @home_values = []
      for i in 1..10
        if i == 1
          @savings_rates << 0
        elsif i == 2
          @savings_rates << 0.02
        else
          value = value = 2 * @savings_rates[-1] - @savings_rates[-2]
          @savings_rates << value
        end

        @home_values << calculate_formula('Home Price (Target Analysis)',
                                             saving_rate_chart: @savings_rates[-1],
                                             banks_tell: @banks_may_tell_you)
      end

      # declared in previous chart
      @banks_may_tell_you

      detailed_results(color = false)
      @bank_savings_rate = @new_savings_rate_left

      @data_for_bank_price = [[(@bank_savings_rate * 100).round, @banks_may_tell_you.to_i]]
      @data_for_home_value = []
      for i in 0..9
        @data_for_home_value << [(@savings_rates[i] * 100).round, @home_values[i].to_i]
      end
      gon.data_for_bank_price = @data_for_bank_price
      gon.data_for_home_value = @data_for_home_value
    # end of Savings Target Analysis chart ---------------------------------------------------------

    # chart The Value of Waiting ---------------------------------------------------------------
      @months = []
      @decision_fishs_value_of_waiting = []
      @banks_value_of_waiting = []
      for i in 1..9
        if i == 1
          @months << 0
        elsif i == 2
          @months << 3
        else
          value = value = 2 * @months[-1] - @months[-2]
          @months << value
        end

        @banks_value_of_waiting << calculate_formula('Bank (Value Of Waiting)',
                                             months: @months[-1])

        @decision_fishs_value_of_waiting << calculate_formula('Decision Fish (Value Of Waiting)',
                                             months: @months[-1],
                                             banks_tell: @banks_value_of_waiting[-1])
      end

      @data_for_decision_fish_val_of_wait = []
      @data_for_banks_val_of_wait = []
      for i in 0..8
        @data_for_decision_fish_val_of_wait << [@months[i], @decision_fishs_value_of_waiting[i].to_i]

        @data_for_banks_val_of_wait << [@months[i], @banks_value_of_waiting[i].to_i]
      end

      gon.data_for_banks_val_of_wait = @data_for_banks_val_of_wait
      gon.data_for_decision_fish_val_of_wait = @data_for_decision_fish_val_of_wait
    # end of The Value of Waiting chart ---------------------------------------------------------

  end

  def send_email
    @variables = @decision.variables
    banks_decision = calculate_formula("Banks May Tell You")
    decision_fish_decision = calculate_formula("Decision Fish suggests")
    my_decision = session[:will_spend].to_i

    if params[:emails] && params[:emails][:email]
      if params[:emails][:email] == ""
        flash[:notice] = "You need to fill in email field."
        redirect_to send_email_decision_path
      elsif (params[:emails][:email] =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i) == nil
        flash[:notice] = "Email address is invalid."
        redirect_to send_email_decision_path
      else
        ResultsMailer.send_results(params[:emails][:email], banks_decision,
                                  decision_fish_decision,
                                  my_decision).deliver_later
        redirect_to '/pages/next_steps'
      end
    end
  end

  def upload_csv
    session[:first_time] == 'false'
  end

  def import_csv
    if session[:'warden.user.user.key']
      devise = session[:'warden.user.user.key']
      session.clear
      session[:'warden.user.user.key'] = devise
    else
      session.clear
    end


    if params[:file]
      begin
        @csv_variables = {}

        CSV.foreach(params[:file].path, headers: true) do |row|

          @csv_variables[row[0].to_sym] = row[1]
        end

        session[:csv_variables] = @csv_variables
        redirect_to assumptions_decision_path(csv_uploaded: 'true')
      rescue ArgumentError
        flash[:notice] = "Please, choose correct csv file."
        return redirect_to upload_csv_decision_path
      end
    else
      flash[:notice] = "You need to choose file."
      redirect_to upload_csv_decision_path
    end
  end

  def assumptions
    @variables = @decision.variables

    if params[:back_to_default]
      if session[:'warden.user.user.key']
        devise = session[:'warden.user.user.key']
        session.clear
        session[:'warden.user.user.key'] = devise
      else
        session.clear
      end


      @home_price_budget_for_csv = @decision.variables.where(name: 'will_spend')
      @home_price_budget = @home_price_budget_for_csv.first
      @free_variables = @decision.variables.where(order: 1..5).order(order: :asc)
      @pro_variables = @decision.variables.where(order: 7..20).order(order: :asc)

    elsif params[:back_to_assumptions]

      @home_price_budget_for_csv = {will_spend: session[:will_spend].to_f}
      @home_price_budget_value = session[:will_spend].to_f
      @free_variables = {}
      @pro_variables = {}
      hash = session.to_hash
      hash.each do |key, value|
        if @decision.variables.where(order: 1..5).find_by(name: key.to_s)
          @free_variables[key.to_sym] = value
        elsif @decision.variables.where(order: 7..20).find_by(name: key.to_s)
          @pro_variables[key.to_sym] = value.to_f
        end
      end
    elsif params[:csv_uploaded]
      @home_price_budget_for_csv = {will_spend: session[:csv_variables].values[0].to_f}
      @home_price_budget_value = session[:csv_variables].values[0].to_f
      @free_variables = {}
      @pro_variables = {}
      session[:csv_variables].each do |key, value|
        if @decision.variables.where(order: 1..5).find_by(name: key.to_s)
          @free_variables[key.to_sym] = value
        elsif @decision.variables.where(order: 7..20).find_by(name: key.to_s)
          @pro_variables[key.to_sym] = value.to_f
        end
      end
    elsif session[:user_way] == 'free' && session[:will_spend] || session[:back_from_free] == 'true'
      @home_price_budget_for_csv = {will_spend: session[:will_spend].to_f}
      @home_price_budget_value = session[:will_spend].to_f
      @free_variables = {}
      @pro_variables = {}
      hash = session.to_hash
      if session[:back_from_free] && session[:saving_int_rate]
        hash.each do |key, value|
          if @decision.variables.where(order: 1..5).find_by(name: key.to_s)
            @free_variables[key.to_sym] = value
          elsif @decision.variables.where(order: 7..20).find_by(name: key.to_s)
            @pro_variables[key.to_sym] = value.to_f
          end
        end
      else
        hash.each do |key, value|
          if @decision.variables.where(order: 1..5).find_by(name: key.to_s)
            @free_variables[key.to_sym] = value
          end
        end
        @decision.variables.where(order: 7..20).order(order: :asc).each do |var|
          @pro_variables[var.name.to_sym] = var.default.to_f
        end
      end

      params[:back_from_free] = 'true'
      session[:back_from_free] = 'true'
    elsif session[:first_time] == 'false'
      if session[:will_spend]
        @home_price_budget_for_csv = {will_spend: session[:will_spend].to_f}
        @home_price_budget_value = session[:will_spend].to_f
      else
        @home_price_budget_for_csv = @decision.variables.where(name: 'will_spend')
        @home_price_budget = @home_price_budget_for_csv.first
      end

      @free_variables = {}
      @pro_variables = {}
      hash = session.to_hash
      if session[:income_month] && session[:saving_int_rate]
        hash.each do |key, value|
          if @decision.variables.where(order: 1..5).find_by(name: key.to_s)
            @free_variables[key.to_sym] = value
          elsif @decision.variables.where(order: 7..20).find_by(name: key.to_s)
            @pro_variables[key.to_sym] = value.to_f
          end
        end
      elsif session[:income_month]
        hash.each do |key, value|
          if @decision.variables.where(order: 1..5).find_by(name: key.to_s)
            @free_variables[key.to_sym] = value
          end
        end
        @decision.variables.where(order: 7..20).order(order: :asc).each do |var|
          @pro_variables[var.name.to_sym] = var.default
        end
      else
        @decision.variables.where(order: 1..5).order(order: :asc).each do |var|
          @free_variables[var.name.to_sym] = var.default
        end
        @decision.variables.where(order: 7..20).order(order: :asc).each do |var|
          @pro_variables[var.name.to_sym] = var.default
        end
      end
    else
      @home_price_budget_for_csv = @decision.variables.where(name: 'will_spend')
      @home_price_budget = @home_price_budget_for_csv.first
      @free_variables = @decision.variables.where(order: 1..5).order(order: :asc)
      @pro_variables = @decision.variables.where(order: 7..20).order(order: :asc)
    end

    session[:user_way] = 'pro'

    respond_to do |format|
      format.html
      if params[:back_to_assumptions]
        format.csv { send_data generate_csv(@home_price_budget_for_csv.merge(@free_variables).merge(@pro_variables)), filename: "decision-fish-#{Date.today}.csv" }
      else
        format.csv { send_data generate_csv(@home_price_budget_for_csv + @free_variables + @pro_variables), filename: "decision-fish-#{Date.today}.csv" }
      end
    end
  end

  def make_decision
    @variables = @decision.variables
    @free_input_variables = @decision.variables.where(pro: false)

    @banks_may_tell_you = calculate_formula("Banks May Tell You")
    @decision_fish_suggests = calculate_formula("Decision Fish suggests",
                                                banks_tell: @bank_may_tell_you)
    if @banks_may_tell_you == 0 || @decision_fish_suggests == 0
      flash[:notice] = "Oops! I'm having trouble doing the math. Please check your answers and click 'Change Your Answers' below. Email desi@decisionfish.com if you need help."
      return redirect_to free_result_table_decision_variables_path(decision_id: @decision.id, direction: 'back')
    end

    if session[:will_spend] && params[:direction] == 'back'
      @will_spend_value = session[:will_spend].to_i
    else
      calculate_formula("Banks May Tell You")
      @will_spend_value = calculate_formula("Decision Fish suggests")
      session[:will_spend] = @will_spend_value
    end

    table_formulas(@banks_may_tell_you, @decision_fish_suggests)
    @detailed_results_net_housing_expense_left = @net_housing_expense_left
    @detailed_results_net_housing_expense_right = @net_housing_expense_right

    session[:will_spend] ? session[:will_spend] : (session[:will_spend] = @decision_fish_suggests)
    table_formulas(session[:will_spend].to_i, calculate_formula("Down Home Value").to_i)
    @other_scenarios_net_housing_expense_left = @net_housing_expense_left
  end

  def understand_results
    if params[:update]
      session[:will_spend] = params[:variable_value][:value]
      return redirect_to make_decision_decision_path(direction: 'back')
    end

    @variable = Variable.where(pro: false).order(:order).last

    if params[:variable_value] && params[:variable_value][:value] == "" || params[:variable_value] && params[:variable_value][:value].to_i <= 0
      flash[:notice] = "Please, enter valid value."
      return redirect_to make_decision_decision_path
    elsif params[:direction] != "back"
      session[@variable.name.to_sym] = params[:variable_value][:value]
    end

    @banks_may_tell_you = calculate_formula("Banks May Tell You")
    @decision_fish_suggests = calculate_formula("Decision Fish suggests",
                                                banks_tell: @bank_may_tell_you)

    @calculate_future_value = calculate_future_value

    @term = @decision.variables.find_by(name: "term").default.to_i

    other_scenarios(color = false)
    @net_housing_expense_you = @net_housing_expense_left
    @future_wealth_you = @future_wealth_left

    @weeks = ((calculate_future_value(@change_in_housing_exp_left, true)) / (session[:income_month].to_i - session[:saving_month].to_i + @change_in_housing_exp_left) * 30 / 7).round

    detailed_results(color = false)
  end

  def done
    session[:decision_id] = @decision.id
  end

  def detailed_results(color = true)
    session[:first_time] = 'false'

    if params[:variables]
      params[:variables].each do |key, value|
        if value == ''
          flash[:notice] = "All values need to be filled in."
          return redirect_to assumptions_decision_path
        elsif key == 'will_spend' && value.to_i == 0
          flash[:notice] = "Home Price Budget can`t be $0"
          return redirect_to assumptions_decision_path
        elsif value.to_i > 10000000 && (key != 'will_spend')
          flash[:notice] = "Max. value is $10,000,000"
          return redirect_to assumptions_decision_path
        elsif value.to_i < 0
          flash[:notice] = "Value can`t be nagative."
          return redirect_to assumptions_decision_path
        end
        if Variable.find_by(name: key).type == "FloatVariable"
          session[key] = value.to_f / 100
        else
          session[key] = value.to_f
        end
      end

      if session[:cash_now].to_i < session[:closing_cost].to_i
        flash[:notice] = "Not enough cash. Please try again."
        return redirect_to assumptions_decision_path
      elsif session[:term].to_i == 0
        flash[:notice] = "Term should be at least one year."
        return redirect_to assumptions_decision_path
      end
    end

    if params[:redirection]
      return redirect_to "/decisions/1/assumptions.csv?back_to_assumptions=true"
    else
      @variables = @decision.variables
      home_value_left = calculate_formula("Banks May Tell You")
      home_value_right = calculate_formula("Decision Fish suggests")
      if home_value_left == 0 || home_value_right == 0
        flash[:notice] = "Oops! I'm having trouble doing the math. Please check your answers. <br> Email desi@decisionfish.com if you need help."
        return redirect_to assumptions_decision_path(back_to_assumptions: 'true')
      end
      table_formulas(home_value_left, home_value_right)

      set_cells_color if color
    end
  end

  def other_scenarios(color = true)
    @variables = @decision.variables

    if params[:update]
      if params[:home_values][:left_value].to_i > 10000000
        flash[:notice] = "Max. is $10,000,000"
        return redirect_to other_scenarios_decision_path
      elsif params[:home_values][:left_value] == "" || params[:home_values][:left_value].to_i <= 0
        flash[:notice] = "Please, enter valid value."
        return redirect_to other_scenarios_decision_path
      else
        @home_value_left = params[:home_values][:left_value].to_i
        session[:will_spend] = @home_value_left
      end
    else
      @home_value_left = session[:will_spend].to_i
    end

    @home_value_right = calculate_formula("Down Home Value").to_i

    table_formulas(@home_value_left, @home_value_right)

    set_cells_color if color
  end

  def bank_debt_to_income_tests
    @variables = @decision.variables

    if params[:update]
      @home_value_right = params[:home_values][:right_value].to_i
    else
      @home_value_right = calculate_formula("All Debt").to_i
    end

    @home_value_left = calculate_formula("Mortgage").to_i

    table_formulas(@home_value_left, @home_value_right)

    set_cells_color
  end

  private

  def set_decision
    @decision = Decision.find(params[:id])
  end

  def table_formulas(home_value_left, home_value_right)

    # home values
    @home_value_left = home_value_left
    @home_value_right = home_value_right

    # input vars
    @cash_now = session[:cash_now].to_i

    # default vars
    if session[:user_way] == 'pro'
      @closing_cost = session[:closing_cost].to_i
    else
      @closing_cost = @variables.find_by(name: "closing_cost").default
    end

    # Formulas calculation
    @loan_amount_left = calculate_formula("Loan Amount",
                        home_value: @home_value_left)
    @loan_amount_right = calculate_formula("Loan Amount",
                        home_value: @home_value_right)
    @loan_fees_pts_left = calculate_formula("Loan Fees/Pts",
                          loan_amount: @loan_amount_left)
    @loan_fees_pts_right = calculate_formula("Loan Fees/Pts",
                          loan_amount: @loan_amount_right)
    @property_taxes_left = calculate_formula("Property Taxes",
                           home_value: @home_value_left)
    @property_taxes_right = calculate_formula("Property Taxes",
                           home_value: @home_value_right)
    @home_owners_ins_left = calculate_formula("Home Owners Ins.",
                            home_value: @home_value_left)
    @home_owners_ins_right = calculate_formula("Home Owners Ins.",
                            home_value: @home_value_right)
    @principal_and_interest_left = calculate_formula("Principal & Interest",
                                   loan_amount: @loan_amount_left)
    @principal_and_interest_right = calculate_formula("Principal & Interest",
                                   loan_amount: @loan_amount_right)
    @add_home_expenses = calculate_formula("Add`l Home Expenses")
    @interest_deduction_left = calculate_formula("Interest Deduction",
                                   loan_amount: @loan_amount_left)
    @interest_deduction_right = calculate_formula("Interest Deduction",
                                   loan_amount: @loan_amount_right)
    @down_payment_left = calculate_formula("Down Payment",
                                   home_value: @home_value_left,
                                   loan_amount: @loan_amount_left)
    @down_payment_right = calculate_formula("Down Payment",
                                  home_value: @home_value_right,
                                  loan_amount: @loan_amount_right)
    @down_payment_as_pers_left = calculate_formula("Down Pmt as %",
                                  home_value: @home_value_left,
                                  down_payment: @down_payment_left)
    @down_payment_as_pers_right = calculate_formula("Down Pmt as %",
                                  home_value: @home_value_right,
                                  down_payment: @down_payment_right)
    @pmi_left = calculate_formula("PMI", loan_amount: @loan_amount_left,
                down_payment_as_pers: @down_payment_as_pers_left
                )
    @pmi_right = calculate_formula("PMI", loan_amount: @loan_amount_right,
                down_payment_as_pers: @down_payment_as_pers_right
                )

    # Totals
    @uses_total_left = total(@home_value_left, @closing_cost, @loan_fees_pts_left)
    @uses_total_right = total(@home_value_right, @closing_cost, @loan_fees_pts_right)
    @sources_total_left = total(@cash_now, @loan_amount_left)
    @sources_total_right = total(@cash_now, @loan_amount_right)
    @monthly_payments_total_left = total(@principal_and_interest_left, @pmi_left,
                                         @property_taxes_left,
                                         @home_owners_ins_left)
    @monthly_payments_total_right = total(@principal_and_interest_right, @pmi_right,
                                         @property_taxes_right,
                                         @home_owners_ins_right)

    # Formulas based on Totals
    @net_housing_expense_left = calculate_formula("Net Housing Expense",
                                  monthly_payments: @monthly_payments_total_left,
                                  interest_deduction: @interest_deduction_left,
                                  add_home_exp: @add_home_expenses
                                )
    @net_housing_expense_right = calculate_formula("Net Housing Expense",
                                  monthly_payments: @monthly_payments_total_right,
                                  interest_deduction: @interest_deduction_right,
                                  add_home_exp: @add_home_expenses
                                )
    @dti_front_end_left = calculate_formula("DTI (Front End)",
                            monthly_payments: @monthly_payments_total_left)
    @dti_front_end_right = calculate_formula("DTI (Front End)",
                            monthly_payments: @monthly_payments_total_right)
    @dti_back_end_left = calculate_formula("DTI (Back End)",
                            monthly_payments: @monthly_payments_total_left)
    @dti_back_end_right = calculate_formula("DTI (Back End)",
                            monthly_payments: @monthly_payments_total_right)
    @change_in_housing_exp_left = calculate_formula("Change In Housing Expense",
                                    net_housing_expenses: @net_housing_expense_left)
    @change_in_housing_exp_right = calculate_formula("Change In Housing Expense",
                                    net_housing_expenses: @net_housing_expense_right)
    @new_savings_rate_left = calculate_formula("New Savings Rate",
                               change_in_housing_exp: @change_in_housing_exp_left)
    @new_savings_rate_right = calculate_formula("New Savings Rate",
                               change_in_housing_exp: @change_in_housing_exp_right)
    @future_wealth_left = calculate_future_value(
                            change_in_housing_exp = @change_in_housing_exp_left
                          )
    @future_wealth_right = calculate_future_value(
                            change_in_housing_exp = @change_in_housing_exp_right
                          )
  end

  def calculate_formula(formula_title, vars = {})
    @variables = @decision.variables
    @formula = @decision.formulas.find_by(title: formula_title)

    calculator = Dentaku::Calculator.new
    calculator.bind(vars)

    if ['Banks May Tell You', 'Decision Fish suggests', 'Principal & Interest',
        'Mortgage', 'All Debt', 'Decision Fish (Affordability Analysis)',
        'Home Price (Target Analysis)', 'Decision Fish (Value Of Waiting)',
        'Bank (Value Of Waiting)'].include?(formula_title)

      calculator.bind(mvd: calculate_payment_for_loan)
    end

    calculator.bind(session.to_hash)
    default_variables = {}
    calculator.dependencies(@formula.equation).each do |variable_name|
      variable = @variables.find_by(name: variable_name)
      if variable
        default_variables[variable.name.to_sym] = variable.default.to_f
      end
    end
    calculator.bind(default_variables)

    if formula_title == "Banks May Tell You"
      return session[:banks_may_tell_you] = (calculator.
                                             evaluate(@formula.equation)
                                             .to_i + 50) / 1000 * 1000
    elsif formula_title == "Decision Fish suggests"
      calculator.bind(banks_tell: session[:banks_may_tell_you])
      return session[:decision_fish_suggests] = (calculator.
                                                 evaluate(@formula.equation).
                                                 to_i + 50) / 1000 * 1000
    end

    calculator.evaluate(@formula.equation)
  end

  def calculate_future_value(change_in_housing_exp = 0, weeks = false)
    if session[:user_way] == 'pro'
      rate = session[:saving_int_rate].to_f / 12
      nper = session[:term].to_f * 12
    else
      rate = @decision.variables.find_by(name: "saving_int_rate").default / 12
      nper = @decision.variables.find_by(name: "term").default * 12
    end

    nper = 2 * 12 if weeks

    pmt = session[:saving_month].to_i - change_in_housing_exp
    pv = 0
    type = 0

    pow = (1 + rate) ** nper

    fv = -((pmt * (1 + rate * type) * (1 - pow) / rate) - pv * pow)
  end

  def calculate_payment_for_loan

    rate = session[:mort_rate].to_f / 12
    nper = session[:term].to_f * 12

    pv = -1
    fv = 0
    type = 0

    return -(pv + fv) / nper if rate == 0

    pvif = (1 + rate) ** nper
    pmt = rate / (pvif - 1) * -(pv * pvif + fv)
  end

  def total(*args)
    args.inject(0){|sum, var| sum + var}
  end

  def set_cells_color
    @saving_rate_color_left = @new_savings_rate_left < session[:saving_rate_goal] ? '#FEB8C3' : '#BBDAA5'
    @saving_rate_color_right = @new_savings_rate_right < session[:saving_rate_goal] ? '#FEB8C3' : '#BBDAA5'
    @dti_front_end_color_left = @dti_front_end_left > session[:max_dti_wo] ? '#FEB8C3' : '#BBDAA5'
    @dti_front_end_color_right = @dti_front_end_right > session[:max_dti_wo] ? '#FEB8C3' : '#BBDAA5'
    @dti_back_end_color_left = @dti_back_end_left > session[:max_dti_with] ? '#FEB8C3' : '#BBDAA5'
    @dti_back_end_color_right = @dti_back_end_right > session[:max_dti_with] ? '#FEB8C3' : '#BBDAA5'
    @down_payment_as_pers_color_left = @down_payment_as_pers_left < session[:min_down_pmt] ? '#FEB8C3' : '#BBDAA5'
    @down_payment_as_pers_color_right = @down_payment_as_pers_right < session[:min_down_pmt] ? '#FEB8C3' : '#BBDAA5'
    @down_payment_as_pers_color_left = @down_payment_as_pers_left < 0.2 && @down_payment_as_pers_left > session[:min_down_pmt] ? '#FFFF0B' : @down_payment_as_pers_color_left
    @down_payment_as_pers_color_right = @down_payment_as_pers_right < 0.2 && @down_payment_as_pers_right > session[:min_down_pmt] ? '#FFFF0B' : @down_payment_as_pers_color_right
  end

  def generate_csv(vars)
    attributes = %w{name default}

    CSV.generate(headers: true) do |csv|
      csv << ['name', 'value']

      if params[:back_to_assumptions]
        vars.each do |key, value|
          csv << [key, value]
        end
      else
        vars.each do |var|
          csv << attributes.map{ |attr| var.send(attr) }
        end
      end
    end
  end
end
