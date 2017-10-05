class CreateBudgetTrackingEntities < ActiveRecord::Migration[5.1]
  def change
    create_table :budget_tracking_entities do |t|
      t.integer :user_id
      t.integer :mx_user_id
      t.string :other_email
      t.integer :notify_period

      t.timestamps
    end
  end
end
