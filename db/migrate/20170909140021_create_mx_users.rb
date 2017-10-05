class CreateMxUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :mx_users do |t|
      t.integer :user_id
      t.string :guid
      t.boolean :is_disabled

      t.timestamps
    end
    add_index :mx_users, :user_id
  end
end
