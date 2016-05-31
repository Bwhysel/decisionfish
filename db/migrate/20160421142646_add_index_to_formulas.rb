class AddIndexToFormulas < ActiveRecord::Migration
  def change
    add_index :formulas, :decision_id
  end
end
