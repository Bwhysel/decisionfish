class CreateMxTransactions < ActiveRecord::Migration[5.1]
  def change
    create_table :mx_transactions do |t|
      t.string   :guid
      t.integer  :user_id
      t.integer  :mx_user_id
      t.decimal  :amount
      t.string   :our_category
      t.string   :top_level_category
      t.string   :category
      t.string   :status
      t.date     :date
      t.datetime :transacted_at
      t.timestamps
    end

    add_index :mx_transactions, :user_id
    add_index :mx_transactions, :mx_user_id
    add_index :mx_transactions, :guid
  end
end
