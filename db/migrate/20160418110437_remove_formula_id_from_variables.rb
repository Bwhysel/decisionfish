class RemoveFormulaIdFromVariables < ActiveRecord::Migration
  def change
    remove_column :variables, :formula_id
  end
end
