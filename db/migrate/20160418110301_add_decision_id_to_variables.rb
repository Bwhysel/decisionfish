class AddDecisionIdToVariables < ActiveRecord::Migration
  def change
    add_column :variables, :decision_id, :integer
  end
end
