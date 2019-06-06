class AddColumnsToBudgetCategories < ActiveRecord::Migration[5.1]
  def change
    add_column :budget_categories, :housing_change, :boolean
    add_column :budget_categories, :trasportation_change, :boolean
    add_column :budget_categories, :health_care_change, :boolean
    add_column :budget_categories, :insurance_change, :boolean
    add_column :budget_categories, :groceries_change, :boolean
    add_column :budget_categories, :dining_out_change, :boolean
    add_column :budget_categories, :personal_care_change, :boolean
    add_column :budget_categories, :clothing_change, :boolean
    add_column :budget_categories, :entertaining_change, :boolean
    add_column :budget_categories, :fitness_change, :boolean
    add_column :budget_categories, :education_change, :boolean
    add_column :budget_categories, :charity_change, :boolean
    add_column :budget_categories, :vacation_change, :boolean
    add_column :budget_categories, :fun_change, :boolean
    add_column :budget_categories, :credit_card_change, :boolean
    add_column :budget_categories, :savings_change, :boolean
    add_column :budget_categories, :fun_caption, :string
    rename_column :budget_categories, :fun_category, :fun_need

  end
end
