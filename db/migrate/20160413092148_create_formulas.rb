class CreateFormulas < ActiveRecord::Migration
  def change
    create_table :formulas do |t|
      t.string :title
      t.string :equation
      t.integer :decision_id

      t.timestamps null: false
    end
  end
end
