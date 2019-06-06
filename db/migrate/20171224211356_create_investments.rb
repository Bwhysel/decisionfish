class CreateInvestments < ActiveRecord::Migration[5.1]
  def change
    create_table :investments do |t|
      t.integer :user_id
      t.integer :efund_months, default: 6
      t.integer :efund_current, default: 0
      t.decimal :p401_percent_income_1, default: 3
      t.decimal :p401_percent_income_2, default: 3
      t.decimal :p401_percent_match_1, default: 50
      t.decimal :p401_percent_match_2, default: 50
      t.jsonb :your_amounts, default: {}
      t.jsonb :new_charges, default: {}
      t.timestamps
    end
    add_index :investments, :user_id
  end
end
