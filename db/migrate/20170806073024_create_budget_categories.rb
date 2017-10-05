class CreateBudgetCategories < ActiveRecord::Migration[5.1]
  def change
    create_table :budget_categories do |t|
      t.integer :user_id
      t.integer :housing
      t.integer :trasportation
      t.integer :health_care
      t.integer :insurance
      t.integer :groceries
      t.integer :dining_out
      t.integer :personal_care
      t.integer :clothing
      t.integer :entertaining
      t.integer :fitness
      t.integer :education
      t.integer :charity
      t.integer :vacation
      t.integer :fun
      t.integer :everything
      t.integer :credit_card
      t.integer :savings
      t.string :fun_category
      t.timestamps
    end
    add_index :budget_categories, :user_id
  end
end
