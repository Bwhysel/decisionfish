class CreateJokes < ActiveRecord::Migration[5.1]
  def change
    create_table :jokes do |t|
      t.text :content

      t.timestamps
    end
  end
end
