class AddFieldsToVariables < ActiveRecord::Migration
  def change
    add_column :variables, :value, :decimal
    add_column :variables, :default, :decimal
    add_column :variables, :order, :integer
    add_column :variables, :pro, :boolean
  end
end
