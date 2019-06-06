class CreateLoans < ActiveRecord::Migration[5.1]
  def change
    create_table :loans do |t|
      t.integer :user_id
      t.integer :credit_cards, default: [], array: true
      t.integer :student_loans, default: [], array: true
      t.integer :other_debts, default: [], array: true
      t.string  :credit_cards_names, default: [], array: true
      t.string  :sudent_loans_names, default: [], array: true
      t.string  :other_debts_names, default: [], array: true
      t.decimal :credit_cards_rates, default: [], array: true
      t.decimal :sudent_loans_rates, default: [], array: true
      t.decimal :other_debts_rates, default: [], array: true
      t.timestamps
    end
  end
end
