# ----------------------- Not a pro
Variable.seed do |s|
  s.id = 1
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "How much do you earn every month?"
  s.name = "income_month"
  s.description = "Wages (include any expected raises), tips, interest, pension... Before taxes."
  s.default = 7000
  s.order = 1
  s.pro = false
end

Variable.seed do |s|
  s.id = 2
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "What do you spend on housing every month?"
  s.name = "spend_month"
  s.description = "Rent, mortgage, taxes, insurance...An estimate is OK for now."
  s.default = 1500
  s.order = 2
  s.pro = false
end

Variable.seed do |s|
  s.id = 3
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "What do you pay on your debt every month?"
  s.name = "debt_month"
  s.description = "Credit cards, student loans, auto loans,
     alimony, child  support... but not home mortgages."
  s.default = 500
  s.order = 3
  s.pro = false
end

Variable.seed do |s|
  s.id = 4
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "How much are you saving each month?"
  s.name = "saving_month"
  s.description = "How much you have left over month to put towards saving
     and investments, on average."
  s.default = 250
  s.order = 4
  s.pro = false
end

Variable.seed do |s|
  s.id = 5
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "How much cash do you have?"
  s.name = "cash_now"
  s.description = "Cash you have for a down payment and
     closing costs. Include the sale
     of your current home after paying off any mortgages."
  s.default = 40000
  s.order = 5
  s.pro = false
end

Variable.seed do |s|
  s.id = 6
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "What is the maximum you will spend on a new home?"
  s.name = "will_spend"
  s.description = "Please enter your maximum price above."
  s.default = 260000
  s.order = 6
  s.pro = false
end
# --------------------- Not a pro

# --------------------- PRO

Variable.seed do |s|
  s.id = 7
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Mortgage Rate"
  s.name = "mort_rate"
  s.description = "Mortgage Rate"
  s.default = 0.03760
  s.order = 7
  s.pro = true
end

Variable.seed do |s|
  s.id = 8
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Fees and Points"
  s.name = "fees_and_pts"
  s.description = "Fees and Points"
  s.default = 0.00600
  s.order = 8
  s.pro = true
end

Variable.seed do |s|
  s.id = 9
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "Term (yrs)"
  s.name = "term"
  s.description = "Term (yrs)"
  s.default = 30
  s.order = 9
  s.pro = true
end

Variable.seed do |s|
  s.id = 10
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Mortgage Insurance"
  s.name = "mort_ins"
  s.description = "Mortgage Insurance"
  s.default = 0.0062
  s.order = 10
  s.pro = true
end

Variable.seed do |s|
  s.id = 11
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "Closing and Move-In"
  s.name = "closing_cost"
  s.description = "Closing and Move-In"
  s.default = 20000
  s.order = 11
  s.pro = true
end

Variable.seed do |s|
  s.id = 12
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Property Taxes"
  s.name = "prop_taxes"
  s.description = "Property Taxes"
  s.default = 0.015
  s.order = 12
  s.pro = true
end

Variable.seed do |s|
  s.id = 13
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Home owners Ins."
  s.name = "home_ins"
  s.description = "Home owners Ins."
  s.default = 0.005
  s.order = 13
  s.pro = true
end

Variable.seed do |s|
  s.id = 14
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "Additional Home Expenses"
  s.name = "add_exp"
  s.description = "Additional Home Expenses"
  s.default = 1000
  s.order = 14
  s.pro = true
end

Variable.seed do |s|
  s.id = 15
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Income Tax Rate"
  s.name = "income_tax"
  s.description = "Income Tax Rate"
  s.default = 0.25
  s.order = 15
  s.pro = true
end

Variable.seed do |s|
  s.id = 16
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Max. DTI (w/o Debt)"
  s.name = "max_dti_wo"
  s.description = "Max. DTI (w/o Debt)"
  s.default = 0.28
  s.order = 16
  s.pro = true
end

