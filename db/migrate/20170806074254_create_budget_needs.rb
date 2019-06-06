class CreateBudgetNeeds < ActiveRecord::Migration[5.1]
  def change
    create_table :budget_needs do |t|
      t.integer :user_id
      t.boolean :basics_met
      t.boolean :love_met
      t.boolean :respect_met
      t.boolean :control_met
      t.boolean :expert_met
      t.boolean :helping_met
      t.boolean :fun_met
      t.integer :basics_value
      t.integer :love_value
      t.integer :respect_value
      t.integer :control_value
      t.integer :expert_value
      t.integer :helping_value
      t.integer :fun_value
      t.integer :none_value

      t.timestamps
    end
    add_index :budget_needs, :user_id
  end
end
