Formula.seed do |s|
  s.id = 1
  s.decision_id = 1
  s.title = "Banks May Tell You"
  s.equation = "MAX(0, MIN(((max_dti_wo * income_month / (mvd + mort_ins / 12) * (1 - fees_and_pts) - closing_cost + cash_now) / (1 + (prop_taxes + home_ins) / 12 / (mvd + mort_ins / 12) * (1 - fees_and_pts))), (((max_dti_with * income_month - debt_month) / (mvd + mort_ins / 12) * (1 - fees_and_pts) - closing_cost + cash_now) / (1 + (prop_taxes + home_ins) / 12 / (mvd + mort_ins / 12) * (1 - fees_and_pts))), ((closing_cost - cash_now) / ((1 - min_down_pmt) * (1 - fees_and_pts) - 1))))"
end

Formula.seed do |s|
  s.id = 2
  s.decision_id = 1
  s.title = "Decision Fish suggests"
  s.equation = "MIN(max_df_bank * banks_tell, ((saving_month - saving_rate_goal * income_month + spend_month - add_exp / 12) * (1 - fees_and_pts) - (mvd + mort_ins / 12 - mort_rate * income_tax / 12) * (closing_cost - cash_now)) / ((mvd + mort_ins / 12 - mort_rate * income_tax / 12) + (prop_taxes + home_ins) / 12 * (1 - fees_and_pts)))"
end

Formula.seed do |s|
  s.id = 3
  s.decision_id = 1
  s.title = "Loan Amount"
  s.equation = "(home_value + closing_cost - cash_now ) / (1 - fees_and_pts)"
end

Formula.seed do |s|
  s.id = 4
  s.decision_id = 1
  s.title = "Loan Fees/Pts"
  s.equation = "fees_and_pts * loan_amount"
end

Formula.seed do |s|
  s.id = 5
  s.decision_id = 1
  s.title = "Property Taxes"
  s.equation = "prop_taxes * home_value / 12"
end

Formula.seed do |s|
  s.id = 6
  s.decision_id = 1
  s.title = "Home Owners Ins."
  s.equation = "home_ins * home_value / 12"
end

Formula.seed do |s|
  s.id = 7
  s.decision_id = 1
  s.title = "Principal & Interest"
  s.equation = "loan_amount * mvd"
end

Formula.seed do |s|
  s.id = 8
  s.decision_id = 1
  s.title = "Add`l Home Expenses"
  s.equation = "add_exp / 12"
end

Formula.seed do |s|
  s.id = 9
  s.decision_id = 1
  s.title = "Interest Deduction"
  s.equation = "-1 * income_tax * loan_amount * mort_rate / 12"
end

Formula.seed do |s|
  s.id = 10
  s.decision_id = 1
  s.title = "Down Payment"
  s.equation = "home_value - loan_amount"
end

Formula.seed do |s|
  s.id = 11
  s.decision_id = 1
  s.title = "Down Pmt as %"
  s.equation = "down_payment / home_value"
end

Formula.seed do |s|
  s.id = 12
  s.decision_id = 1
  s.title = "PMI"
  s.equation = "loan_amount * mort_ins / 12 * if ( down_payment_as_pers < 0.2 , 1, 0)"
end

Formula.seed do |s|
  s.id = 13
  s.decision_id = 1
  s.title = "Net Housing Expense"
  s.equation = "monthly_payments + interest_deduction + add_home_exp"
end

Formula.seed do |s|
  s.id = 14
  s.decision_id = 1
  s.title = "DTI (Front End)"
  s.equation = "monthly_payments / income_month"
end

Formula.seed do |s|
  s.id = 15
  s.decision_id = 1
  s.title = "DTI (Back End)"
  s.equation = "(monthly_payments + debt_month) / income_month"
end

Formula.seed do |s|
  s.id = 16
  s.decision_id = 1
  s.title = "Change In Housing Expense"
  s.equation = "net_housing_expenses - spend_month"
end

Formula.seed do |s|
  s.id = 17
  s.decision_id = 1
  s.title = "New Savings Rate"
  s.equation = "(saving_month - change_in_housing_exp) / income_month"
end

Formula.seed do |s|
  s.id = 18
  s.decision_id = 1
  s.title = "Down Home Value"
  s.equation = "(closing_cost - cash_now) / ((1 - min_down_pmt) * (1 - fees_and_pts) - 1)"
end

Formula.seed do |s|
  s.id = 19
  s.decision_id = 1
  s.title = "Mortgage"
  s.equation = "(max_dti_wo * income_month / (mvd + mort_ins / 12) * (1 - fees_and_pts) - closing_cost + cash_now) / (1 + (prop_taxes + home_ins) / 12 / (mvd + mort_ins / 12) * (1 - fees_and_pts))"
end

Formula.seed do |s|
  s.id = 20
  s.decision_id = 1
  s.title = "All Debt"
  s.equation = "((max_dti_with * income_month - debt_month) / (mvd + mort_ins / 12) * (1 - fees_and_pts) - closing_cost + cash_now) / (1 + (prop_taxes + home_ins) / 12 / (mvd + mort_ins / 12) * (1 - fees_and_pts))"
end

Formula.seed do |s|
  s.id = 21
  s.decision_id = 1
  s.title = "Cut Expenses By (Affordability Analysis)"
  s.equation = "ROUND(cut_exp_incr * income_month, -1)"
end

Formula.seed do |s|
  s.id = 22
  s.decision_id = 1
  s.title = "Decision Fish (Affordability Analysis)"
  s.equation = "MIN(max_df_bank * banks_tell, ((saving_month + cut_expenses - saving_rate_goal * income_month + spend_month - add_exp / 12) * (1 - fees_and_pts) - (mvd + mort_ins / 12 - mort_rate * income_tax / 12) * (closing_cost - cash_now)) / ((mvd + mort_ins / 12 - mort_rate * income_tax / 12) + (prop_taxes + home_ins) / 12 * (1 - fees_and_pts)))"
end

Formula.seed do |s|
  s.id = 23
  s.decision_id = 1
  s.title = "Home Price (Target Analysis)"
  s.equation = "MIN(max_df_bank * banks_tell, ((saving_month - saving_rate_chart * income_month + spend_month - add_exp / 12) * (1 - fees_and_pts) - (mvd + mort_ins / 12 - mort_rate * income_tax / 12) * (closing_cost - cash_now)) / ((mvd + mort_ins / 12 - mort_rate * income_tax / 12) + (prop_taxes + home_ins) / 12 * (1 - fees_and_pts)))"
end

Formula.seed do |s|
  s.id = 24
  s.decision_id = 1
  s.title = "Decision Fish (Value Of Waiting)"
  s.equation = "MIN(max_df_bank * banks_tell, ((saving_month + saving_rate_goal * income_month + spend_month - add_exp / 12) * (1 - fees_and_pts) - (mvd + mort_ins / 12 - mort_rate * income_tax / 12) * (closing_cost - cash_now - months * saving_month)) / ((mvd + mort_ins / 12 - mort_rate * income_tax / 12) + (prop_taxes + home_ins) / 12 * (1 - fees_and_pts)))"
end

Formula.seed do |s|
  s.id = 25
  s.decision_id = 1
  s.title = "Bank (Value Of Waiting)"
  s.equation = "(max_dti_wo * income_month / (mvd + mort_ins / 12) * (1 - fees_and_pts) - closing_cost + cash_now + months * saving_month) / (1 + (prop_taxes + home_ins) / 12 / (mvd + mort_ins / 12) * (1 - fees_and_pts))"
end
