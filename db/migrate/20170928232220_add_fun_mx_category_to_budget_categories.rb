class AddFunMxCategoryToBudgetCategories < ActiveRecord::Migration[5.1]
  def change
    add_column :budget_categories, :fun_mx_category, :string
  end
end
