class AddLastPositionAtColumnToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :last_position_at, :string
  end
end
