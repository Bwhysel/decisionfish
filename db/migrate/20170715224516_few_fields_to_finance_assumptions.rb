class FewFieldsToFinanceAssumptions < ActiveRecord::Migration[5.1]
  def change
    add_column :finance_assumptions, :value_of_housework, :integer
    add_column :finance_assumptions, :income_replacement, :decimal
  end
end
