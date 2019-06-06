class FinanceDetail < ApplicationRecord
  def as_json
    {
      cash: cash,
      college_savings: college_savings,
      retirement_savings: retirement_savings,
      credit_cards: credit_cards,
      student_loans: student_loans,
      other_debts: other_debts,
      home_value: home_value,
      mortgage: mortgage
    }
  end

  def get_liquid_net_worth
    cash + college_savings + retirement_savings - credit_cards - student_loans - other_debts
  end
end
