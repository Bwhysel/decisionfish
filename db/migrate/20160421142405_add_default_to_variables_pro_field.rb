class AddDefaultToVariablesProField < ActiveRecord::Migration
  def change
    change_column :variables, :pro, :boolean, default: false
  end
end
