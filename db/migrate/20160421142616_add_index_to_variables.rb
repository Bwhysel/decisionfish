class AddIndexToVariables < ActiveRecord::Migration
  def change
    add_index :variables, :decision_id
  end
end
