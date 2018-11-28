class AddLoginIpColumnToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :login_ip, :string
  end
end
