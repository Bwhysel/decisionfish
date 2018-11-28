class DropMxTransactions < ActiveRecord::Migration[5.1]
  def self.up
    drop_table :mx_transactions
  end
end
