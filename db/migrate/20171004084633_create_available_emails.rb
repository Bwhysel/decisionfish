class CreateAvailableEmails < ActiveRecord::Migration[5.1]
  def change
    create_table :available_emails do |t|
      t.string :email_pattern
      t.integer :used_count, default: 0
      t.timestamps
    end
  end
end
