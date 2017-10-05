class AddChildrenColumnToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :children, :integer, array: true, default: []
  end
end
