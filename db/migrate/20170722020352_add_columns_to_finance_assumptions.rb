class AddColumnsToFinanceAssumptions < ActiveRecord::Migration[5.1]
  def change
    add_column :finance_assumptions, :rt_cash, :decimal
    add_column :finance_assumptions, :rt_fi, :decimal
    add_column :finance_assumptions, :rt_eq, :decimal
    add_column :finance_assumptions, :rt_cash_alloc, :decimal
    add_column :finance_assumptions, :rt_fi_alloc, :decimal
    add_column :finance_assumptions, :rt_eq_alloc, :decimal
    add_column :finance_assumptions, :net_college_cost, :integer
    add_column :finance_assumptions, :soc_sec1, :integer
    add_column :finance_assumptions, :soc_sec2, :integer
  end
end
