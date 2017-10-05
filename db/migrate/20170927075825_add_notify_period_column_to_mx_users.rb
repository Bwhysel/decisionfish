class AddNotifyPeriodColumnToMxUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :mx_users, :notify_period, :integer, default: nil
  end
end
