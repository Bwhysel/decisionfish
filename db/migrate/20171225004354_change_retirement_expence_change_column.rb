class ChangeRetirementExpenceChangeColumn < ActiveRecord::Migration[5.1]
  def change
    change_column :finance_assumptions, :retirement_expence_change, :decimal
  end
end
