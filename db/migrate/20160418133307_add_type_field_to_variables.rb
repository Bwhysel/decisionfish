class AddTypeFieldToVariables < ActiveRecord::Migration
  def change
    add_column :variables, :type, :string
  end
end
