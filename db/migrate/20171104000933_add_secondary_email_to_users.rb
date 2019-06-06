class AddSecondaryEmailToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :email2, :string
  end
end
