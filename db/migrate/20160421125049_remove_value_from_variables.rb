class RemoveValueFromVariables < ActiveRecord::Migration
  def change
    remove_column :variables, :value
  end
end
