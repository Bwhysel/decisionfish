class CreateIdeas < ActiveRecord::Migration[5.1]
  def change
    create_table :ideas do |t|
      t.integer :user_id
      t.string  :need
      t.string  :user_name
      t.string  :user_email
      t.text    :content
      t.integer :saves_money, default: 0
      t.boolean :reported, default: false
      t.boolean :approved, default: false
      t.timestamps
    end

    add_index :ideas, :user_id
  end
end