Variable.seed do |s|
  s.id = 17
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Max. DTI (w/ Debt)"
  s.name = "max_dti_with"
  s.description = "Max. DTI (w/ Debt)"
  s.default = 0.36
  s.order = 17
  s.pro = true
end

Variable.seed do |s|
  s.id = 18
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Min. Down Pmt"
  s.name = "min_down_pmt"
  s.description = "Min. Down Pmt"
  s.default = 0.03
  s.order = 18
  s.pro = true
end

Variable.seed do |s|
  s.id = 19
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Savings Rate Goal"
  s.name = "saving_rate_goal"
  s.description = "Savings Rate Goal"
  s.default = 0.10
  s.order = 19
  s.pro = true
end

Variable.seed do |s|
  s.id = 20
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Savings Int. Rate"
  s.name = "saving_int_rate"
  s.description = "Savings Int. Rate"
  s.default = 0.02
  s.order = 20
  s.pro = true
end

# --------------------- PRO

# --------------------- default set by admin
Variable.seed do |s|
  s.id = 21
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Avg_30"
  s.name = "Avg_30"
  s.description = "default set by admin"
  s.default = ""
  s.order = 21
  s.pro = true
end

Variable.seed do |s|
  s.id = 22
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "avg_15"
  s.name = "avg_15"
  s.description = "default set by admin"
  s.default = ""
  s.order = 22
  s.pro = true
end

Variable.seed do |s|
  s.id = 23
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "avg_5"
  s.name = "avg_5"
  s.description = "default set by admin"
  s.default = ""
  s.order = 23
  s.pro = true
end

Variable.seed do |s|
  s.id = 24
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "avg_1"
  s.name = "avg_1"
  s.description = "default set by admin"
  s.default = ""
  s.order = 24
  s.pro = true
end

Variable.seed do |s|
  s.id = 25
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "fees_points_30"
  s.name = "fees_points_30"
  s.description = "default set by admin"
  s.default = ""
  s.order = 25
  s.pro = true
end

Variable.seed do |s|
  s.id = 26
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "fees_points_15"
  s.name = "fees_points_15"
  s.description = "default set by admin"
  s.default = ""
  s.order = 26
  s.pro = true
end

Variable.seed do |s|
  s.id = 27
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "fees_points_5"
  s.name = "fees_points_5"
  s.description = "default set by admin"
  s.default = ""
  s.order = 27
  s.pro = true
end

Variable.seed do |s|
  s.id = 28
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "fees_points_1"
  s.name = "fees_points_1"
  s.description = "default set by admin"
  s.default = ""
  s.order = 28
  s.pro = true
end

Variable.seed do |s|
  s.id = 29
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "margin30"
  s.name = "margin30"
  s.description = "default set by admin"
  s.default = ""
  s.order = 29
  s.pro = true
end

Variable.seed do |s|
  s.id = 30
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "margin15"
  s.name = "margin15"
  s.description = "default set by admin"
  s.default = ""
  s.order = 30
  s.pro = true
end

Variable.seed do |s|
  s.id = 31
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "margin5"
  s.name = "margin5"
  s.description = "default set by admin"
  s.default = ""
  s.order = 31
  s.pro = true
end

Variable.seed do |s|
  s.id = 32
  s.decision_id = 1
  s.type = "IntegerVariable"
  s.title = "margin1"
  s.name = "margin1"
  s.description = "default set by admin"
  s.default = ""
  s.order = 32
  s.pro = true
end

Variable.seed do |s|
  s.id = 33
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Max DF Bank"
  s.name = "max_df_bank"
  s.description = "Max DF Bank"
  s.default = 0.9
  s.order = 33
  s.pro = true
end

Variable.seed do |s|
  s.id = 34
  s.decision_id = 1
  s.type = "FloatVariable"
  s.title = "Cut Exp Incr"
  s.name = "cut_exp_incr"
  s.description = "Cut Exp Incr"
  s.default = 0.01
  s.order = 34
  s.pro = true
end
# --------------------- default set by admin
