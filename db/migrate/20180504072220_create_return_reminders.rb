class CreateReturnReminders < ActiveRecord::Migration[5.1]
  def change
    create_table :return_reminders do |t|
      t.references :user, foreign_key: true, index: true
      t.integer :notify_period, default: 1
      t.datetime :next_time
      t.timestamps
    end
  end
end
