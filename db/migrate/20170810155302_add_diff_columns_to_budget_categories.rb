class AddDiffColumnsToBudgetCategories < ActiveRecord::Migration[5.1]
  def change
    add_column :budget_categories, :housing_diff, :integer, default: 0
    add_column :budget_categories, :trasportation_diff, :integer, default: 0
    add_column :budget_categories, :health_care_diff, :integer, default: 0
    add_column :budget_categories, :insurance_diff, :integer, default: 0
    add_column :budget_categories, :groceries_diff, :integer, default: 0
    add_column :budget_categories, :dining_out_diff, :integer, default: 0
    add_column :budget_categories, :personal_care_diff, :integer, default: 0
    add_column :budget_categories, :clothing_diff, :integer, default: 0
    add_column :budget_categories, :entertaining_diff, :integer, default: 0
    add_column :budget_categories, :fitness_diff, :integer, default: 0
    add_column :budget_categories, :education_diff, :integer, default: 0
    add_column :budget_categories, :charity_diff, :integer, default: 0
    add_column :budget_categories, :vacation_diff, :integer, default: 0
    add_column :budget_categories, :fun_diff, :integer, default: 0
    add_column :budget_categories, :everything_diff, :integer, default: 0
    add_column :budget_categories, :credit_card_diff, :integer, default: 0
    add_column :budget_categories, :savings_diff, :integer, default: 0
  end
end
