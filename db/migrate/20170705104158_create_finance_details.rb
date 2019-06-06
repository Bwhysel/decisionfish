class CreateFinanceDetails < ActiveRecord::Migration[5.1]
  def change
    create_table :finance_details do |t|
      t.integer :cash, default: 0
      t.integer :college_savings, default: 0
      t.integer :retirement_savings, default: 0
      t.integer :credit_cards, default: 0
      t.integer :student_loans, default: 0
      t.integer :other_debts, default: 0
      t.integer :home_value, default: 0
      t.integer :mortgage, default: 0
      t.integer :user_id

      t.timestamps
    end
    add_index :finance_details, :user_id
  end
end
