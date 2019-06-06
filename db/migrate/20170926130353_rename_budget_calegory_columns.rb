class RenameBudgetCalegoryColumns < ActiveRecord::Migration[5.1]
  def change
    rename_column :budget_categories, :trasportation,        :transportation
    rename_column :budget_categories, :trasportation_diff,   :transportation_diff
    rename_column :budget_categories, :trasportation_change, :transportation_spend

    fields = [
      :housing, :health_care, :insurance, :groceries, :dining_out,
      :personal_care, :clothing, :entertaining, :fitness, :education,
      :charity, :vacation, :fun, :credit_card, :savings
    ]
    fields.each do |field|
      rename_column :budget_categories, "#{field}_change", "#{field}_spend"
    end


  end
end
