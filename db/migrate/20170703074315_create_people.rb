class CreatePeople < ActiveRecord::Migration[5.1]
  def change
    create_table :people do |t|
      t.integer :user_id
      t.integer :age
      t.integer :income
      t.string :name
      t.string :sex

      t.timestamps
    end
    add_index :people, :user_id
  end
end
