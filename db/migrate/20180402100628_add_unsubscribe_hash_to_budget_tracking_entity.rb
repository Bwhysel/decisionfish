class AddUnsubscribeHashToBudgetTrackingEntity < ActiveRecord::Migration[5.1]
  def change
    add_column :budget_tracking_entities, :unsubscribe_hash, :string
  end
end
