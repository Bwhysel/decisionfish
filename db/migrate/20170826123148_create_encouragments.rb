class CreateEncouragments < ActiveRecord::Migration[5.1]
  def change
    create_table :encouragments do |t|
      t.text :content

      t.timestamps
    end
  end
end
