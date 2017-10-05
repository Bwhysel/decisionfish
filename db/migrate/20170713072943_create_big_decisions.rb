class CreateBigDecisions < ActiveRecord::Migration[5.1]
  def change
    create_table :big_decisions do |t|
      t.integer :user_id
      t.integer :monthly_savings
      t.integer :retire_age
      t.decimal :parent_contribute

      t.timestamps
    end
    add_index :big_decisions, :user_id
  end
end
