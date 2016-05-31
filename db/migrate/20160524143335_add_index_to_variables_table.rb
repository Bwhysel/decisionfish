class AddIndexToVariablesTable < ActiveRecord::Migration
  def change
    add_index :variables, :name
  end
end
