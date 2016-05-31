module VariablesHelper

  def set_var_class(variable)
    if variable.class == Array
      var = @variables.find_by(name: variable[0].to_s)
    else
      var = variable
    end
    var.order
  end

  def set_tooltip_pro_pages(title)
    case title
    when 'Home Price'
      "The maximum price you pay for a home."
    when 'Closing &amp; Move-In'
      "Legal fees, title insurance and other fees and expenses for buying the home plus the cost of movers, renovations, furniture and all other expenses."
    when 'Loan Fees/Pts'
      "Bank fees for providing the loan plus 'points', the up front payment you make to reduce the interest rate on your mortgage."
    when "Loan Amount"
      "The size of the mortgage."
    when "Cash"
      "Cash that you contribute to the purchase of the home, in addition to the loan proceeds."
    when "Principal &amp; Interest"
      "Principal is the amount of your monthly payment that reduces the amount of loan that is outstanding. Interest is the portion of your payment that you pay the bank for borrowing their money."
    when "PMI"
      "Private Mortgage Insurance is insurance that you buy that protects the bank in case of default and is generally required when the down payment is less than 20% of the home value."
    when "Add&#39;l Home Expenses"
      "If you are moving into a larger or more expensive home, maintenance, utilities and other costs may be higher."
    when "Interest Deduction"
      "If you itemize your deductions when you prepare your taxes, in most cases, your can include mortage interest as a deduction. This reduces your tax bill. Check with your tax accountant."
    when "Down Payment"
      "The amount of cash, after expenses that goes to the purchase."
    when "Down pmt as &#37;"
      "Down payment as a percent of the home price. "
    when "DTI (Front End)"
      "Divide required housing payments payments by income. A standard bank measure of affordability."
    when "DTI (Back End)"
      "Divide required housing payments plus other debt payments by income. A standard bank measure of affordability."
    when "Change In Housing Expense"
      "The amount by which your total housing costs will increase (decrease) as a result of buying the new home."
    when "New Savings Rate"
      "The percentage of your income that you may be able to save after the purchase."
    when "Future Wealth"
      "Your savings after 30 years based on your current savings habits, adjusted for the change in housing expenses. Negative means you have borrowed money or saved less."
    end
  end

  def set_tooltip_pro(variable)
    if variable.class == Array
      var = @variables.find_by(name: variable[0].to_s)
    else
      var = variable
    end

    case var.name
    when 'mort_rate'
      return "The annualized interest rate paid on the loan."
    when 'fees_and_pts'
      return "The percentage of the loan amount that is paid to the bank at closing. It includes mandatory bank fees and points. Points are usually voluntary payments by the borrower that reduce the Mortgage Rate."
    when 'term'
      return "The number of years that your loan is scheduled to be outstanding."
    when 'mort_ins'
      return "Private Mortgage Insurance (PMI) is a policy purchased by the borrower, for the benefit of the lender, when the downpayment is less than 20%. "
    when 'closing_cost'
      return "Closing costs are costs of buying the property including lawyer fees, home inspection (to make sure the home is safe and everything is in working order) and appraisals (an independent estimate of the home's fair value). Move-in costs include repairs, renovations, appliances, furniture, movers and other costs paid around the time you move-in."
    when 'mort_rate'
      return "The annualized interest rate paid on the loan."
    when 'prop_taxes'
      return "Local taxes; enter the yearly amount as a percentage of the purchase price."
    when 'home_ins'
      return "Home owners insurance; enter the yearly amount as a percentage of the purchase price."
    when 'add_exp'
      return "Yearly Home Ownership Association, condo fees, utilties, trash, repair and maintenance expenses may increase when moving to a larger home or when moving from renting to buying"
    when 'income_tax'
      return "The Federal, State and Local tax rate applied to your income. This should be set to zero if you do not itemize or if you don't want to account for tax deduction of mortgage interest payments."
    when 'max_dti_wo'
      return "Also called the ""Front-End"" Debt-to-Income (DTI) ratio. Banks will calculate a mortgage amount so that the monthly payment does not exceed this percentage of income."
    when 'max_dti_with'
      return "Also called the ""Back-End"" Debt-to-Income (DTI) ratio. Banks will calculate a mortgage amount so that the monthly payment, plus credit card and other debt payments, does not exceed this percentage of income."
    when 'min_down_pmt'
      return "This is the smallest percentage of the home value that the buyer intends to pay at closing. Generally, higher down payments will reduce, or if at least 20%, eliminate Private Mortgage Insurance fee."
    when 'saving_rate_goal'
      return "Decision Fish will calculate the home value that results in mortgage and home expenses that are low enough to allow you to save this percentage of income."
    when 'saving_int_rate'
      return "This is the rate earned on savings."
    end
  end

  def set_tooltip(variable)
    if variable.class == Array
      var = @variables.find_by(name: variable[0].to_s)
    else
      var = variable
    end

    case var.order
    when 1
      return "Of course,  the more you earn, the more you can afford to spend on a home!"
    when 2
      return "Your current housing expenses are a starting point to determine what you can afford. An affordable home will permit you to continue saving."
    when 3
      return "Larger debt payments reduce the amount banks will lend you."
    when 4
      return "If you're saving more than you need to, you may be able to afford to increase your housing expense. If you are willing and able to cut your expenses in order to afford a more expensive home, add that amount here."
    when 5
      return "Cash is King! More cash allows you to borrow less, which reduces your mortgage payments and makes higher priced homes  affordable. If you put 20% down, banks won't make you buy Private Mortgage Insurance (PMI). "
    end
  end

  def set_step(variable)
    case variable.name
    when "cash_now"
      return 1000
    when "spend_month", "income_month"
      return 100
    when "saving_month", "debt_month"
      return 10
    end
  end

  def set_image(variable)
    case variable.order
    when 1
      return "start_fish.png"
    when 2
      return "1_step_fish.png"
    when 3
      return "2_step_fish.png"
    when 4
      return "3_step_fish.png"
    when 5
      return "4_step_fish.png"
    end
  end

  def set_step_title(variable)
    case variable.order
     when 1
       return "<h4>Congratulations on deciding to <br> take control of this decision!</h4>"
     when 2
       return "<h4>Well done. Next question:</h4>"
     when 3
       return "<h4>Almost half-way done!</h4>"
     when 4
       return "<h4>Keep going!</h4>"
     when 5
       return "<h4>Last one!</h4>"
     end
  end

  def set_var_title_for_assumptions(var)
    var.class == Array ? name = var[0].to_s : name = var.name

    case name
    when 'income_month'
      return "1. Income"
    when 'spend_month'
      return "2. Housing Costs"
    when 'debt_month'
      return "3. Debt Payments"
    when 'saving_month'
      return "4. Saving"
    when 'cash_now'
      return "5. Cash"
    end
  end

  def var_type(var)
    if var.class == Array
      @variables.find_by(name: var[0].to_s).type
    else
      var.type
    end
  end

  def var_name(var)
    if var.class == Array
      @variables.find_by(name: var[0].to_s).name
    else
      var.name
    end
  end
end
