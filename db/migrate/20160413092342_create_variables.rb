class CreateVariables < ActiveRecord::Migration
  def change
    create_table :variables do |t|
      t.string :title
      t.text :description
      t.string :name
      t.integer :formula_id

      t.timestamps null: false
    end
  end
end
