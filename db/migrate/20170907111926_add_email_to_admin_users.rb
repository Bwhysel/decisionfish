class AddEmailToAdminUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :admin_users, :email, :string
  end
end
